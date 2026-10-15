package com.nestsave.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = NestEmeraldLight,
    onPrimary = PureBlack,
    primaryContainer = NestEmerald,
    onPrimaryContainer = TextDarkPrimary,
    background = PureBlack,
    surface = DarkSurface,
    surfaceVariant = DarkCard,
    onBackground = TextDarkPrimary,
    onSurface = TextDarkPrimary,
    onSurfaceVariant = TextDarkSecondary,
    error = AlertRose
)

private val LightColorScheme = lightColorScheme(
    primary = NestEmerald,
    onPrimary = TextDarkPrimary,
    primaryContainer = NestEmeraldLight,
    onPrimaryContainer = PureBlack,
    background = LightBackground,
    surface = LightSurface,
    surfaceVariant = LightSurface,
    onBackground = TextLightPrimary,
    onSurface = TextLightPrimary,
    onSurfaceVariant = TextLightSecondary,
    error = AlertRose
)

@Composable
fun NestSaveTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
