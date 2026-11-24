package com.tamvakti.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Settings

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        handle(
            context,
            intent.getStringExtra("type") ?: return,
            intent.getStringExtra("title") ?: "Tam Vakti",
            intent.getStringExtra("body") ?: "",
            intent.getStringExtra("mode") ?: "bip",
            intent.getIntExtra("id", 1),
            intent.getStringExtra("name") ?: "",
            intent.getStringExtra("time") ?: "",
            intent.getStringExtra("info") ?: "",
            intent.getBooleanExtra("force_fs", false),
            intent.getLongExtra("until", 0L)
        )
    }

    companion object {
        /** mode: "bip" = telefonun bildirim sesi, "sessiz" = sessiz bildirim. */
        fun handle(
            ctx: Context, type: String, title: String, body: String, mode: String, id: Int,
            name: String = "", time: String = "", info: String = "", forceFullScreen: Boolean = false,
            silentUntil: Long = 0L
        ) {
            val app = ctx.applicationContext
            if (type == "ongoing_tick") { Notifs.refreshOngoing(app); return }
            when (type) {
                "reminder" -> {
                    // Vakit bildirimi kapalı olsa bile hatırlatma sıradaki vakit girince kendiliğinden silinsin
                    val next = Store.nextPrayer(app)
                    val remain = if (next != null) {
                        (next.millis - System.currentTimeMillis()).coerceIn(5 * 60_000L, 60 * 60_000L)
                    } else 45 * 60_000L
                    Notifs.postAlert(app, Notifs.ID_ALERT_REMINDER, title, body, quiet = mode == "sessiz", timeoutMs = remain)
                }
                "vakit" -> {
                    // Vakit girince önceki "vakitten önce" hatırlatması ve kerahat bildirimini temizle
                    Notifs.cancelAlert(app, Notifs.ID_ALERT_REMINDER)
                    Notifs.cancelAlert(app, Notifs.ID_ALERT_KERAHAT)
                    // Vakit girişinde (ve ayar açıksa) tam ekran bildirim
                    var fs: Intent? = null
                    if (forceFullScreen || Store.fullScreenEnabled(app)) {
                        val alert = PrayerAlertActivity.intent(app, name.ifBlank { title.removeSuffix(" vakti girdi") }, time, Store.city(app), info)
                        // "Diğer uygulamaların üzerinde göster" izni varsa telefon açıkken de doğrudan tam ekran açılır;
                        // yoksa sistemin tam ekran bildirimine düşülür (yalnızca ekran kapalı/kilitliyken tam ekran olur)
                        var launched = false
                        if (Settings.canDrawOverlays(app)) {
                            try { app.startActivity(alert); launched = true } catch (e: Exception) {}
                        }
                        if (!launched) fs = alert
                    }
                    val next = Store.nextPrayer(app)
                    val cleanBody = when {
                        time.isNotBlank() && next != null -> "$time · Sıradaki: ${next.name} ${next.time}"
                        time.isNotBlank() -> time
                        next != null -> "Sıradaki: ${next.name} ${next.time}"
                        else -> body
                    }
                    Notifs.postAlert(app, Notifs.ID_ALERT_VAKIT, title, cleanBody, quiet = mode == "sessiz", fullScreen = fs, timeoutMs = 60 * 60_000L)
                }
                "kerahat" -> Notifs.postAlert(app, Notifs.ID_ALERT_KERAHAT, title, body, quiet = true, timeoutMs = 45 * 60_000L)
                "silent_start" -> Silencer.start(app, silentUntil)
                "silent_end" -> Silencer.end(app)
                else -> {}
            }
            // Her alarmdan sonra widget ve sabit bildirim sıradaki vakte geçsin
            PrayerWidget.updateAll(app)
            Notifs.refreshOngoing(app)
            // Kayan pencere: kalan kurulu alarm azalınca pencereyi yenile (aynı dakikadaki diğer alarmları iptal etmez)
            if (type != "silent_start") Scheduler.rescheduleIfNeeded(app)
        }
    }
}
