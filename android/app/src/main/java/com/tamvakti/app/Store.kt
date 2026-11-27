package com.tamvakti.app

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONObject

/** Native tarafın küçük kalıcı deposu (alarm listesi, sessize alma durumu). */
object Store {
    private const val FILE = "tamvakti_native"
    @Volatile private var cachedRaw: String? = null
    @Volatile private var cachedObj: JSONObject? = null

    fun prefs(ctx: Context): SharedPreferences =
        ctx.applicationContext.getSharedPreferences(FILE, Context.MODE_PRIVATE)

    fun schedule(ctx: Context): JSONObject? {
        val raw = prefs(ctx).getString("schedule", null) ?: return null
        if (raw == cachedRaw) return cachedObj
        val parsed = try { JSONObject(raw) } catch (e: Exception) { null }
        cachedRaw = raw
        cachedObj = parsed
        return parsed
    }

    data class NextPrayer(val name: String, val time: String, val millis: Long)

    /** Kayıtlı listeden şu andan sonraki ilk vakti bulur. */
    fun nextPrayer(ctx: Context): NextPrayer? {
        val arr = schedule(ctx)?.optJSONArray("prayers") ?: return null
        val now = System.currentTimeMillis()
        var best: NextPrayer? = null
        for (i in 0 until arr.length()) {
            val o = arr.optJSONObject(i) ?: continue
            val t = o.optLong("t", 0L)
            if (t > now && (best == null || t < best.millis)) {
                best = NextPrayer(o.optString("name"), o.optString("time"), t)
            }
        }
        return best
    }

    /** Kayıtlı listeden şu andan önceki son vakit (ilerleme çubuğunun başlangıcı). */
    fun prevPrayer(ctx: Context): NextPrayer? {
        val arr = schedule(ctx)?.optJSONArray("prayers") ?: return null
        val now = System.currentTimeMillis()
        var best: NextPrayer? = null
        for (i in 0 until arr.length()) {
            val o = arr.optJSONObject(i) ?: continue
            val t = o.optLong("t", 0L)
            if (t in 1..now && (best == null || t > best.millis)) {
                best = NextPrayer(o.optString("name"), o.optString("time"), t)
            }
        }
        return best
    }

    fun city(ctx: Context): String = schedule(ctx)?.optString("city", "Tam Vakti") ?: "Tam Vakti"
    /** Seçili vakit bildirim sesi: "telefon" (varsayılan) ya da raw kaynağı adı (cagri, billur, seher, damla). */
    fun tone(ctx: Context): String {
        val t = schedule(ctx)?.optString("tone", "telefon") ?: "telefon"
        return if (Regex("[a-z]{1,20}").matches(t)) t else "telefon"
    }
    fun fullScreenEnabled(ctx: Context): Boolean = schedule(ctx)?.optBoolean("fullscreen", false) ?: false
    fun ongoingEnabled(ctx: Context): Boolean = schedule(ctx)?.optBoolean("ongoing", false) ?: false
    fun fullScreenKeepScreenMs(ctx: Context): Long {
        val sec = schedule(ctx)?.optInt("keepScreenSec", 60) ?: 60
        return sec.coerceIn(10, 300) * 1000L
    }
    fun fullScreenAutoCloseMs(ctx: Context): Long {
        val min = schedule(ctx)?.optInt("autoCloseMin", 5) ?: 5
        return min.coerceIn(1, 30) * 60 * 1000L
    }
}
