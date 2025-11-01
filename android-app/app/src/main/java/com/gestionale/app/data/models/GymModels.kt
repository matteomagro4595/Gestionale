package com.gestionale.app.data.models

import com.google.gson.annotations.SerializedName

// Gym Card models
data class GymCardResponse(
    val id: Int,
    val nome: String,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("created_at") val createdAt: String,
    val exercises: List<GymExerciseResponse> = emptyList()
)

data class CreateGymCardRequest(
    val nome: String
)

data class UpdateGymCardRequest(
    val nome: String
)

// Gym Exercise models
data class GymExerciseResponse(
    val id: Int,
    val nome: String,
    val serie: Int,
    val ripetizioni: Int,
    val peso: Double?,
    val note: String?,
    val ordine: Int,
    @SerializedName("card_id") val cardId: Int
)

data class CreateGymExerciseRequest(
    val nome: String,
    val serie: Int,
    val ripetizioni: Int,
    val peso: Double? = null,
    val note: String? = null,
    val ordine: Int = 0
)

data class UpdateGymExerciseRequest(
    val nome: String? = null,
    val serie: Int? = null,
    val ripetizioni: Int? = null,
    val peso: Double? = null,
    val note: String? = null,
    val ordine: Int? = null
)
