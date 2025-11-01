package com.gestionale.app.data.repository

import com.gestionale.app.data.models.*
import com.gestionale.app.data.remote.api.GymApi
import com.gestionale.app.utils.Resource
import com.gestionale.app.utils.safeApiCall
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GymRepository @Inject constructor(
    private val gymApi: GymApi
) {

    // Workout Cards
    suspend fun createCard(name: String): Resource<GymCardResponse> {
        return safeApiCall { gymApi.createCard(CreateGymCardRequest(name)) }
    }

    suspend fun getCards(): Resource<List<GymCardResponse>> {
        return safeApiCall { gymApi.getCards() }
    }

    suspend fun getCard(cardId: Int): Resource<GymCardResponse> {
        return safeApiCall { gymApi.getCard(cardId) }
    }

    suspend fun updateCard(cardId: Int, name: String): Resource<GymCardResponse> {
        return safeApiCall { gymApi.updateCard(cardId, UpdateGymCardRequest(name)) }
    }

    suspend fun deleteCard(cardId: Int): Resource<MessageResponse> {
        return safeApiCall { gymApi.deleteCard(cardId) }
    }

    // Exercises
    suspend fun createExercise(
        cardId: Int,
        name: String,
        sets: Int,
        reps: Int,
        weight: Double? = null,
        notes: String? = null,
        order: Int = 0
    ): Resource<GymExerciseResponse> {
        val request = CreateGymExerciseRequest(name, sets, reps, weight, notes, order)
        return safeApiCall { gymApi.createExercise(cardId, request) }
    }

    suspend fun updateExercise(
        cardId: Int,
        exerciseId: Int,
        name: String? = null,
        sets: Int? = null,
        reps: Int? = null,
        weight: Double? = null,
        notes: String? = null,
        order: Int? = null
    ): Resource<GymExerciseResponse> {
        val request = UpdateGymExerciseRequest(name, sets, reps, weight, notes, order)
        return safeApiCall { gymApi.updateExercise(cardId, exerciseId, request) }
    }

    suspend fun deleteExercise(cardId: Int, exerciseId: Int): Resource<MessageResponse> {
        return safeApiCall { gymApi.deleteExercise(cardId, exerciseId) }
    }
}
