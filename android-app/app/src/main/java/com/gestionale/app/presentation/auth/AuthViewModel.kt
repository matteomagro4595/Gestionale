package com.gestionale.app.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gestionale.app.data.models.TokenResponse
import com.gestionale.app.data.models.UserResponse
import com.gestionale.app.domain.usecase.auth.*
import com.gestionale.app.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
    private val registerUseCase: RegisterUseCase,
    private val logoutUseCase: LogoutUseCase,
    private val getCurrentUserUseCase: GetCurrentUserUseCase
) : ViewModel() {

    private val _loginState = MutableStateFlow<Resource<TokenResponse>?>(null)
    val loginState: StateFlow<Resource<TokenResponse>?> = _loginState.asStateFlow()

    private val _registerState = MutableStateFlow<Resource<UserResponse>?>(null)
    val registerState: StateFlow<Resource<UserResponse>?> = _registerState.asStateFlow()

    private val _currentUser = MutableStateFlow<Resource<UserResponse>?>(null)
    val currentUser: StateFlow<Resource<UserResponse>?> = _currentUser.asStateFlow()

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _loginState.value = Resource.Loading()
            val result = loginUseCase(email, password)
            _loginState.value = result

            // Load current user on successful login
            if (result is Resource.Success) {
                loadCurrentUser()
            }
        }
    }

    fun register(
        email: String,
        password: String,
        confirmPassword: String,
        firstName: String,
        lastName: String
    ) {
        viewModelScope.launch {
            _registerState.value = Resource.Loading()
            val result = registerUseCase(email, password, confirmPassword, firstName, lastName)
            _registerState.value = result
        }
    }

    fun loadCurrentUser() {
        viewModelScope.launch {
            _currentUser.value = Resource.Loading()
            val result = getCurrentUserUseCase()
            _currentUser.value = result
        }
    }

    fun logout() {
        viewModelScope.launch {
            logoutUseCase()
            _currentUser.value = null
            _loginState.value = null
        }
    }

    fun clearLoginState() {
        _loginState.value = null
    }

    fun clearRegisterState() {
        _registerState.value = null
    }
}
