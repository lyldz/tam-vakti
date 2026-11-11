package com.tamvakti.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
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
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import android.view.ViewGroup
import android.widget.FrameLayout
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
    private var smoothingInitialized = false
    private val smoothingFactor = 0.18
    private var lastUpdateTimestamp: Long = 0

    // Doğruluk (0..3 = UNRELIABLE..HIGH) yalnızca manyetometre / rotasyon vektöründen izlenir
    private var lastMagAccuracy = 0
    private var magAccuracyOnly: Sensor? = null
    private var lastSentAccuracy = -1
    private var lastSentHeading = -1000.0
    private var lastSentPitch = 0.0
    private var lastSentRoll = 0.0
    private var hasHeading = false
    private var lastFilteredDeg = 0.0
    private var lastPitchDeg = 0.0
    private var lastRollDeg = 0.0

    // Manyetik sapma önbelleği (her olayda GeomagneticField üretmemek için)
    private var cachedDeclination = 0f
    private var declinationTime = 0L
    private var declinationLat = Double.NaN
    private var declinationLon = Double.NaN

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Notifs.createChannels(this)

        webView = WebView(this)

        // Android 15+ (targetSdk 35+) ekranı kenardan kenara çizer: durum/gezinme çubuğu ve
        // klavye boşluklarını burada içeriğe dolgu olarak veririz; arka plan uygulama rengidir.
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val root = FrameLayout(this).apply { setBackgroundColor(0xFF090E1A.toInt()) }
        root.addView(webView, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        setContentView(root)
        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() or
                    WindowInsetsCompat.Type.displayCutout() or
                    WindowInsetsCompat.Type.ime()
            )
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }
        WindowCompat.getInsetsController(window, root).apply {
            isAppearanceLightStatusBars = false
            isAppearanceLightNavigationBars = false
        }

        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        // Güvenlik: sayfa yalnızca paket içi dosyalardan (android_asset) yüklenir; cihaz dosyalarına/içerik sağlayıcılarına erişim kapalı
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        @Suppress("DEPRECATION")
        run {
            settings.allowFileAccessFromFileURLs = false
            settings.allowUniversalAccessFromFileURLs = false
        }
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        settings.setGeolocationEnabled(true)
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        // Güvenlik: köprü (AndroidBridge) yalnızca uygulamanın kendi sayfasına açıktır; dış bağlantılar tarayıcıda açılır
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: android.webkit.WebResourceRequest): Boolean {
                val u = request.url
                if (u.scheme == "file" && (u.path ?: "").startsWith("/android_asset/")) return false
                if (u.scheme == "https" || u.scheme == "http") {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, u).addCategory(Intent.CATEGORY_BROWSABLE))
                    } catch (e: Exception) {}
                }
                return true
            }
        }
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
                        arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION),
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

    fun hasLocationPermission(): Boolean {
        // Yalnızca yaklaşık konum istenir (ilçe bulmak için yeterli)
        val coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
        return coarse == PackageManager.PERMISSION_GRANTED
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
        Notifs.postOngoing(this, cityName, nextPrayerName, nextPrayerTime, targetMillis)
    }

    fun cancelOngoingPrayerNotification() {
        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(Notifs.ID_ONGOING)
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
            notifyPermissionResult("loc", granted)
        } else if (requestCode == NOTIFICATION_PERMISSION_REQUEST) {
            val granted = grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
            notifyPermissionResult("notif", granted)
        }
    }

    /** İzin penceresinin sonucunu web tarafına bildirir (kurulum sihirbazı rozetleri için). */
    private fun notifyPermissionResult(kind: String, granted: Boolean) {
        if (!::webView.isInitialized) return
        webView.post {
            webView.evaluateJavascript(
                "window.app && window.app.onPermissionResult && window.app.onPermissionResult('$kind', $granted);",
                null
            )
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
            resetCompassState()
            rotationSensor = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
                ?: sm.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR)
            accelerometer = null
            magnetometer = null
            magAccuracyOnly = null

            var registered = false
            val rv = rotationSensor
            if (rv != null) {
                registered = sm.registerListener(this, rv, SensorManager.SENSOR_DELAY_GAME)
                if (registered) {
                    // Rotasyon vektörünün accuracy değeri çoğu cihazda güvenilmez; kalibrasyon
                    // durumu için manyetometreyi yalnızca doğruluk kaynağı olarak (düşük hızda) dinle
                    magAccuracyOnly = sm.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
                    magAccuracyOnly?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL) }
                }
            }
            if (!registered) {
                // Yedek: rotasyon vektörü yoksa (veya kaydedilemediyse) ivmeölçer + manyetometre
                rotationSensor = null
                accelerometer = sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
                magnetometer = sm.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
                val a = accelerometer
                val m = magnetometer
                if (a != null && m != null) {
                    val r1 = sm.registerListener(this, a, SensorManager.SENSOR_DELAY_GAME)
                    val r2 = sm.registerListener(this, m, SensorManager.SENSOR_DELAY_GAME)
                    registered = r1 && r2
                    if (!registered) sm.unregisterListener(this)
                }
            }

            isCompassListening = registered
            android.util.Log.d("TamVaktiCompass", "Started compass: ok=$registered, rv=${rotationSensor != null}, acc=${accelerometer != null}, mag=${magnetometer != null}")
        }
    }

    private fun resetCompassState() {
        smoothedSin = 0.0
        smoothedCos = 0.0
        smoothingInitialized = false
        hasAccelerometer = false
        hasMagnetometer = false
        hasHeading = false
        lastMagAccuracy = 0
        lastSentAccuracy = -1
        lastSentHeading = -1000.0
        lastSentPitch = 0.0
        lastSentRoll = 0.0
        lastUpdateTimestamp = 0
    }

    fun stopCompassListening() {
        // Idempotent: kayıtlı dinleyici kalmadığından emin ol
        sensorManager?.unregisterListener(this)
        if (!isCompassListening) return
        isCompassListening = false
        resetCompassState()
        android.util.Log.d("TamVaktiCompass", "Stopped compass listening")
    }

    override fun onPause() {
        super.onPause()
        stopCompassListening()
    }

    override fun onResume() {
        super.onResume()
        // Arka plandan dönünce vakitleri tazele ve pusulayı yeniden başlat
        if (::webView.isInitialized) {
            webView.evaluateJavascript("window.app && window.app.onAppResume && window.app.onAppResume();", null)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopCompassListening()
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        if (!isCompassListening || sensor == null) return
        val t = sensor.type
        val accSource = if (magAccuracyOnly != null) {
            t == Sensor.TYPE_MAGNETIC_FIELD
        } else {
            t == Sensor.TYPE_ROTATION_VECTOR ||
                t == Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR ||
                t == Sensor.TYPE_MAGNETIC_FIELD
        }
        if (accSource) {
            if (accuracy != lastMagAccuracy) {
                lastMagAccuracy = accuracy.coerceIn(0, 3)
                pushCompass(SystemClock.elapsedRealtime())
            }
        }
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (!isCompassListening) return

        var success = false
        when (event.sensor.type) {
            Sensor.TYPE_ROTATION_VECTOR, Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR -> {
                if (magAccuracyOnly == null) lastMagAccuracy = event.accuracy.coerceIn(0, 3)
                // Bazı cihazlarda values 4+ eleman içerir; getRotationMatrixFromVector hepsini kabul eder
                SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
                success = true
            }
            Sensor.TYPE_ACCELEROMETER -> {
                System.arraycopy(event.values, 0, lastAccelerometer, 0, 3)
                hasAccelerometer = true
                if (hasMagnetometer) {
                    success = SensorManager.getRotationMatrix(rotationMatrix, null, lastAccelerometer, lastMagnetometer)
                }
            }
            Sensor.TYPE_MAGNETIC_FIELD -> {
                lastMagAccuracy = event.accuracy.coerceIn(0, 3)
                if (magAccuracyOnly != null) return
                System.arraycopy(event.values, 0, lastMagnetometer, 0, 3)
                hasMagnetometer = true
                if (hasAccelerometer) {
                    success = SensorManager.getRotationMatrix(rotationMatrix, null, lastAccelerometer, lastMagnetometer)
                }
            }
        }

        if (success) {
            processOrientation()
        }
    }

    @Suppress("DEPRECATION")
    private fun currentDisplayRotation(): Int {
        return try {
            windowManager.defaultDisplay.rotation
        } catch (e: Exception) {
            android.view.Surface.ROTATION_0
        }
    }

    private fun declination(): Float {
        val now = System.currentTimeMillis()
        if (declinationLat != userLat || declinationLon != userLon || now - declinationTime > 600_000L) {
            try {
                cachedDeclination = GeomagneticField(userLat.toFloat(), userLon.toFloat(), 0f, now).declination
            } catch (e: Exception) {
                cachedDeclination = 0f
            }
            declinationLat = userLat
            declinationLon = userLon
            declinationTime = now
        }
        return cachedDeclination
    }

    private fun processOrientation() {
        // Ekran dönüşüne göre eksen remap (kaynak ve hedef dizi farklı; yerinde işlem yok)
        var axisX = SensorManager.AXIS_X
        var axisY = SensorManager.AXIS_Y
        when (currentDisplayRotation()) {
            android.view.Surface.ROTATION_90 -> { axisX = SensorManager.AXIS_Y; axisY = SensorManager.AXIS_MINUS_X }
            android.view.Surface.ROTATION_180 -> { axisX = SensorManager.AXIS_MINUS_X; axisY = SensorManager.AXIS_MINUS_Y }
            android.view.Surface.ROTATION_270 -> { axisX = SensorManager.AXIS_MINUS_Y; axisY = SensorManager.AXIS_X }
        }
        if (!SensorManager.remapCoordinateSystem(rotationMatrix, axisX, axisY, remappedMatrix)) return
        SensorManager.getOrientation(remappedMatrix, orientationAngles)

        var azimuthDeg = Math.toDegrees(orientationAngles[0].toDouble())
        // Kullanıcının GPS konumuna göre Manyetik Sapma (True North) düzeltmesi
        azimuthDeg += declination()
        azimuthDeg = ((azimuthDeg % 360.0) + 360.0) % 360.0

        // Titreşimi engelleyen ve 360 wrap sıçramasını çözen dairesel EMA filtresi
        val rad = Math.toRadians(azimuthDeg)
        if (!smoothingInitialized) {
            smoothedSin = Math.sin(rad)
            smoothedCos = Math.cos(rad)
            smoothingInitialized = true
        } else {
            smoothedSin = smoothedSin * (1.0 - smoothingFactor) + Math.sin(rad) * smoothingFactor
            smoothedCos = smoothedCos * (1.0 - smoothingFactor) + Math.cos(rad) * smoothingFactor
        }

        var filteredDeg = Math.toDegrees(Math.atan2(smoothedSin, smoothedCos))
        if (filteredDeg < 0) filteredDeg += 360.0

        lastFilteredDeg = filteredDeg
        lastPitchDeg = Math.toDegrees(orientationAngles[1].toDouble())
        lastRollDeg = Math.toDegrees(orientationAngles[2].toDouble())
        hasHeading = true

        pushCompass(SystemClock.elapsedRealtime())
    }

    // JS'e en fazla ~30 Hz gönder; anlamlı değişiklik yoksa atla
    private fun pushCompass(now: Long) {
        if (!hasHeading || !::webView.isInitialized) return

        val accuracy = lastMagAccuracy
        val accuracyChanged = accuracy != lastSentAccuracy
        if (!accuracyChanged && now - lastUpdateTimestamp < 33) return

        var dHeading = Math.abs(lastFilteredDeg - lastSentHeading)
        if (dHeading > 180.0) dHeading = 360.0 - dHeading
        val tiltChanged = Math.abs(lastPitchDeg - lastSentPitch) >= 1.0 ||
            Math.abs(lastRollDeg - lastSentRoll) >= 1.0
        if (!accuracyChanged && !tiltChanged && dHeading < 0.3) return

        lastUpdateTimestamp = now
        lastSentAccuracy = accuracy
        lastSentHeading = lastFilteredDeg
        lastSentPitch = lastPitchDeg
        lastSentRoll = lastRollDeg

        val loc = java.util.Locale.US
        val h = String.format(loc, "%.1f", lastFilteredDeg)
        val p = String.format(loc, "%.1f", lastPitchDeg)
        val r = String.format(loc, "%.1f", lastRollDeg)
        val jsCmd = "if (window.onNativeCompassUpdate) { window.onNativeCompassUpdate($h, $accuracy, $p, $r); } else if (window.app && window.app.onNativeCompassUpdate) { window.app.onNativeCompassUpdate($h, $accuracy, $p, $r); }"
        runOnUiThread {
            webView.evaluateJavascript(jsCmd, null)
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
            // Google Play sürümü kendini güncellemez (Play politikası)
            if (BuildConfig.IS_PLAY) {
                activity.runOnUiThread {
                    activity.webView.evaluateJavascript("window.app && window.app.onUpdateDownloadError('Güncellemeler Google Play üzerinden yapılır');", null)
                }
                return
            }
            // Yalnızca projenin kendi GitHub sürümlerinden indirmeye izin ver
            val uri = Uri.parse(downloadUrl)
            val allowed = uri.scheme == "https" && uri.host == "github.com" &&
                (uri.path ?: "").startsWith("/lyldz/tam-vakti/")
            if (!allowed) {
                activity.runOnUiThread {
                    activity.webView.evaluateJavascript("window.app && window.app.onUpdateDownloadError('Geçersiz indirme adresi');", null)
                }
                return
            }
            activity.startApkDownload(downloadUrl)
        }

        @JavascriptInterface
        fun getDistribution(): String = if (BuildConfig.IS_PLAY) "play" else "github"

        /**
         * Üreticiye özel arka plan ayar sayfasını açar. kind 0 = izin sayfası, 1 = pil/arka plan sınırı, 2 = otomatik başlat listesi, 3 = Xiaomi Güvenlik uygulaması (kilit listesi).
         * Doğrudan açılamazsa false döner (JS genel uygulama bilgisine düşer). Paket görünürlüğü
         * kısıtı yüzünden resolveActivity yerine doğrudan startActivity denenir.
         */
        @JavascriptInterface
        fun openOemSettings(kind: Int): Boolean {
            val pkg = activity.packageName
            val mfr = Build.MANUFACTURER.lowercase()
            val label = try { activity.applicationInfo.loadLabel(activity.packageManager).toString() } catch (e: Exception) { "Tam Vakti" }
            fun c(p: String, cls: String) = Intent().setClassName(p, cls)
            val list = ArrayList<Intent>()
            when {
                mfr.contains("xiaomi") || mfr.contains("redmi") || mfr.contains("poco") -> {
                    if (kind == 3) {
                        // "Uygulamaları kilitle" listesinin bulunduğu Güvenlik uygulaması (Hız artır > dişli > Uygulamaları kilitle).
                        // Bu ekranı doğrudan açan doğrulanmış bir bileşen adı yok; uygulamanın kendisi açılır.
                        activity.packageManager.getLaunchIntentForPackage("com.miui.securitycenter")?.let { list.add(it) }
                    } else if (kind == 2) {
                        // Otomatik başlat listesi (Ayarlar > Uygulamalar > İzinler > Otomatik başlat)
                        list.add(Intent("miui.intent.action.OP_AUTO_START").addCategory(Intent.CATEGORY_DEFAULT))
                        list.add(c("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"))
                    } else if (kind == 0) {
                        // Uygulama izin sayfası: Kilit ekranında göster, Arka planda açılır pencere vb.
                        list.add(c("com.miui.securitycenter", "com.miui.permcenter.permissions.PermissionsEditorActivity").putExtra("extra_pkgname", pkg))
                        list.add(Intent("miui.intent.action.APP_PERM_EDITOR").setClassName("com.miui.securitycenter", "com.miui.permcenter.permissions.PermissionsEditorActivity").putExtra("extra_pkgname", pkg))
                    } else {
                        // Uygulamaya özel pil tasarrufu (Kısıtlama yok)
                        list.add(c("com.miui.powerkeeper", "com.miui.powerkeeper.ui.HiddenAppsConfigActivity")
                            .putExtra("package_name", pkg).putExtra("package_label", label))
                    }
                }
                mfr.contains("huawei") || mfr.contains("honor") -> {
                    list.add(c("com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"))
                    list.add(c("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity"))
                    list.add(c("com.huawei.systemmanager", "com.huawei.systemmanager.appcontrol.activity.StartupAppControlActivity"))
                }
                mfr.contains("samsung") -> {
                    list.add(c("com.samsung.android.lool", "com.samsung.android.sm.ui.battery.BatteryActivity"))
                    list.add(c("com.samsung.android.sm_cn", "com.samsung.android.sm.ui.battery.BatteryActivity"))
                    list.add(Intent(Settings.ACTION_BATTERY_SAVER_SETTINGS))
                }
                mfr.contains("oppo") || mfr.contains("realme") || mfr.contains("oneplus") -> {
                    list.add(c("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"))
                    list.add(c("com.coloros.safecenter", "com.coloros.safecenter.startupapp.StartupAppListActivity"))
                    list.add(c("com.oppo.safe", "com.oppo.safe.permission.startup.StartupAppListActivity"))
                    list.add(c("com.oneplus.security", "com.oneplus.security.chainlaunch.view.ChainLaunchAppListActivity"))
                }
                mfr.contains("vivo") || mfr.contains("iqoo") -> {
                    list.add(c("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"))
                    list.add(c("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity"))
                    list.add(c("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.BgStartUpManager"))
                }
            }
            for (i in list) {
                try {
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    activity.startActivity(i)
                    return true
                } catch (e: Exception) {
                    // sıradaki adayı dene
                }
            }
            return false
        }

        /** "Diğer uygulamaların üzerinde göster" izni (telefon açıkken tam ekranı doğrudan açmak için) */
        @JavascriptInterface
        fun canDrawOverlays(): Boolean = Settings.canDrawOverlays(activity)

        @JavascriptInterface
        fun openOverlaySettings() {
            activity.runOnUiThread {
                try {
                    activity.startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
                        data = Uri.parse("package:${activity.packageName}")
                    })
                } catch (e: Exception) {
                }
            }
        }

        @JavascriptInterface
        fun testFullScreenAlert(delaySec: Int) {
            val time = java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault()).format(java.util.Date(System.currentTimeMillis() + delaySec * 1000L))
            val info = "Örnek bildirim: giren vakte ait kısa bilgi burada görünür."
            if (delaySec <= 0) {
                activity.runOnUiThread {
                    activity.startActivity(PrayerAlertActivity.intent(activity, "Öğle", time, Store.city(activity), info))
                }
                return
            }
            val am = activity.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(activity, AlarmReceiver::class.java).apply {
                action = "com.tamvakti.app.ALARM_TEST"
                putExtra("type", "vakit"); putExtra("title", "Öğle vakti girdi")
                putExtra("body", "${Store.city(activity)} • $time"); putExtra("mode", "bip")
                putExtra("id", 4999); putExtra("name", "Öğle"); putExtra("time", time)
                putExtra("info", info); putExtra("force_fs", true)
            }
            val pi = PendingIntent.getBroadcast(activity, 4999, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            val at = System.currentTimeMillis() + delaySec * 1000L
            try {
                if (Scheduler.canScheduleExact(activity)) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
                else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            } catch (e: SecurityException) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            }
        }

        /** Yalnızca projenin gizlilik sayfası ve GitHub deposu tarayıcıda açılır. */
        @JavascriptInterface
        fun openUrl(url: String) {
            val uri = Uri.parse(url)
            val ok = uri.scheme == "https" &&
                (uri.host == "lyldz.github.io" || (uri.host == "github.com" && (uri.path ?: "").startsWith("/lyldz/")))
            if (!ok) return
            activity.runOnUiThread {
                try {
                    activity.startActivity(Intent(Intent.ACTION_VIEW, uri))
                } catch (e: Exception) {
                }
            }
        }

        @JavascriptInterface
        fun syncSchedule(json: String) {
            val app = activity.applicationContext
            thread {
                try {
                    Scheduler.sync(app, json)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }

        @JavascriptInterface
        fun getPermissionState(): String {
            val app = activity.applicationContext
            val pm = app.getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
            val battery = Build.VERSION.SDK_INT < Build.VERSION_CODES.M || pm.isIgnoringBatteryOptimizations(app.packageName)
            return "{\"notif\":" + Notifs.hasPermission(app) +
                ",\"exact\":" + Scheduler.canScheduleExact(app) +
                ",\"dnd\":" + Silencer.hasPolicyAccess(app) +
                ",\"battery\":" + battery +
                ",\"chan\":" + Notifs.alertChannelOk(app) +
                ",\"mfr\":\"" + Build.MANUFACTURER.lowercase().replace("\"", "") + "\"" +
                ",\"loc\":" + activity.hasLocationPermission() +
                ",\"sdk\":" + Build.VERSION.SDK_INT + "}"
        }

        /** Pil optimizasyonu muafiyetini uygulamaya özel pencereyle ister; olmazsa genel listeyi açar. */
        @SuppressLint("BatteryLife")
        @JavascriptInterface
        fun requestIgnoreBatteryOptimizations() {
            activity.runOnUiThread {
                try {
                    activity.startActivity(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                        data = Uri.parse("package:${activity.packageName}")
                    })
                } catch (e: Exception) {
                    try {
                        activity.startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
                    } catch (e2: Exception) {
                    }
                }
            }
        }

        /** Uygulama ayrıntıları sayfası (kalıcı reddedilen konum/bildirim izni için). */
        @JavascriptInterface
        fun openAppDetailsSettings() {
            activity.runOnUiThread {
                try {
                    activity.startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                        data = Uri.parse("package:${activity.packageName}")
                    })
                } catch (e: Exception) {
                }
            }
        }

        @JavascriptInterface
        fun getScheduleInfo(): String = Scheduler.info(activity.applicationContext)

        @JavascriptInterface
        fun openAppNotificationSettings() {
            activity.runOnUiThread {
                try {
                    activity.startActivity(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                        putExtra(Settings.EXTRA_APP_PACKAGE, activity.packageName)
                    })
                } catch (e: Exception) {
                }
            }
        }

        @JavascriptInterface
        fun openDndSettings() {
            activity.runOnUiThread {
                try {
                    activity.startActivity(Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS))
                } catch (e: Exception) {
                }
            }
        }

        @JavascriptInterface
        fun testAlert(type: String, title: String, body: String, mode: String) {
            val app = activity.applicationContext
            activity.runOnUiThread {
                AlarmReceiver.handle(app, type, title, body, mode, 4999)
            }
        }

        /** Seçilen vakit bildirim sesinin kısa önizlemesi ("telefon" için telefonun varsayılan bildirim sesi). */
        @JavascriptInterface
        fun playTone(tone: String) {
            if (tone == "telefon") {
                activity.runOnUiThread {
                    try {
                        val r = android.media.RingtoneManager.getRingtone(activity, android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION))
                        r?.play()
                    } catch (e: Exception) {}
                }
            } else {
                Notifs.playTone(activity.applicationContext, tone)
            }
        }

        /** Vakit bildirimi kanalının ayar ekranını açar; kullanıcı telefondaki istediği sesi seçer. */
        @JavascriptInterface
        fun openSoundSettings() {
            activity.runOnUiThread {
                try {
                    val intent = Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS).apply {
                        putExtra(Settings.EXTRA_APP_PACKAGE, activity.packageName)
                        putExtra(Settings.EXTRA_CHANNEL_ID, Notifs.alertChannelId(activity))
                    }
                    activity.startActivity(intent)
                } catch (e: Exception) {
                    try {
                        activity.startActivity(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                            putExtra(Settings.EXTRA_APP_PACKAGE, activity.packageName)
                        })
                    } catch (e2: Exception) {
                    }
                }
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

        @Suppress("DEPRECATION")
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
                    val nu = Uri.parse(newUrl ?: "")
                    val h = nu.host ?: ""
                    if (nu.scheme != "https" || !(h == "github.com" || h.endsWith(".githubusercontent.com"))) {
                        runOnUiThread {
                            webView.evaluateJavascript("window.app && window.app.onUpdateDownloadError('Güvenli olmayan yönlendirme engellendi');", null)
                        }
                        return@thread
                    }
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
                    val errMsg = (e.message ?: "Bilinmeyen hata").replace("\\", " ").replace("'", " ").replace("\n", " ")
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
            val errMsg = (e.message ?: "Bilinmeyen hata").replace("\\", " ").replace("'", " ").replace("\n", " ")
            webView.evaluateJavascript("window.app && window.app.onUpdateDownloadError('Kurulum başlatılamadı: $errMsg');", null)
        }
    }
}
