package com.nestsave.domain.updater

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.nestsave.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

@Serializable
data class VersionInfo(
    val versionCode: Int = 1,
    val versionName: String = "1.0.0",
    val releaseDate: String = "",
    val title: String = "",
    val changelog: List<String> = emptyList(),
    val apkUrl: String = "https://nestsave.vercel.app/downloads/NestSave.apk",
    val githubReleaseUrl: String = "https://github.com/jojin1709/NestSave-Savings-Planner/releases/latest",
    val downloadPageUrl: String = "https://nestsave.vercel.app/download"
)

data class UpdateCheckResult(
    val isUpdateAvailable: Boolean = false,
    val currentVersion: String = BuildConfig.VERSION_NAME,
    val currentVersionCode: Int = BuildConfig.VERSION_CODE,
    val latestVersion: VersionInfo? = null,
    val error: String? = null
)

object UpdateManager {
    private val json = Json { ignoreUnknownKeys = true }

    // Primary endpoint is Vercel edge API, secondary is raw GitHub repository
    private const val ENDPOINT_VERCEL = "https://nestsave.vercel.app/api/version"
    private const val ENDPOINT_GITHUB = "https://raw.githubusercontent.com/jojin1709/NestSave-Savings-Planner/master/version.json"

    suspend fun checkForUpdates(): UpdateCheckResult = withContext(Dispatchers.IO) {
        var remoteInfo: VersionInfo? = fetchFromUrl(ENDPOINT_VERCEL)
        if (remoteInfo == null) {
            remoteInfo = fetchFromUrl(ENDPOINT_GITHUB)
        }

        if (remoteInfo == null) {
            return@withContext UpdateCheckResult(
                error = "Unable to connect to update server. Check your connection or visit website."
            )
        }

        val hasNewerCode = remoteInfo.versionCode > BuildConfig.VERSION_CODE
        val hasNewerName = isVersionHigher(remoteInfo.versionName, BuildConfig.VERSION_NAME)

        UpdateCheckResult(
            isUpdateAvailable = hasNewerCode || hasNewerName,
            currentVersion = BuildConfig.VERSION_NAME,
            currentVersionCode = BuildConfig.VERSION_CODE,
            latestVersion = remoteInfo
        )
    }

    private fun fetchFromUrl(urlString: String): VersionInfo? {
        var connection: HttpURLConnection? = null
        return try {
            val url = URL(urlString)
            connection = (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = 6000
                readTimeout = 6000
                requestMethod = "GET"
                setRequestProperty("User-Agent", "NestSave-Android/${BuildConfig.VERSION_NAME}")
            }

            if (connection.responseCode in 200..299) {
                val reader = BufferedReader(InputStreamReader(connection.inputStream))
                val content = reader.use { it.readText() }
                json.decodeFromString<VersionInfo>(content)
            } else {
                null
            }
        } catch (_: Exception) {
            null
        } finally {
            connection?.disconnect()
        }
    }

    private fun isVersionHigher(remote: String, local: String): Boolean {
        try {
            val rParts = remote.removePrefix("v").split(".").map { it.toIntOrNull() ?: 0 }
            val lParts = local.removePrefix("v").split(".").map { it.toIntOrNull() ?: 0 }
            val maxLen = maxOf(rParts.size, lParts.size)
            for (i in 0 until maxLen) {
                val r = rParts.getOrElse(i) { 0 }
                val l = lParts.getOrElse(i) { 0 }
                if (r > l) return true
                if (r < l) return false
            }
        } catch (_: Exception) {
            // ignore
        }
        return false
    }

    fun openUpdateDownload(context: Context, url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (_: Exception) {
            // fallback
        }
    }
}
