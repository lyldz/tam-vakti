package com.tamvakti.app

import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat

/** Vakit girince ezanı (assets/www/assets/audio) çalan ön plan servisi. */
class AthanService : Service() {

    private var player: MediaPlayer? = null
    private var wakeLock: PowerManager.WakeLock? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }

        val title = intent?.getStringExtra("title") ?: "Ezan vakti"
        val body = intent?.getStringExtra("body") ?: ""
        val tone = intent?.getStringExtra("tone") ?: ""

        Notifs.createChannels(this)
        val stopPi = PendingIntent.getService(
            this, 1,
            Intent(this, AthanService::class.java).setAction(ACTION_STOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(this, Notifs.CH_ATHAN)
            .setSmallIcon(R.drawable.ic_stat_tamvakti)
            .setColor(androidx.core.content.ContextCompat.getColor(this, R.color.primary))
            .setContentTitle(title)
            .setContentText(if (body.isEmpty()) "Ezan okunuyor" else "$body • Ezan okunuyor")
            .setOngoing(true)
            .setContentIntent(Notifs.openAppIntent(this))
            .addAction(0, "Durdur", stopPi)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(Notifs.ID_ATHAN, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
        } else {
            startForeground(Notifs.ID_ATHAN, notification)
        }

        play(tone)
        return START_NOT_STICKY
    }

    private fun play(tone: String) {
        releasePlayer()
        // Yalnızca paket içindeki mp3 dosyalarına izin ver
        if (!Regex("^[A-Za-z0-9_]+\\.mp3$").matches(tone)) {
            stopSelf()
            return
        }
        try {
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "tamvakti:athan").apply {
                acquire(10 * 60 * 1000L)
            }
            @Suppress("DEPRECATION")
            (getSystemService(Context.AUDIO_SERVICE) as AudioManager)
                .requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)

            val afd = assets.openFd("www/assets/audio/$tone")
            player = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                )
                setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
                afd.close()
                setOnCompletionListener { stopSelf() }
                setOnErrorListener { _, _, _ -> stopSelf(); true }
                prepare()
                start()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            stopSelf()
        }
    }

    private fun releasePlayer() {
        try { player?.stop() } catch (e: Exception) {}
        player?.release()
        player = null
        if (wakeLock?.isHeld == true) wakeLock?.release()
        wakeLock = null
    }

    override fun onDestroy() {
        releasePlayer()
        @Suppress("DEPRECATION")
        (getSystemService(Context.AUDIO_SERVICE) as AudioManager).abandonAudioFocus(null)
        super.onDestroy()
    }

    companion object {
        const val ACTION_STOP = "com.tamvakti.app.STOP_ATHAN"
    }
}
