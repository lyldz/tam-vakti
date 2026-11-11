package com.tamvakti.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews
import java.util.Calendar

/*
 * Ana ekran widget'ları. Hepsi aynı veriyi (JS'in syncSchedule ile yazdığı "prayers" listesi) kullanır,
 * her vakit alarmında (AlarmReceiver), her senkronda (Scheduler), 30 dakikada bir ve gece yarısı yenilenir.
 * Geri sayımlar Chronometer ile sistem tarafından saniye saniye işler (uygulama çalışmaz).
 */

/** Ortak sağlayıcı: hangi widget güncellenirse güncellensin hepsini tazeler. */
abstract class BaseWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        Widgets.updateAll(context)
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Widgets.ACTION_TICK) { Widgets.updateAll(context); return }
        super.onReceive(context, intent)
    }
}

class SmallWidget : BaseWidget()
class RowWidget : BaseWidget()
class ListWidget : BaseWidget()
class LargeWidget : BaseWidget()
class ClockWidget : BaseWidget()
class MinimalWidget : BaseWidget()

object Widgets {
    const val ACTION_TICK = "com.tamvakti.app.WIDGET_TICK"

    private val KEYS = listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")
    private val SHORT = mapOf(
        "imsak" to "İmsak", "gunes" to "Güneş", "ogle" to "Öğle",
        "ikindi" to "İkindi", "aksam" to "Akşam", "yatsi" to "Yatsı"
    )
    private val CELL = intArrayOf(R.id.wc_cell0, R.id.wc_cell1, R.id.wc_cell2, R.id.wc_cell3, R.id.wc_cell4, R.id.wc_cell5)
    private val NAME = intArrayOf(R.id.wc_name0, R.id.wc_name1, R.id.wc_name2, R.id.wc_name3, R.id.wc_name4, R.id.wc_name5)
    private val TIME = intArrayOf(R.id.wc_time0, R.id.wc_time1, R.id.wc_time2, R.id.wc_time3, R.id.wc_time4, R.id.wc_time5)

    data class Row(val key: String, val name: String, val time: String, val millis: Long)

    /** Sıradaki vakit ve onun ait olduğu günün 6 vakti (Yatsı'dan sonra ertesi gün). */
    class Day(val rows: List<Row?>, val next: Row?, val nextIndex: Int, val tomorrow: Boolean)

    private fun dayOfNext(ctx: Context): Day {
        val arr = Store.schedule(ctx)?.optJSONArray("prayers") ?: return Day(List(6) { null }, null, -1, false)
        val now = System.currentTimeMillis()
        val all = ArrayList<Row>()
        for (i in 0 until arr.length()) {
            val o = arr.optJSONObject(i) ?: continue
            val t = o.optLong("t", 0L)
            if (t > 0) all.add(Row(o.optString("key"), o.optString("name"), o.optString("time"), t))
        }
        val next = all.filter { it.millis > now }.minByOrNull { it.millis }
            ?: return Day(List(6) { null }, null, -1, false)
        val day = dayKey(next.millis)
        val sameDay = all.filter { dayKey(it.millis) == day }
        val rows = KEYS.map { k -> sameDay.firstOrNull { it.key == k } }
        return Day(rows, next, KEYS.indexOf(next.key), day != dayKey(now))
    }

    private fun dayKey(millis: Long): Int {
        val c = Calendar.getInstance().apply { timeInMillis = millis }
        return c.get(Calendar.YEAR) * 1000 + c.get(Calendar.DAY_OF_YEAR)
    }

    /** Cuma günü Öğle hücresinde "Cuma" yazar. */
    private fun shortName(r: Row): String =
        if (r.key == "ogle" && r.name.startsWith("Cuma")) "Cuma" else SHORT[r.key] ?: r.name

    private fun nextLabel(n: Row): String = if (n.name.startsWith("Cuma")) "Cuma" else n.name

    fun updateAll(ctx: Context) {
        val app = ctx.applicationContext
        val mgr = AppWidgetManager.getInstance(app)
        val d = dayOfNext(app)
        val city = Store.city(app)

        push(app, mgr, PrayerWidget::class.java, R.layout.widget_prayer) { v -> fillClassic(v, d, city) }
        push(app, mgr, SmallWidget::class.java, R.layout.widget_small) { v ->
            v.setTextViewText(R.id.w_name, d.next?.let { "${nextLabel(it)} ${it.time}" } ?: "Tam Vakti")
            countdown(v, d.next)
        }
        push(app, mgr, RowWidget::class.java, R.layout.widget_row) { v -> fillCells(v, d) }
        push(app, mgr, ListWidget::class.java, R.layout.widget_list) { v ->
            v.setTextViewText(R.id.w_city, if (d.tomorrow) "$city • Yarın" else city)
            fillCells(v, d)
        }
        push(app, mgr, LargeWidget::class.java, R.layout.widget_large) { v ->
            v.setTextViewText(R.id.w_city, city)
            v.setTextViewText(R.id.w_name, d.next?.let { nextLabel(it) } ?: "Tam Vakti")
            v.setTextViewText(R.id.w_time, d.next?.let { "${it.time} • kalan" } ?: "Uygulamayı bir kez açın")
            countdown(v, d.next)
            fillCells(v, d)
        }
        push(app, mgr, ClockWidget::class.java, R.layout.widget_clock) { v ->
            v.setTextViewText(R.id.w_name, d.next?.let { "${nextLabel(it)} ${it.time}  •  " } ?: "Uygulamayı bir kez açın")
            countdown(v, d.next)
        }
        push(app, mgr, MinimalWidget::class.java, R.layout.widget_minimal) { v ->
            v.setTextViewText(R.id.w_name, d.next?.let { "${nextLabel(it)} ${it.time}  •  " } ?: "Tam Vakti")
            v.setTextViewText(R.id.w_city, city)
            countdown(v, d.next)
        }
        scheduleMidnight(app)
    }

    private fun push(
        app: Context, mgr: AppWidgetManager, cls: Class<*>, layout: Int, fill: (RemoteViews) -> Unit
    ) {
        val ids = mgr.getAppWidgetIds(ComponentName(app, cls))
        if (ids.isEmpty()) return
        val v = RemoteViews(app.packageName, layout)
        v.setOnClickPendingIntent(R.id.widget_root, Notifs.openAppIntent(app))
        try { fill(v) } catch (e: Exception) {}
        mgr.updateAppWidget(ids, v)
    }

    /** İlk (klasik) widget: eski kimlikleri korunur, yerleştirilmiş widget'lar bozulmaz. */
    private fun fillClassic(v: RemoteViews, d: Day, city: String) {
        v.setTextViewText(R.id.widget_city, city)
        val next = d.next
        if (next == null) {
            v.setTextViewText(R.id.widget_name, "Tam Vakti")
            v.setTextViewText(R.id.widget_time, "Uygulamayı bir kez açın")
            v.setViewVisibility(R.id.widget_countdown, View.GONE)
        } else {
            v.setTextViewText(R.id.widget_name, next.name)
            v.setTextViewText(R.id.widget_time, next.time)
            v.setViewVisibility(R.id.widget_countdown, View.VISIBLE)
            val base = SystemClock.elapsedRealtime() + (next.millis - System.currentTimeMillis())
            v.setChronometerCountDown(R.id.widget_countdown, true)
            v.setChronometer(R.id.widget_countdown, base, null, true)
        }
    }

    private fun countdown(v: RemoteViews, next: Row?) {
        if (next == null) { v.setViewVisibility(R.id.w_countdown, View.GONE); return }
        v.setViewVisibility(R.id.w_countdown, View.VISIBLE)
        val base = SystemClock.elapsedRealtime() + (next.millis - System.currentTimeMillis())
        v.setChronometerCountDown(R.id.w_countdown, true)
        v.setChronometer(R.id.w_countdown, base, null, true)
    }

    /** 6 hücre: geçen vakitler soluk, sıradaki vurgulu. */
    private fun fillCells(v: RemoteViews, d: Day) {
        val now = System.currentTimeMillis()
        val cAccent = 0xFF7DD3FC.toInt()
        val cText = 0xFFFFFFFF.toInt()
        val cText2 = 0xFFCBD5E1.toInt()
        val cPast = 0xFF5B6B82.toInt()
        for (i in 0 until 6) {
            val r = d.rows.getOrNull(i)
            v.setTextViewText(NAME[i], r?.let { shortName(it) } ?: SHORT[KEYS[i]])
            v.setTextViewText(TIME[i], r?.time ?: "--:--")
            val isNext = i == d.nextIndex
            val past = r != null && r.millis <= now
            v.setTextColor(NAME[i], if (isNext) cAccent else if (past) cPast else cText2)
            v.setTextColor(TIME[i], if (isNext) cText else if (past) cPast else cText)
            v.setInt(CELL[i], "setBackgroundResource", if (isNext) R.drawable.widget_cell_on else 0)
        }
    }

    /** Gece yarısı tarih/"Yarın" etiketi yenilensin (kesin olmayan, uyandırmayan alarm: pil dostu). */
    private fun scheduleMidnight(app: Context) {
        val c = Calendar.getInstance().apply {
            add(Calendar.DAY_OF_YEAR, 1)
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 30); set(Calendar.MILLISECOND, 0)
        }
        val intent = Intent(app, PrayerWidget::class.java).apply { action = ACTION_TICK }
        val pi = PendingIntent.getBroadcast(
            app, 4990, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        try {
            val am = app.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            am.set(AlarmManager.RTC, c.timeInMillis, pi)
        } catch (e: Exception) {}
    }
}
