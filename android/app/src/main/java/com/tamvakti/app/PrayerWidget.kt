package com.tamvakti.app

import android.content.Context

/** İlk ana ekran widget'ı ("Sıradaki Vakit"). Sınıf adı korunur: telefonda yerleştirilmiş widget'lar kaybolmasın. */
class PrayerWidget : BaseWidget() {
    companion object {
        /** Tüm widget türlerini tazeler (AlarmReceiver ve Scheduler buradan çağırır). */
        fun updateAll(ctx: Context) = Widgets.updateAll(ctx)
    }
}
