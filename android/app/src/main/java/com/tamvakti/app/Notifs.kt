package com.tamvakti.app

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

/** Tüm bildirim kanalları ve bildirim oluşturma işleri. */
object Notifs {
    const val CH_ONGOING = "tamvakti_ongoing"
    const val CH_ALERT = "tamvakti_alert"
    const val CH_QUIET = "tamvakti_quiet"
    const val ID_ONGOING = 2026

    fun createChannels(ctx: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        nm.createNotificationChannel(
            NotificationChannel(CH_ONGOING, "Tam Vakti Sabit Sayaç", NotificationManager.IMPORTANCE_LOW).apply {
                description = "Bildirim çubuğunda sıradaki vakti ve kalan süreyi gösterir"
                setShowBadge(false)
            }
        )
        nm.createNotificationChannel(
            NotificationChannel(CH_ALERT, "Vakit bildirimleri", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Vakit girişi ve vakit öncesi hatırlatmalar (sesi telefon ayarlarından değiştirebilirsiniz)"
                setSound(
                    RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION),
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                enableVibration(true)
            }
        )
        nm.createNotificationChannel(
            NotificationChannel(CH_QUIET, "Vakit Uyarıları (sessiz)", NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = "Sessiz vakit ve kerahat bildirimleri"
                setSound(null, null)
                enableVibration(false)
            }
        )
    }

    /** Kullanıcı vakit bildirim kanalını (ya da tüm bildirimleri) sistem ayarlarından kapatmış mı? */
    fun alertChannelOk(ctx: Context): Boolean {
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (!nm.areNotificationsEnabled()) return false
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createChannels(ctx)
            val ch = nm.getNotificationChannel(CH_ALERT)
            if (ch != null && ch.importance == NotificationManager.IMPORTANCE_NONE) return false
        }
        return true
    }

    fun hasPermission(ctx: Context): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED

    fun openAppIntent(ctx: Context): PendingIntent {
        val intent = Intent(ctx, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        return PendingIntent.getActivity(
            ctx, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    /** Vakit girişi / hatırlatma / kerahat bildirimi. */
    fun postAlert(
        ctx: Context, id: Int, title: String, body: String, quiet: Boolean,
        fullScreen: Intent? = null
    ) {
        if (!hasPermission(ctx)) return
        createChannels(ctx)
        val builder = NotificationCompat.Builder(ctx, if (quiet) CH_QUIET else CH_ALERT)
            .setSmallIcon(R.drawable.ic_stat_tamvakti)
            .setColor(ContextCompat.getColor(ctx, R.color.primary))
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(openAppIntent(ctx))
            .setPriority(if (quiet) NotificationCompat.PRIORITY_DEFAULT else NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
        // Tam ekran bildirim (kilit ekranı / ekran kapalıyken tüm ekranı kaplar; açıkken yukarıdan kayan bildirim olur)
        if (fullScreen != null && !quiet && canUseFullScreen(ctx)) {
            val pi = PendingIntent.getActivity(
                ctx, id, fullScreen, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            builder.setFullScreenIntent(pi, true)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
        }
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(id, builder.build())
    }

    /** Android 14+ tam ekran niyeti kullanıcı iznine bağlıdır; öncesinde manifest izni yeter. */
    fun canUseFullScreen(ctx: Context): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return true
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        return nm.canUseFullScreenIntent()
    }

    /** Durum çubuğundaki sabit, geri sayımlı bildirim. */
    fun postOngoing(ctx: Context, city: String, nextName: String, nextTime: String, targetMillis: Long) {
        if (!hasPermission(ctx)) return
        createChannels(ctx)
        val icon = try { BitmapFactory.decodeResource(ctx.resources, R.mipmap.ic_launcher) } catch (e: Exception) { null }
        val builder = NotificationCompat.Builder(ctx, CH_ONGOING)
            .setSmallIcon(R.drawable.ic_stat_tamvakti)
            .setColor(ContextCompat.getColor(ctx, R.color.primary))
            .setContentTitle("Tam Vakti • $city")
            .setContentText("Sıradaki: $nextName ($nextTime)")
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(openAppIntent(ctx))
            .setPriority(NotificationCompat.PRIORITY_LOW)
        if (icon != null) builder.setLargeIcon(icon)
        if (targetMillis > System.currentTimeMillis()) {
            builder.setUsesChronometer(true)
            builder.setChronometerCountDown(true)
            builder.setWhen(targetMillis)
            builder.setShowWhen(true)
        }
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(ID_ONGOING, builder.build())
    }

    /** Uygulama kapalıyken bile sabit bildirimi sıradaki vakte günceller. */
    fun refreshOngoing(ctx: Context) {
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (!Store.ongoingEnabled(ctx)) {
            nm.cancel(ID_ONGOING)
            return
        }
        val next = Store.nextPrayer(ctx) ?: return
        postOngoing(ctx, Store.city(ctx), next.name, next.time, next.millis)
    }
}
