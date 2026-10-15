# 📱 NestSave Android Native (Kotlin + Jetpack Compose)

This directory contains the **100% native Android implementation** of NestSave, built with **Kotlin 2.0**, **Jetpack Compose (Material 3)**, and **Room SQLite Database**.

---

## 🔒 Core Principles

1. **Zero Cloud & Privacy First:** All data is stored locally in an on-device SQLite database via Room (`nestsave_vault.db`). No servers, no tracking, no network calls.
2. **Deterministic Financial Math:** Exact port of the TypeScript calculations engine into pure Kotlin (`FinancialCalculations.kt`), covering Bank RD, Fixed Deposit (FD), EMI, SIP, and Inflation adjustment.
3. **Cross-Platform Encrypted Backups:** Uses standard **PBKDF2 + AES-GCM 256** matching the web app's Web Crypto standard, so encrypted vault backups can be exported on Web and restored on Android (or vice-versa).
4. **Biometric Security:** Integrated support for AndroidX `BiometricPrompt` (Fingerprint, Face Unlock) and 4-digit PIN with salted SHA-256 hashing.

---

## 📁 Architecture Overview

```text
android/
├── app/
│   ├── build.gradle.kts                — Compose, Room, Biometric, and Kotlinx dependencies
│   ├── src/
│   │   ├── main/
│   │   │   ├── AndroidManifest.xml     — Biometric and launcher configuration
│   │   │   └── java/com/nestsave/
│   │   │       ├── NestSaveApp.kt      — Application entry with Room DB singleton
│   │   │       ├── MainActivity.kt     — Jetpack Compose UI (Scaffold, TopBar, Dashboard, Dialogs)
│   │   │       │
│   │   │       ├── domain/
│   │   │       │   ├── models/Models.kt                — Goal, Transaction, Expense, AppSettings
│   │   │       │   └── calculations/FinancialCalculations.kt — Bank RD, FD, EMI, SIP, Pace, Inflation
│   │   │       │
│   │   │       ├── data/
│   │   │       │   ├── local/
│   │   │       │   │   ├── Entities.kt                 — Room Database Entities
│   │   │       │   │   ├── Daos.kt                     — Room DAOs with Kotlin Coroutines / Flow
│   │   │       │   │   └── AppDatabase.kt              — Room Database singleton
│   │   │       │   └── security/VaultSecurity.kt       — Salted SHA-256 PIN & AES-GCM 256 encryption
│   │   │       │
│   │   │       └── ui/theme/
│   │   │           ├── Color.kt                        — Pure Black (#000000) & Emerald (#0D684C)
│   │   │           └── Theme.kt                        — Pitch-black dark theme configuration
│   │   │
│   │   └── test/java/com/nestsave/
│   │       └── FinancialCalculationsTest.kt            — JUnit tests verifying RD, FD, EMI & Inflation
│   │
│   └── proguard-rules.pro
├── build.gradle.kts                    — Root Gradle build script
└── settings.gradle.kts                 — Project configuration (:app)
```

---

## 🚀 How to Run in Android Studio

1. Open **Android Studio** (Hedgehog, Iguana, or Koala+).
2. Click **Open** and select the `d:\NestSave-Savings-Planner-v1\android` directory.
3. Allow Gradle to sync dependencies automatically.
4. Select an Android emulator (API 26+) or connect your physical Android phone with USB Debugging enabled.
5. Click **Run** (`Shift + F10`).
