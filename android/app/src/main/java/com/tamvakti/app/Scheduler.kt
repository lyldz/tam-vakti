package com.tamvakti.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build

/** JS'ten gelen alarm listesini AlarmManager'a kurar. */
object Scheduler {
    private const val ACTION = "com.tamvakti.app.ALARM"
    private const val BASE_CODE = 5000
    /** AlarmManager uygulama başına ~500 alarmla sınırlı: yalnızca en yakın 120 olay kurulur, her alarmdan sonra pencere yenilenir. */
    private const val WINDOW = 120

    fun canScheduleExact(ctx: Context): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return true
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        return am.canScheduleExactAlarms()
    }

    fun sync(ctx: Context, json: String) {
        Store.prefs(ctx).edit().putString("schedule", json).apply()
        reschedule(ctx)
    }

    private fun baseIntent(ctx: Context): Intent =
        Intent(ctx, AlarmReceiver::class.java).apply { action = ACTION }

    private fun cancelAll(ctx: Context, am: AlarmManager) {
        val count = Store.prefs(ctx).getInt("count", 0)
        for (i in 0 until count) {
            val pi = PendingIntent.getBroadcast(
                ctx, BASE_CODE + i, baseIntent(ctx),
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            if (pi != null) {
                am.cancel(pi)
                pi.cancel()
            }
        }
    }

    /** Ayarlar ekranındaki tanı satırı için: kurulu alarm sayısı ve sıradaki kullanıcıya görünür alarm. */
    fun info(ctx: Context): String {
        val app = ctx.applicationContext
        val count = Store.prefs(app).getInt("count", 0)
        val events = Store.schedule(app)?.optJSONArray("events")
        val now = System.currentTimeMillis()
        var bestT = Long.MAX_VALUE
        var bestTitle = ""
        var bestType = ""
        if (events != null) {
            for (i in 0 until events.length()) {
                val e = events.optJSONObject(i) ?: continue
                val type = e.optString("type")
                if (type != "vakit" && type != "reminder" && type != "kerahat") continue
                val t = e.optLong("t", 0L)
                if (t > now && t < bestT) {
                    bestT = t
                    bestTitle = e.optString("title")
                    bestType = type
                }
            }
        }
        var lastT = 0L
        if (events != null) {
            for (i in 0 until events.length()) {
                val t = events.optJSONObject(i)?.optLong("t", 0L) ?: 0L
                if (t > lastT) lastT = t
            }
        }
        val o = org.json.JSONObject()
        o.put("count", count)
        o.put("lastT", lastT)
        o.put("exact", canScheduleExact(app))
        if (bestT != Long.MAX_VALUE) {
            o.put("nextT", bestT)
            o.put("nextTitle", bestTitle)
            o.put("nextType", bestType)
        }
        return o.toString()
    }

    fun reschedule(ctx: Context) {
        val app = ctx.applicationContext
        val am = app.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        cancelAll(app, am)

        val events = Store.schedule(app)?.optJSONArray("events")
        var n = 0
        var hasSilentEnd = false
        val now = System.currentTimeMillis()
        val exact = canScheduleExact(app)

        // Gelecekteki olayları zamana göre sırala, en yakın WINDOW tanesini kur
        val upcoming = ArrayList<org.json.JSONObject>()
        if (events != null) {
            for (i in 0 until events.length()) {
                val e = events.optJSONObject(i) ?: continue
                if (e.optLong("t", 0L) > now) upcoming.add(e)
            }
            upcoming.sortBy { it.optLong("t", 0L) }
        }

        run {
            for (e in upcoming.take(WINDOW)) {
                val t = e.optLong("t", 0L)
                val type = e.optString("type")
                if (type == "silent_end") hasSilentEnd = true

                val intent = baseIntent(app).apply {
                    putExtra("type", type)
                    putExtra("title", e.optString("title"))
                    putExtra("body", e.optString("body"))
                    putExtra("mode", e.optString("mode"))
                    putExtra("name", e.optString("name"))
                    putExtra("time", e.optString("time"))
                    putExtra("info", e.optString("info"))
                    putExtra("id", BASE_CODE + n)
                }
                val pi = PendingIntent.getBroadcast(
                    app, BASE_CODE + n, intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                try {
                    if (exact) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi)
                    else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi)
                } catch (se: SecurityException) {
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi)
                }
                n++
            }
        }
        Store.prefs(app).edit().putInt("count", n).apply()

        // Otomatik sessiz kapatıldıysa, bizim sessize aldığımız telefonu geri aç
        if (!hasSilentEnd) Silencer.end(app)

        PrayerWidget.updateAll(app)
        Notifs.refreshOngoing(app)
    }
}
