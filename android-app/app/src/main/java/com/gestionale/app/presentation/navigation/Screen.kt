package com.gestionale.app.presentation.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
    object Expenses : Screen("expenses")
    object ExpenseDetail : Screen("expenses/{groupId}") {
        fun createRoute(groupId: Int) = "expenses/$groupId"
    }
    object ShoppingLists : Screen("shopping")
    object ShoppingDetail : Screen("shopping/{listId}") {
        fun createRoute(listId: Int) = "shopping/$listId"
    }
    object Gym : Screen("gym")
    object GymDetail : Screen("gym/{cardId}") {
        fun createRoute(cardId: Int) = "gym/$cardId"
    }
    object Profile : Screen("profile")
}
