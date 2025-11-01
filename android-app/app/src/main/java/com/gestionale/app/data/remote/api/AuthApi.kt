package com.gestionale.app.data.remote.api

import com.gestionale.app.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface AuthApi {

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<UserResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<TokenResponse>

    @GET("auth/me")
    suspend fun getCurrentUser(): Response<UserResponse>

    @PUT("auth/update-email")
    suspend fun updateEmail(@Body request: UpdateEmailRequest): Response<MessageResponse>

    @PUT("auth/update-password")
    suspend fun updatePassword(@Body request: UpdatePasswordRequest): Response<MessageResponse>
}
