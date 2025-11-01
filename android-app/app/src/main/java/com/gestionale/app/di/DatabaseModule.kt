package com.gestionale.app.di

import android.content.Context
import androidx.room.Room
import com.gestionale.app.data.local.GestionaleDatabase
import com.gestionale.app.data.local.dao.NotificationDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): GestionaleDatabase {
        return Room.databaseBuilder(
            context,
            GestionaleDatabase::class.java,
            GestionaleDatabase.DATABASE_NAME
        ).build()
    }

    @Provides
    @Singleton
    fun provideNotificationDao(database: GestionaleDatabase): NotificationDao {
        return database.notificationDao()
    }
}
