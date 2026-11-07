package com.tamvakti.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        handle(
            context,
            intent.getStringExtra("type") ?: return,
            intent.getStringExtra("title") ?: "Tam Vakti",
            intent.getStringExtra("body") ?: "",
            intent.getStringExtra("mode") ?: "bip",
            intent.getIntExtra("id", 1)
        )
    }

    companion object {
        /** mode: "bip" = telefonun bildirim sesi, "sessiz" = sessiz bildirim. */
        fun handle(ctx: Context, type: String, title: String, body: String, mode: String, id: Int) {
            val app = ctx.applicationContext
            when (type) {
                "reminder", "vakit" -> Notifs.postAlert(app, id, title, body, quiet = mode == "sessiz")
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
