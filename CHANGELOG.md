# Changelog

All notable changes to the NestSave Savings Planner & Wealth Engine project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/2.0.0.html).

---

## [1.0.1] - 2026-10-15

### Added
- **Automated In-App Updater Engine**: Native Android `UpdateManager` that checks `/api/version` (Vercel edge CDN) and GitHub raw repositories with 1-tap APK download & install flow.
- **Dedicated Features Showcase Page (`/features`)**: Complete architectural breakdown of privacy, cryptography, Indian banking algorithms, and comparison matrix against cloud apps.
- **Platform Showcase Infographics**: Embedded official multi-device banner and "What's New in this Update" release preview.
- **Enhanced Web View APK Prompt**: High-contrast, dismissible banner encouraging web visitors to experience the full hardware biometric and offline enhancements of the native Android APK.
- **Public Version API Route (`/api/version`)**: Edge-cached Next.js endpoint serving real-time version metadata and changelogs.

### Changed
- Refactored `SettingsScreen` on Android to include dynamic "APP UPDATES & RELEASES" status card with live update polling and version comparison.
- Updated download page (`/download`) with verified camera-scannable QR code and matching SHA-256 build checksums.
- Enabled `buildConfig` in Android Gradle configuration to automatically expose version metadata to Kotlin code.

---

## [1.0.0] - 2026-10-15

### Added
- **Native Android Application (`com.nestsave`)**:
  - Pure Kotlin 2.0 & Jetpack Compose multi-screen architecture (Home, Analytics, Expenses, Badges, Settings).
  - 100% offline Room SQLite database with zero cloud tracking and zero internet telemetry.
  - Hardware Biometric Vault Lock (`BiometricPrompt`) with fingerprint and 3D facial recognition overlay.
  - Linux 16 KB page-size compliance for Android 15 compatibility.
  - Full ARM64 and x86_64 ABI support.
- **Deterministic Financial Engine**:
  - **Indian Bank Recurring Deposit (RD) Calculator**: Exact quarterly compounding formula matching SBI, HDFC, and ICICI bank statements.
  - **Fixed Deposit (FD) Maturity Projector**: Compounding calculations for term deposits from 7 days to 10 years.
  - **1-Click Plan Recalibration**: Dynamic algorithmic shortfall recovery (deadline extension or monthly savings boost).
  - **Salary-Day Batch Allocator**: 1-tap multi-goal distribution weighted by priority (Emergency > High > Medium > Low).
  - **Inflation Adjuster**: Real purchasing power future valuation based on customizable CPI inflation.
- **Web Application & Offline PWA**:
  - Full-featured client-side Next.js 14 companion app with service worker offline caching.
  - Client-side AES-GCM 256 encryption with PBKDF2 passphrase vault lock.
  - Printable statements & completion certificates.
  - Habit streaks (🔥 7d, 14d, 30d) and unlocked achievement badges.
- **Open-Source Health & Governance**:
  - MIT License (Copyright 2026 Jojin John).
  - Contributor Covenant Code of Conduct v2.1.
  - Security vulnerability reporting policy for client-side cryptography.
  - Automated GitHub Actions CI & Release workflows.
