package com.gestionale.app.data.repository

import com.gestionale.app.data.models.*
import com.gestionale.app.data.remote.api.ShoppingListApi
import com.gestionale.app.utils.Resource
import com.gestionale.app.utils.safeApiCall
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ShoppingListRepository @Inject constructor(
    private val shoppingListApi: ShoppingListApi
) {

    // Lists
    suspend fun createList(name: String): Resource<ShoppingListResponse> {
        return safeApiCall { shoppingListApi.createList(CreateShoppingListRequest(name)) }
    }

    suspend fun getLists(): Resource<List<ShoppingListResponse>> {
        return safeApiCall { shoppingListApi.getLists() }
    }

    suspend fun getList(listId: Int): Resource<ShoppingListResponse> {
        return safeApiCall { shoppingListApi.getList(listId) }
    }

    suspend fun accessListByToken(shareToken: String): Resource<ShoppingListResponse> {
        return safeApiCall { shoppingListApi.accessListByToken(shareToken) }
    }

    suspend fun updateList(listId: Int, name: String): Resource<ShoppingListResponse> {
        return safeApiCall { shoppingListApi.updateList(listId, UpdateShoppingListRequest(name)) }
    }

    suspend fun deleteList(listId: Int): Resource<MessageResponse> {
        return safeApiCall { shoppingListApi.deleteList(listId) }
    }

    // Items
    suspend fun createItem(
        listId: Int,
        name: String,
        quantity: String? = null,
        notes: String? = null
    ): Resource<ShoppingItemResponse> {
        return safeApiCall {
            shoppingListApi.createItem(listId, CreateShoppingItemRequest(name, quantity, notes))
        }
    }

    suspend fun updateItem(
        listId: Int,
        itemId: Int,
        name: String? = null,
        quantity: String? = null,
        notes: String? = null,
        completed: Boolean? = null
    ): Resource<ShoppingItemResponse> {
        return safeApiCall {
            shoppingListApi.updateItem(
                listId,
                itemId,
                UpdateShoppingItemRequest(name, quantity, notes, completed)
            )
        }
    }

    suspend fun deleteItem(listId: Int, itemId: Int): Resource<MessageResponse> {
        return safeApiCall { shoppingListApi.deleteItem(listId, itemId) }
    }
}
