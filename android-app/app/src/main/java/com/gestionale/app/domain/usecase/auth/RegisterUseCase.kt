package com.gestionale.app.domain.usecase.auth

import com.gestionale.app.data.models.UserResponse
import com.gestionale.app.data.repository.AuthRepository
import com.gestionale.app.utils.Resource
import javax.inject.Inject

class RegisterUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(
        email: String,
        password: String,
        confirmPassword: String,
        firstName: String,
        lastName: String
    ): Resource<UserResponse> {
        // Validation
        if (email.isBlank()) {
            return Resource.Error("L'email non può essere vuota")
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            return Resource.Error("Email non valida")
        }
        if (firstName.isBlank()) {
            return Resource.Error("Il nome non può essere vuoto")
        }
        if (lastName.isBlank()) {
            return Resource.Error("Il cognome non può essere vuoto")
        }
        if (password.isBlank()) {
            return Resource.Error("La password non può essere vuota")
        }
        if (password.length < 6) {
            return Resource.Error("La password deve essere almeno 6 caratteri")
        }
        if (password != confirmPassword) {
            return Resource.Error("Le password non corrispondono")
        }

        return authRepository.register(email, password, firstName, lastName)
    }
}
