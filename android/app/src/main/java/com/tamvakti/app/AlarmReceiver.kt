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
            intent.getBooleanExtra("force_fs", false)
        )
    }

    companion object {
        /** mode: "bip" = telefonun bildirim sesi, "sessiz" = sessiz bildirim. */
        fun handle(
            ctx: Context, type: String, title: String, body: String, mode: String, id: Int,
            name: String = "", time: String = "", info: String = "", forceFullScreen: Boolean = false
        ) {
            val app = ctx.applicationContext
            when (type) {
                "reminder" -> Notifs.postAlert(app, id, title, body, quiet = mode == "sessiz")
                "vakit" -> {
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
                    Notifs.postAlert(app, id, title, body, quiet = mode == "sessiz", fullScreen = fs)
                }
                "kerahat" -> Notifs.postAlert(app, id, title, body, quiet = true)
                "silent_start" -> Silencer.start(app)
                "silent_end" -> Silencer.end(app)
                else -> {}
            }
            // Her alarmdan sonra widget ve sabit bildirim sıradaki vakte geçsin
            PrayerWidget.updateAll(app)
            Notifs.refreshOngoing(app)
        }
    }
}
