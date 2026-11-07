package com.tamvakti.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** Cihaz yeniden açılınca / uygulama güncellenince / alarm izni değişince alarmları yeniden kurar. */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        Scheduler.reschedule(context)
    }
}
