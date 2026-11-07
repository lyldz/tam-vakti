package com.tamvakti.app

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews

/** Ana ekran widget'ı: sıradaki vakit ve geri sayım. */
class PrayerWidget : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        updateAll(context)
    }

    companion object {
        fun updateAll(ctx: Context) {
            val app = ctx.applicationContext
            val mgr = AppWidgetManager.getInstance(app)
            val ids = mgr.getAppWidgetIds(ComponentName(app, PrayerWidget::class.java))
            if (ids.isEmpty()) return

            val views = RemoteViews(app.packageName, R.layout.widget_prayer)
            views.setOnClickPendingIntent(R.id.widget_root, Notifs.openAppIntent(app))
            views.setTextViewText(R.id.widget_city, Store.city(app))

            val next = Store.nextPrayer(app)
            if (next == null) {
                views.setTextViewText(R.id.widget_name, "Tam Vakti")
                views.setTextViewText(R.id.widget_time, "Uygulamayı bir kez açın")
                views.setViewVisibility(R.id.widget_countdown, View.GONE)
            } else {
                views.setTextViewText(R.id.widget_name, next.name)
                views.setTextViewText(R.id.widget_time, next.time)
                views.setViewVisibility(R.id.widget_countdown, View.VISIBLE)
                val base = SystemClock.elapsedRealtime() + (next.millis - System.currentTimeMillis())
                views.setChronometerCountDown(R.id.widget_countdown, true)
                views.setChronometer(R.id.widget_countdown, base, null, true)
            }
            mgr.updateAppWidget(ids, views)
        }
    }
}
