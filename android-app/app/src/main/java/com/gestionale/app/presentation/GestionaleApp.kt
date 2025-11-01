package com.gestionale.app.presentation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.gestionale.app.presentation.auth.AuthViewModel
import com.gestionale.app.presentation.auth.LoginScreen
import com.gestionale.app.presentation.auth.RegisterScreen
import com.gestionale.app.presentation.home.HomeScreen
import com.gestionale.app.presentation.navigation.Screen

@Composable
fun GestionaleApp() {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = hiltViewModel()

    // Observe auth state to navigate appropriately
    val loginState by authViewModel.loginState.collectAsState()
    val currentUser by authViewModel.currentUser.collectAsState()

    // Auto-navigate on successful login
    LaunchedEffect(loginState) {
        if (loginState is com.gestionale.app.utils.Resource.Success) {
            navController.navigate(Screen.Home.route) {
                popUpTo(Screen.Login.route) { inclusive = true }
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = Screen.Login.route
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                navController = navController,
                viewModel = authViewModel
            )
        }

        composable(Screen.Register.route) {
            RegisterScreen(
                navController = navController,
                viewModel = authViewModel
            )
        }

        composable(Screen.Home.route) {
            HomeScreen(
                navController = navController,
                authViewModel = authViewModel
            )
        }

        // Add other screens here as needed
    }
}
