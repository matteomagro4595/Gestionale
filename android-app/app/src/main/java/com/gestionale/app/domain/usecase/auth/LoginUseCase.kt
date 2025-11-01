package com.gestionale.app.domain.usecase.auth

import com.gestionale.app.data.models.TokenResponse
import com.gestionale.app.data.repository.AuthRepository
import com.gestionale.app.utils.Resource
import javax.inject.Inject

class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(email: String, password: String): Resource<TokenResponse> {
        // Validation
        if (email.isBlank()) {
            return Resource.Error("L'email non può essere vuota")
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            return Resource.Error("Email non valida")
        }
        if (password.isBlank()) {
            return Resource.Error("La password non può essere vuota")
        }
        if (password.length < 6) {
            return Resource.Error("La password deve essere almeno 6 caratteri")
        }

        return authRepository.login(email, password)
    }
}
