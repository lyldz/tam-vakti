package com.tamvakti.app

import android.app.NotificationManager
import android.content.Context
import android.media.AudioManager

/** Namaz süresince telefonu titreşime alır, sonra eski haline döndürür. */
object Silencer {
    private const val KEY = "silenced_by_us"

    fun hasPolicyAccess(ctx: Context): Boolean {
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        return nm.isNotificationPolicyAccessGranted
    }

    fun start(ctx: Context) {
        if (!hasPolicyAccess(ctx)) return
        val am = ctx.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val p = Store.prefs(ctx)
        // Yalnızca telefon normal moddaysa ve biz henüz sessize almadıysak
        if (am.ringerMode == AudioManager.RINGER_MODE_NORMAL && !p.getBoolean(KEY, false)) {
            try {
                am.ringerMode = AudioManager.RINGER_MODE_VIBRATE
                p.edit().putBoolean(KEY, true).apply()
            } catch (e: SecurityException) {
            }
        }
    }

    fun end(ctx: Context) {
        val p = Store.prefs(ctx)
        if (!p.getBoolean(KEY, false)) return
        p.edit().putBoolean(KEY, false).apply()
        val am = ctx.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        // Kullanıcı bu arada kendisi değiştirdiyse dokunma
        if (am.ringerMode == AudioManager.RINGER_MODE_VIBRATE) {
            try {
                am.ringerMode = AudioManager.RINGER_MODE_NORMAL
            } catch (e: SecurityException) {
            }
        }
    }
}
