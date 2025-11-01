package com.gestionale.app.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "notifications")
data class NotificationEntity(
    @PrimaryKey val id: Int,
    val tipo: String,
    val titolo: String,
    val messaggio: String,
    val letta: Boolean,
    @ColumnInfo(name = "user_id") val userId: Int,
    @ColumnInfo(name = "created_at") val createdAt: String,
    val metadata: String? = null // JSON string
)
