package com.gestionale.app.data.remote.api

import com.gestionale.app.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface GymApi {

    // Workout Cards
    @POST("gym/cards")
    suspend fun createCard(@Body request: CreateGymCardRequest): Response<GymCardResponse>

    @GET("gym/cards")
    suspend fun getCards(
        @Query("skip") skip: Int = 0,
        @Query("limit") limit: Int = 100
    ): Response<List<GymCardResponse>>

    @GET("gym/cards/{card_id}")
    suspend fun getCard(@Path("card_id") cardId: Int): Response<GymCardResponse>

    @PUT("gym/cards/{card_id}")
    suspend fun updateCard(
        @Path("card_id") cardId: Int,
        @Body request: UpdateGymCardRequest
    ): Response<GymCardResponse>

    @DELETE("gym/cards/{card_id}")
    suspend fun deleteCard(@Path("card_id") cardId: Int): Response<MessageResponse>

    // Exercises
    @POST("gym/cards/{card_id}/exercises")
    suspend fun createExercise(
        @Path("card_id") cardId: Int,
        @Body request: CreateGymExerciseRequest
    ): Response<GymExerciseResponse>

    @PUT("gym/cards/{card_id}/exercises/{exercise_id}")
    suspend fun updateExercise(
        @Path("card_id") cardId: Int,
        @Path("exercise_id") exerciseId: Int,
        @Body request: UpdateGymExerciseRequest
    ): Response<GymExerciseResponse>

    @DELETE("gym/cards/{card_id}/exercises/{exercise_id}")
    suspend fun deleteExercise(
        @Path("card_id") cardId: Int,
        @Path("exercise_id") exerciseId: Int
    ): Response<MessageResponse>
}
