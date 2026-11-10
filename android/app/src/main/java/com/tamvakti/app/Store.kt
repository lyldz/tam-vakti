package com.tamvakti.app

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONObject

/** Native tarafın küçük kalıcı deposu (alarm listesi, sessize alma durumu). */
object Store {
    private const val FILE = "tamvakti_native"

    fun prefs(ctx: Context): SharedPreferences =
        ctx.applicationContext.getSharedPreferences(FILE, Context.MODE_PRIVATE)

    fun schedule(ctx: Context): JSONObject? {
        val raw = prefs(ctx).getString("schedule", null) ?: return null
        return try { JSONObject(raw) } catch (e: Exception) { null }
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

    fun city(ctx: Context): String = schedule(ctx)?.optString("city", "Tam Vakti") ?: "Tam Vakti"
    fun fullScreenEnabled(ctx: Context): Boolean = schedule(ctx)?.optBoolean("fullscreen", false) ?: false
    fun ongoingEnabled(ctx: Context): Boolean = schedule(ctx)?.optBoolean("ongoing", false) ?: false
}
