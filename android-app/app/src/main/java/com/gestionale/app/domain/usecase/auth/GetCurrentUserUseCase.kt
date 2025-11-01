package com.gestionale.app.domain.usecase.auth

import com.gestionale.app.data.models.UserResponse
import com.gestionale.app.data.repository.AuthRepository
import com.gestionale.app.utils.Resource
import javax.inject.Inject

class GetCurrentUserUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(): Resource<UserResponse> {
        return authRepository.getCurrentUser()
    }
}
