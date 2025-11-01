package com.gestionale.app.data.models

import com.google.gson.annotations.SerializedName

// Request models
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val nome: String,
    val cognome: String
)

data class UpdateEmailRequest(
    @SerializedName("new_email") val newEmail: String
)

data class UpdatePasswordRequest(
    @SerializedName("old_password") val oldPassword: String,
    @SerializedName("new_password") val newPassword: String
)

// Response models
data class TokenResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("token_type") val tokenType: String = "bearer"
)

data class UserResponse(
    val id: Int,
    val email: String,
    val nome: String,
    val cognome: String
)

data class MessageResponse(
    val message: String
)
