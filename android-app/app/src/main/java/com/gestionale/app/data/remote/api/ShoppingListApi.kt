package com.gestionale.app.data.remote.api

import com.gestionale.app.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ShoppingListApi {

    // Lists
    @POST("shopping-lists")
    suspend fun createList(@Body request: CreateShoppingListRequest): Response<ShoppingListResponse>

    @GET("shopping-lists")
    suspend fun getLists(
        @Query("skip") skip: Int = 0,
        @Query("limit") limit: Int = 100
    ): Response<List<ShoppingListResponse>>

    @GET("shopping-lists/{list_id}")
    suspend fun getList(@Path("list_id") listId: Int): Response<ShoppingListResponse>

    @GET("shopping-lists/shared/{share_token}")
    suspend fun accessListByToken(@Path("share_token") shareToken: String): Response<ShoppingListResponse>

    @PUT("shopping-lists/{list_id}")
    suspend fun updateList(
        @Path("list_id") listId: Int,
        @Body request: UpdateShoppingListRequest
    ): Response<ShoppingListResponse>

    @DELETE("shopping-lists/{list_id}")
    suspend fun deleteList(@Path("list_id") listId: Int): Response<MessageResponse>

    // Items
    @POST("shopping-lists/{list_id}/items")
    suspend fun createItem(
        @Path("list_id") listId: Int,
        @Body request: CreateShoppingItemRequest
    ): Response<ShoppingItemResponse>

    @PUT("shopping-lists/{list_id}/items/{item_id}")
    suspend fun updateItem(
        @Path("list_id") listId: Int,
        @Path("item_id") itemId: Int,
        @Body request: UpdateShoppingItemRequest
    ): Response<ShoppingItemResponse>

    @DELETE("shopping-lists/{list_id}/items/{item_id}")
    suspend fun deleteItem(
        @Path("list_id") listId: Int,
        @Path("item_id") itemId: Int
    ): Response<MessageResponse>
}
