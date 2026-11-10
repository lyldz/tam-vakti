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
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews
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
            val ch = nm.getNotificationChannel(alertChannelId(ctx))
            if (ch != null && ch.importance == NotificationManager.IMPORTANCE_NONE) return false
        }
        return true
    }

    /** res/raw/tone_<ad> kaynak kimliği (yoksa 0). */
    fun toneRawId(ctx: Context, tone: String): Int =
        if (Regex("[a-z]{1,20}").matches(tone)) ctx.resources.getIdentifier("tone_$tone", "raw", ctx.packageName) else 0

    /** Seçili ses için vakit kanalı: "telefon" = varsayılan kanal, diğerleri kendi sesli kanalı (kanal sesi sonradan değişmez). */
    fun alertChannelId(ctx: Context): String {
        val tone = Store.tone(ctx)
        if (tone == "telefon" || toneRawId(ctx, tone) == 0) return CH_ALERT
        val id = "tamvakti_alert_$tone"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (nm.getNotificationChannel(id) == null) {
                val label = tone.replaceFirstChar { it.uppercase() }
                nm.createNotificationChannel(
                    NotificationChannel(id, "Vakit bildirimleri ($label)", NotificationManager.IMPORTANCE_HIGH).apply {
                        description = "Tam Vakti $label sesiyle vakit bildirimleri"
                        setSound(
                            android.net.Uri.parse("android.resource://${ctx.packageName}/${toneRawId(ctx, tone)}"),
                            AudioAttributes.Builder()
                                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                .build()
                        )
                        enableVibration(true)
                    }
                )
            }
        }
        return id
    }

    private var tonePlayer: android.media.MediaPlayer? = null

    /** Ayarlardaki ses önizlemesi (yaklaşık 2 sn). */
    fun playTone(ctx: Context, tone: String) {
        stopTone()
        val raw = toneRawId(ctx, tone)
        if (raw == 0) return
        try {
            tonePlayer = android.media.MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                val afd = ctx.resources.openRawResourceFd(raw)
                setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
                afd.close()
                setOnCompletionListener { stopTone() }
                prepare()
                start()
            }
        } catch (e: Exception) {
            stopTone()
        }
    }

    fun stopTone() {
        try { tonePlayer?.release() } catch (e: Exception) {}
        tonePlayer = null
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
        val builder = NotificationCompat.Builder(ctx, if (quiet) CH_QUIET else alertChannelId(ctx))
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

    /** Durum çubuğundaki sabit bildirim: geçen vakit, sıradaki vakit, ilerleme çubuğu ve geri sayım. */
    fun postOngoing(ctx: Context, city: String, nextName: String, nextTime: String, targetMillis: Long) {
        if (!hasPermission(ctx)) return
        createChannels(ctx)
        val now = System.currentTimeMillis()
        val prev = Store.prevPrayer(ctx)
        val rv = RemoteViews(ctx.packageName, R.layout.notif_ongoing)
        rv.setTextViewText(R.id.nv_next, "$nextName $nextTime")
        val base = SystemClock.elapsedRealtime()
        val hasTarget = targetMillis > now
        if (prev != null && hasTarget && targetMillis > prev.millis) {
            rv.setTextViewText(R.id.nv_cur, "${prev.name} ${prev.time}")
            val frac = ((now - prev.millis).toDouble() / (targetMillis - prev.millis)).coerceIn(0.0, 1.0)
            rv.setProgressBar(R.id.nv_bar, 1000, (frac * 1000).toInt(), false)
            rv.setViewVisibility(R.id.nv_bar, View.VISIBLE)
            rv.setChronometer(R.id.nv_elapsed, base - (now - prev.millis), "Geçen süre %s", true)
        } else {
            rv.setTextViewText(R.id.nv_cur, city)
            rv.setViewVisibility(R.id.nv_bar, View.GONE)
            rv.setTextViewText(R.id.nv_elapsed, "")
        }
        if (hasTarget) {
            rv.setChronometer(R.id.nv_remain, base + (targetMillis - now), "Kalan %s", true)
            rv.setChronometerCountDown(R.id.nv_remain, true)
        } else {
            rv.setTextViewText(R.id.nv_remain, "")
        }
        val builder = NotificationCompat.Builder(ctx, CH_ONGOING)
            .setSmallIcon(R.drawable.ic_stat_tamvakti)
            .setColor(ContextCompat.getColor(ctx, R.color.primary))
            .setContentTitle("Tam Vakti • $city")
            .setContentText("Sıradaki: $nextName ($nextTime)")
            .setSubText(city)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setCustomContentView(rv)
            .setCustomBigContentView(rv)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(openAppIntent(ctx))
            .setPriority(NotificationCompat.PRIORITY_LOW)
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(ID_ONGOING, builder.build())
        scheduleTick(ctx)
    }

    /** İlerleme çubuğu geri sayım gibi kendiliğinden akmaz; birkaç dakikada bir yeniden çizilir. */
    private fun scheduleTick(ctx: Context) {
        try {
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
            val i = Intent(ctx, AlarmReceiver::class.java).apply {
                action = "com.tamvakti.app.ONGOING_TICK"
                putExtra("type", "ongoing_tick")
            }
            val pi = PendingIntent.getBroadcast(
                ctx, 7771, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            am.setAndAllowWhileIdle(
                android.app.AlarmManager.RTC, System.currentTimeMillis() + 3 * 60_000L, pi
            )
        } catch (e: Exception) {}
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
