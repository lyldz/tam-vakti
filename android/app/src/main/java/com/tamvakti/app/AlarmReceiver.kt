package com.tamvakti.app

import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import android.content.BroadcastReceiver

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        handle(
            context,
            intent.getStringExtra("type") ?: return,
            intent.getStringExtra("title") ?: "Tam Vakti",
            intent.getStringExtra("body") ?: "",
            intent.getStringExtra("tone") ?: "",
            intent.getStringExtra("mode") ?: "ezan",
            intent.getIntExtra("id", 1)
        )
    }

    companion object {
        fun handle(ctx: Context, type: String, title: String, body: String, tone: String, mode: String, id: Int) {
            val app = ctx.applicationContext
            when (type) {
                "reminder" -> Notifs.postAlert(app, id, title, body, quiet = mode == "sessiz")
                "kerahat" -> Notifs.postAlert(app, id, title, body, quiet = true)
                "athan" -> when (mode) {
                    "ezan" -> {
                        try {
                            val svc = Intent(app, AthanService::class.java).apply {
                                putExtra("title", title)
                                putExtra("body", body)
                                putExtra("tone", tone)
                            }
                            ContextCompat.startForegroundService(app, svc)
                        } catch (e: Exception) {
                            // Arka planda servis başlatılamazsa sesli bildirime düş
                            Notifs.postAlert(app, id, title, body, quiet = false)
                        }
                    }
                    "bip" -> Notifs.postAlert(app, id, title, body, quiet = false)
                    else -> Notifs.postAlert(app, id, title, body, quiet = true)
                }
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
