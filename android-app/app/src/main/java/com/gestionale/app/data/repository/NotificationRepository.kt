package com.gestionale.app.data.repository

import com.gestionale.app.data.local.dao.NotificationDao
import com.gestionale.app.data.local.entity.NotificationEntity
import com.gestionale.app.data.models.*
import com.gestionale.app.data.remote.WebSocketManager
import com.gestionale.app.data.remote.api.NotificationApi
import com.gestionale.app.utils.Resource
import com.gestionale.app.utils.safeApiCall
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotificationRepository @Inject constructor(
    private val notificationApi: NotificationApi,
    private val notificationDao: NotificationDao,
    private val webSocketManager: WebSocketManager
) {

    // Remote API calls
    suspend fun getNotifications(): Resource<List<NotificationResponse>> {
        val result = safeApiCall { notificationApi.getNotifications() }

        // Cache notifications locally
        if (result is Resource.Success) {
            result.data?.let { notifications ->
                val entities = notifications.map { it.toEntity() }
                notificationDao.insertNotifications(entities)
            }
        }

        return result
    }

    suspend fun getUnreadCount(): Resource<UnreadCountResponse> {
        return safeApiCall { notificationApi.getUnreadCount() }
    }

    suspend fun markAsRead(notificationId: Int, isRead: Boolean): Resource<NotificationResponse> {
        val result = safeApiCall {
            notificationApi.markAsRead(notificationId, MarkReadRequest(isRead))
        }

        // Update local cache
        if (result is Resource.Success) {
            notificationDao.markAsRead(notificationId, isRead)
        }

        return result
    }

    suspend fun markAllAsRead(): Resource<MessageResponse> {
        val result = safeApiCall { notificationApi.markAllAsRead() }

        // Update local cache
        if (result is Resource.Success) {
            notificationDao.markAllAsRead()
        }

        return result
    }

    suspend fun deleteNotification(notificationId: Int): Resource<MessageResponse> {
        val result = safeApiCall { notificationApi.deleteNotification(notificationId) }

        // Delete from local cache
        if (result is Resource.Success) {
            notificationDao.deleteNotificationById(notificationId)
        }

        return result
    }

    // Local database queries (for offline support)
    fun getLocalNotifications(): Flow<List<NotificationEntity>> {
        return notificationDao.getAllNotifications()
    }

    fun getLocalUnreadNotifications(): Flow<List<NotificationEntity>> {
        return notificationDao.getUnreadNotifications()
    }

    fun getLocalUnreadCount(): Flow<Int> {
        return notificationDao.getUnreadCount()
    }

    // WebSocket management
    fun connectWebSocket() {
        webSocketManager.connect()
    }

    fun disconnectWebSocket() {
        webSocketManager.disconnect()
    }

    fun getWebSocketNotifications(): Flow<NotificationResponse> {
        return webSocketManager.notifications
    }

    fun getWebSocketConnectionState(): Flow<WebSocketManager.ConnectionState> {
        return webSocketManager.connectionState
    }

    // Helper to save real-time notification to local db
    suspend fun saveNotificationLocally(notification: NotificationResponse) {
        notificationDao.insertNotification(notification.toEntity())
    }

    private fun NotificationResponse.toEntity() = NotificationEntity(
        id = id,
        tipo = tipo,
        titolo = titolo,
        messaggio = messaggio,
        letta = letta,
        userId = userId,
        createdAt = createdAt,
        metadata = metadata?.toString()
    )
}
