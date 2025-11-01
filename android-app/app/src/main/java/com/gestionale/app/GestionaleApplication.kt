package com.gestionale.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class GestionaleApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        // Initialize any required components here
    }
}
