package com.gestionale.app.data.remote.api

import com.gestionale.app.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface NotificationApi {

    @GET("notifications")
    suspend fun getNotifications(
        @Query("skip") skip: Int = 0,
        @Query("limit") limit: Int = 100
    ): Response<List<NotificationResponse>>

    @GET("notifications/unread-count")
    suspend fun getUnreadCount(): Response<UnreadCountResponse>

    @PUT("notifications/{id}/mark-read")
    suspend fun markAsRead(
        @Path("id") notificationId: Int,
        @Body request: MarkReadRequest
    ): Response<NotificationResponse>

    @PUT("notifications/mark-all-read")
    suspend fun markAllAsRead(): Response<MessageResponse>

    @DELETE("notifications/{id}")
    suspend fun deleteNotification(@Path("id") notificationId: Int): Response<MessageResponse>
}
