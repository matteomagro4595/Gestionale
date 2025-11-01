package com.gestionale.app.data.repository

import com.gestionale.app.data.models.*
import com.gestionale.app.data.remote.api.AuthApi
import com.gestionale.app.utils.Resource
import com.gestionale.app.utils.TokenManager
import com.gestionale.app.utils.safeApiCall
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val tokenManager: TokenManager
) {

    suspend fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String
    ): Resource<UserResponse> {
        val request = RegisterRequest(
            email = email,
            password = password,
            nome = firstName,
            cognome = lastName
        )
        return safeApiCall { authApi.register(request) }
    }

    suspend fun login(email: String, password: String): Resource<TokenResponse> {
        val request = LoginRequest(email, password)
        val result = safeApiCall { authApi.login(request) }

        // Save token if login successful
        if (result is Resource.Success) {
            result.data?.let {
                tokenManager.saveToken(it.accessToken)
            }
        }

        return result
    }

    suspend fun getCurrentUser(): Resource<UserResponse> {
        return safeApiCall { authApi.getCurrentUser() }
    }

    suspend fun updateEmail(newEmail: String): Resource<MessageResponse> {
        return safeApiCall { authApi.updateEmail(UpdateEmailRequest(newEmail)) }
    }

    suspend fun updatePassword(oldPassword: String, newPassword: String): Resource<MessageResponse> {
        return safeApiCall {
            authApi.updatePassword(UpdatePasswordRequest(oldPassword, newPassword))
        }
    }

    suspend fun logout() {
        tokenManager.clearToken()
    }

    fun getToken(): Flow<String?> {
        return tokenManager.getToken()
    }

    suspend fun isLoggedIn(): Boolean {
        val token = tokenManager.getToken()
        // Simple check - could be enhanced with token expiration validation
        return token != null
    }
}
