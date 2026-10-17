package com.tamvakti.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.webkit.GeolocationPermissions
import android.webkit.JavascriptInterface
import android.webkit.JsResult
import android.webkit.WebChromeClient
import androidx.appcompat.app.AlertDialog
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.hardware.GeomagneticField
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity(), SensorEventListener {

    private lateinit var webView: WebView
    private val LOCATION_PERMISSION_REQUEST = 1001
    private val NOTIFICATION_PERMISSION_REQUEST = 1002
    private val NOTIFICATION_ID = 2026
    private val CHANNEL_ID = "tamvakti_ongoing"

    private var pendingGeoCallback: GeolocationPermissions.Callback? = null
    private var pendingGeoOrigin: String? = null

    // Native Pusula & Sensör Değişkenleri
    private var sensorManager: SensorManager? = null
    private var rotationSensor: Sensor? = null
    private var accelerometer: Sensor? = null
    private var magnetometer: Sensor? = null

    private val rotationMatrix = FloatArray(9)
    private val remappedMatrix = FloatArray(9)
    private val orientationAngles = FloatArray(3)
    private val lastAccelerometer = FloatArray(3)
    private val lastMagnetometer = FloatArray(3)
    private var hasAccelerometer = false
    private var hasMagnetometer = false

    private var userLat = 38.28
    private var userLon = 31.9
    private var isCompassListening = false

    // Titremeyi önleyen birim çember EMA filtresi
    private var smoothedSin = 0.0
    private var smoothedCos = 0.0
    private val smoothingFactor = 0.18
    private var lastUpdateTimestamp: Long = 0

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        createNotificationChannel()

        webView = WebView(this)
        setContentView(webView)

        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.setGeolocationEnabled(true)
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        webView.webViewClient = WebViewClient()
        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                if (hasLocationPermission()) {
                    callback?.invoke(origin, true, false)
                } else {
                    pendingGeoCallback = callback
                    pendingGeoOrigin = origin
                    ActivityCompat.requestPermissions(
                        this@MainActivity,
                        arrayOf(
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                        ),
                        LOCATION_PERMISSION_REQUEST
                    )
                }
            }

            override fun onJsAlert(
                view: WebView?,
                url: String?,
                message: String?,
                result: JsResult?
            ): Boolean {
                AlertDialog.Builder(this@MainActivity)
                    .setTitle("Tam Vakti")
                    .setMessage(message ?: "")
                    .setPositiveButton("Tamam") { _, _ -> result?.confirm() }
                    .setOnCancelListener { result?.cancel() }
                    .create()
                    .show()
                return true
            }
        }

        // JavaScript Köprüsü (Bildirim Kontrolü İçin)
        webView.addJavascriptInterface(WebAppInterface(this), "AndroidBridge")

        // Yerel varlığı yükle
        webView.loadUrl("file:///android_asset/www/index.html")

        // Geri tuşu yönetimi
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Tam Vakti Sabit Sayaç"
            val descriptionText = "Bildirim çubuğunda sıradaki vakti ve kalan süreyi gösterir"
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                setShowBadge(false)
            }
            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun hasLocationPermission(): Boolean {
        val fine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
        return fine == PackageManager.PERMISSION_GRANTED || coarse == PackageManager.PERMISSION_GRANTED
    }

    fun hasNotificationPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                NOTIFICATION_PERMISSION_REQUEST
            )
        }
    }

    fun showOngoingPrayerNotification(
        cityName: String,
        nextPrayerName: String,
        nextPrayerTime: String,
        targetMillis: Long
    ) {
        if (!hasNotificationPermission()) {
            requestNotificationPermission()
            return
        }

        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val appIconBitmap = try {
            BitmapFactory.decodeResource(resources, R.mipmap.ic_launcher)
        } catch (e: Exception) {
            null
        }

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_tamvakti)
            .apply {
                if (appIconBitmap != null) {
                    setLargeIcon(appIconBitmap)
                }
            }
            .setContentTitle("Tam Vakti • $cityName")
            .setContentText("Sıradaki: $nextPrayerName ($nextPrayerTime)")
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)

        // Android Native Kronometre Canlı Geri Sayımı
        if (targetMillis > System.currentTimeMillis()) {
            builder.setUsesChronometer(true)
            builder.setChronometerCountDown(true)
            builder.setWhen(targetMillis)
            builder.setShowWhen(true)
        }

        notificationManager.notify(NOTIFICATION_ID, builder.build())
    }

    fun cancelOngoingPrayerNotification() {
        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(NOTIFICATION_ID)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == LOCATION_PERMISSION_REQUEST) {
            val granted = grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
            pendingGeoCallback?.invoke(pendingGeoOrigin, granted, false)
            pendingGeoCallback = null
            pendingGeoOrigin = null
        }
    }

    // ==========================================
    // CANLI DONANIM PUSULA VE SENSÖR YÖNETİMİ
    // ==========================================

    fun startCompassListening(lat: Double, lon: Double) {
        userLat = lat
        userLon = lon
        if (isCompassListening) return

        if (sensorManager == null) {
            sensorManager = getSystemService(Context.SENSOR_SERVICE) as? SensorManager
        }

        sensorManager?.let { sm ->
            rotationSensor = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
                ?: sm.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR)
            accelerometer = sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            magnetometer = sm.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

            rotationSensor?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
            accelerometer?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
            magnetometer?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }

            isCompassListening = true
            android.util.Log.d("TamVaktiCompass", "Started compass: rv=${rotationSensor != null}, acc=${accelerometer != null}, mag=${magnetometer != null}")
        }
    }

    fun stopCompassListening() {
        if (!isCompassListening) return
        sensorManager?.unregisterListener(this)
        isCompassListening = false
        smoothedSin = 0.0
        smoothedCos = 0.0
        hasAccelerometer = false
        hasMagnetometer = false
        android.util.Log.d("TamVaktiCompass", "Stopped compass listening")
    }

    override fun onPause() {
        super.onPause()
        stopCompassListening()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopCompassListening()
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    override fun onSensorChanged(event: SensorEvent) {
        if (!isCompassListening) return

        var success = false
        if (event.sensor.type == Sensor.TYPE_ROTATION_VECTOR ||
            event.sensor.type == Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR) {
            SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
            success = true
        } else if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            System.arraycopy(event.values, 0, lastAccelerometer, 0, 3)
            hasAccelerometer = true
            if (hasMagnetometer) {
                success = SensorManager.getRotationMatrix(rotationMatrix, null, lastAccelerometer, lastMagnetometer)
            }
        } else if (event.sensor.type == Sensor.TYPE_MAGNETIC_FIELD) {
            System.arraycopy(event.values, 0, lastMagnetometer, 0, 3)
            hasMagnetometer = true
            if (hasAccelerometer) {
                success = SensorManager.getRotationMatrix(rotationMatrix, null, lastAccelerometer, lastMagnetometer)
            }
        }

        if (success) {
            processOrientation(event.accuracy)
        }
    }

    private fun processOrientation(accuracy: Int) {
        // Dikey tutuş için eksen remap
        SensorManager.remapCoordinateSystem(
            rotationMatrix,
            SensorManager.AXIS_X,
            SensorManager.AXIS_Y,
            remappedMatrix
        )
        SensorManager.getOrientation(remappedMatrix, orientationAngles)

        var azimuthDeg = Math.toDegrees(orientationAngles[0].toDouble())
        if (azimuthDeg < 0) azimuthDeg += 360.0

        // Kullanıcının GPS konumuna göre Manyetik Sapma (True North) düzeltmesi
        try {
            val geoField = GeomagneticField(
                userLat.toFloat(),
                userLon.toFloat(),
                0f,
                System.currentTimeMillis()
            )
            azimuthDeg += geoField.declination
            if (azimuthDeg < 0) azimuthDeg += 360.0
            if (azimuthDeg >= 360.0) azimuthDeg -= 360.0
        } catch (e: Exception) {}

        // Titreşimi engelleyen ve 360 wrap sıçramasını çözen dairesel EMA filtresi
        val rad = Math.toRadians(azimuthDeg)
        if (smoothedSin == 0.0 && smoothedCos == 0.0) {
            smoothedSin = Math.sin(rad)
            smoothedCos = Math.cos(rad)
        } else {
            smoothedSin = smoothedSin * (1.0 - smoothingFactor) + Math.sin(rad) * smoothingFactor
            smoothedCos = smoothedCos * (1.0 - smoothingFactor) + Math.cos(rad) * smoothingFactor
        }

        var filteredDeg = Math.toDegrees(Math.atan2(smoothedSin, smoothedCos))
        if (filteredDeg < 0) filteredDeg += 360.0

        val now = System.currentTimeMillis()
        if (now - lastUpdateTimestamp >= 30) { // ~33 FPS UI güncelleme hızı
            lastUpdateTimestamp = now
            val pitchDeg = Math.toDegrees(orientationAngles[1].toDouble())
            val rollDeg = Math.toDegrees(orientationAngles[2].toDouble())

            val formattedDeg = String.format(java.util.Locale.US, "%.1f", filteredDeg)
            val formattedPitch = String.format(java.util.Locale.US, "%.1f", pitchDeg)
            val formattedRoll = String.format(java.util.Locale.US, "%.1f", rollDeg)

            val jsCmd = "if (window.onNativeCompassUpdate) { window.onNativeCompassUpdate($formattedDeg, $accuracy, $formattedPitch, $formattedRoll); } else if (window.app && window.app.onNativeCompassUpdate) { window.app.onNativeCompassUpdate($formattedDeg, $accuracy, $formattedPitch, $formattedRoll); }"
            runOnUiThread {
                webView.evaluateJavascript(jsCmd, null)
            }
        }
    }

    inner class WebAppInterface(private val activity: MainActivity) {
        @JavascriptInterface
        fun startCompass(lat: Double, lon: Double) {
            activity.runOnUiThread {
                activity.startCompassListening(lat, lon)
            }
        }

        @JavascriptInterface
        fun stopCompass() {
            activity.runOnUiThread {
                activity.stopCompassListening()
            }
        }

        @JavascriptInterface
        fun updatePrayerNotification(
            cityName: String,
            nextPrayerName: String,
            nextPrayerTime: String,
            targetMillis: Long
        ) {
            activity.runOnUiThread {
                activity.showOngoingPrayerNotification(
                    cityName,
                    nextPrayerName,
                    nextPrayerTime,
                    targetMillis
                )
            }
        }

        @JavascriptInterface
        fun cancelPrayerNotification() {
            activity.runOnUiThread {
                activity.cancelOngoingPrayerNotification()
            }
        }

        @JavascriptInterface
        fun requestNotificationPermission() {
            activity.runOnUiThread {
                activity.requestNotificationPermission()
            }
        }

        @JavascriptInterface
        fun downloadAndInstallApk(downloadUrl: String) {
            activity.startApkDownload(downloadUrl)
        }

        @JavascriptInterface
        fun getAppVersion(): String {
            return try {
                val pInfo = activity.packageManager.getPackageInfo(activity.packageName, 0)
                pInfo.versionName ?: "1.00.08"
            } catch (e: Exception) {
                "1.00.08"
            }
        }

        @JavascriptInterface
        fun openBatteryOptimizationSettings() {
            activity.runOnUiThread {
                try {
                    val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                    activity.startActivity(intent)
                } catch (e: Exception) {
                    try {
                        val intent = Intent(Settings.ACTION_SETTINGS)
                        activity.startActivity(intent)
                    } catch (e2: Exception) {}
                }
            }
        }

        @JavascriptInterface
        fun openExactAlarmSettings() {
            activity.runOnUiThread {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    try {
                        val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                            data = Uri.parse("package:${activity.packageName}")
                        }
                        activity.startActivity(intent)
                    } catch (e: Exception) {}
                }
            }
        }

        @JavascriptInterface
        fun vibrateDevice(durationMs: Long) {
            activity.runOnUiThread {
                try {
                    val vibrator = activity.getSystemService(Context.VIBRATOR_SERVICE) as? android.os.Vibrator
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator?.vibrate(android.os.VibrationEffect.createOneShot(durationMs, android.os.VibrationEffect.DEFAULT_AMPLITUDE))
                    } else {
                        vibrator?.vibrate(durationMs)
                    }
                } catch (e: Exception) {}
            }
        }
    }

    fun startApkDownload(downloadUrl: String) {
        thread {
            try {
                runOnUiThread {
                    webView.evaluateJavascript("window.app && window.app.onUpdateDownloadProgress(0, 'İndirme başlatılıyor...');", null)
                }

                val url = URL(downloadUrl)
                var connection = url.openConnection() as HttpURLConnection
                connection.instanceFollowRedirects = true
                connection.connectTimeout = 15000
                connection.readTimeout = 30000
                connection.connect()

                var redirectCount = 0
                while ((connection.responseCode == HttpURLConnection.HTTP_MOVED_PERM ||
                        connection.responseCode == HttpURLConnection.HTTP_MOVED_TEMP ||
                        connection.responseCode == HttpURLConnection.HTTP_SEE_OTHER) && redirectCount < 5) {
                    val newUrl = connection.getHeaderField("Location")
                    connection.disconnect()
                    connection = URL(newUrl).openConnection() as HttpURLConnection
                    connection.connectTimeout = 15000
                    connection.readTimeout = 30000
                    connection.connect()
                    redirectCount++
                }

                if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                    runOnUiThread {
                        webView.evaluateJavascript("window.app && window.app.onUpdateDownloadError('İndirme hatası: HTTP ${connection.responseCode}');", null)
                    }
                    return@thread
                }

                val fileLength = connection.contentLength
                val apkFile = File(cacheDir, "TamVakti-update.apk")
                if (apkFile.exists()) {
                    apkFile.delete()
                }

                val input: InputStream = connection.inputStream
                val output = FileOutputStream(apkFile)

                val data = ByteArray(8192)
                var total: Long = 0
                var count: Int
                var lastPercent = -1

                while (input.read(data).also { count = it } != -1) {
                    total += count
                    output.write(data, 0, count)

                    if (fileLength > 0) {
                        val percent = ((total * 100) / fileLength).toInt()
                        if (percent != lastPercent) {
                            lastPercent = percent
                            runOnUiThread {
                                webView.evaluateJavascript("window.app && window.app.onUpdateDownloadProgress($percent, '%$percent');", null)
                            }
                        }
                    }
                }

                output.flush()
                output.close()
                input.close()
                connection.disconnect()

                runOnUiThread {
                    webView.evaluateJavascript("window.app && window.app.onUpdateDownloadProgress(100, 'Kuruluma hazır!');", null)
                    promptInstallApk(apkFile)
                }

            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    val errMsg = e.message?.replace("'", "\\'") ?: "Bilinmeyen hata"
                    webView.evaluateJavascript("window.app && window.app.onUpdateDownloadError('$errMsg');", null)
                }
            }
        }
    }

    private fun promptInstallApk(apkFile: File) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!packageManager.canRequestPackageInstalls()) {
                    val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                        data = Uri.parse("package:$packageName")
                    }
                    startActivity(intent)
                }
            }

            val apkUri = FileProvider.getUriForFile(
                this,
                "$packageName.fileprovider",
                apkFile
            )

            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(apkUri, "application/vnd.android.package-archive")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
            }
            startActivity(installIntent)
        } catch (e: Exception) {
            e.printStackTrace()
            val errMsg = e.message?.replace("'", "\\'") ?: "Bilinmeyen hata"
            webView.evaluateJavascript("window.app && window.app.onUpdateDownloadError('Kurulum başlatılamadı: $errMsg');", null)
        }
    }
}
