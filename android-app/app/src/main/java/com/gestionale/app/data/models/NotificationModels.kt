package com.gestionale.app.data.models

import com.google.gson.annotations.SerializedName

data class NotificationResponse(
    val id: Int,
    val tipo: String,
    val titolo: String,
    val messaggio: String,
    val letta: Boolean,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("created_at") val createdAt: String,
    val metadata: Map<String, Any>? = null
)

data class UnreadCountResponse(
    val count: Int
)

data class MarkReadRequest(
    val letta: Boolean
)

// WebSocket message
data class WebSocketMessage(
    val type: String,
    val notification: NotificationResponse
)
