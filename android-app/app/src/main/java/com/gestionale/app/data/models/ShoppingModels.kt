package com.gestionale.app.data.models

import com.google.gson.annotations.SerializedName

// Shopping List models
data class ShoppingListResponse(
    val id: Int,
    val nome: String,
    @SerializedName("owner_id") val ownerId: Int,
    val owner: UserResponse,
    @SerializedName("share_token") val shareToken: String,
    @SerializedName("created_at") val createdAt: String,
    val items: List<ShoppingItemResponse> = emptyList(),
    @SerializedName("shared_with") val sharedWith: List<UserResponse> = emptyList()
)

data class CreateShoppingListRequest(
    val nome: String
)

data class UpdateShoppingListRequest(
    val nome: String
)

// Shopping Item models
data class ShoppingItemResponse(
    val id: Int,
    val nome: String,
    val quantita: String?,
    val note: String?,
    val completato: Boolean,
    @SerializedName("completed_by_id") val completedById: Int?,
    @SerializedName("completed_by") val completedBy: UserResponse?,
    @SerializedName("completed_at") val completedAt: String?,
    @SerializedName("created_at") val createdAt: String
)

data class CreateShoppingItemRequest(
    val nome: String,
    val quantita: String? = null,
    val note: String? = null
)

data class UpdateShoppingItemRequest(
    val nome: String? = null,
    val quantita: String? = null,
    val note: String? = null,
    val completato: Boolean? = null
)
