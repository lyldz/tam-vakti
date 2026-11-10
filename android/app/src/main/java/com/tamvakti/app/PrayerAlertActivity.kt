package com.tamvakti.app

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/**
 * Tam ekran vakit bildirimi. Kilit ekranının üstünde açılır, ekranı uyandırır.
 * Gösterilenler: logo, anlık saat, il/ilçe, giren vakit ve vakte ait kısa bilgi.
 */
class PrayerAlertActivity : AppCompatActivity() {
    private val handler = Handler(Looper.getMainLooper())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        showOverLockscreen()
        setContentView(R.layout.activity_prayer_alert)
        bind(intent)
        findViewById<Button>(R.id.alertClose).setOnClickListener { finishAndRemoveTask() }
        findViewById<Button>(R.id.alertOpen).setOnClickListener {
            startActivity(Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            })
            finishAndRemoveTask()
        }
        // Unutulursa ekran sonsuza dek açık kalmasın
        handler.postDelayed({ finishAndRemoveTask() }, AUTO_CLOSE_MS)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        bind(intent)
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }

    private fun showOverLockscreen() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    private fun bind(i: Intent) {
        val name = i.getStringExtra(EXTRA_NAME).orEmpty().ifBlank { "Namaz" }
        val time = i.getStringExtra(EXTRA_TIME).orEmpty()
        val place = i.getStringExtra(EXTRA_PLACE).orEmpty().ifBlank { Store.city(this) }
        val info = i.getStringExtra(EXTRA_INFO).orEmpty()

        findViewById<TextView>(R.id.alertTitle).text = "$name vakti girdi"
        findViewById<TextView>(R.id.alertPlace).text = place.replace("/", " / ")
        findViewById<TextView>(R.id.alertTime).text = if (time.isNotBlank()) "Vakit girişi $time" else "Vakit girdi"
        findViewById<TextView>(R.id.alertInfo).apply {
            text = info
            visibility = if (info.isBlank()) android.view.View.GONE else android.view.View.VISIBLE
        }
        val next = Store.nextPrayer(this)
        findViewById<TextView>(R.id.alertNext).text =
            if (next != null) "Sıradaki: ${next.name} ${next.time}" else ""
    }

    companion object {
        const val EXTRA_NAME = "pa_name"
        const val EXTRA_TIME = "pa_time"
        const val EXTRA_PLACE = "pa_place"
        const val EXTRA_INFO = "pa_info"
        private const val AUTO_CLOSE_MS = 10 * 60 * 1000L

        fun intent(ctx: Context, name: String, time: String, place: String, info: String): Intent =
            Intent(ctx, PrayerAlertActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra(EXTRA_NAME, name)
                putExtra(EXTRA_TIME, time)
                putExtra(EXTRA_PLACE, place)
                putExtra(EXTRA_INFO, info)
            }
    }
}
