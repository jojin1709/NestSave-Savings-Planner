package com.nestsave

import android.app.Application
import com.nestsave.data.local.AppDatabase

class NestSaveApp : Application() {
    val database: AppDatabase by lazy { AppDatabase.getInstance(this) }

    override fun onCreate() {
        super.onCreate()
    }
}
