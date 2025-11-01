package com.gestionale.app.data.remote.api

import com.gestionale.app.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ExpenseApi {

    // Groups
    @POST("expenses/groups")
    suspend fun createGroup(@Body request: CreateExpenseGroupRequest): Response<ExpenseGroupResponse>

    @GET("expenses/groups")
    suspend fun getGroups(
        @Query("skip") skip: Int = 0,
        @Query("limit") limit: Int = 100
    ): Response<List<ExpenseGroupResponse>>

    @GET("expenses/groups/{group_id}")
    suspend fun getGroup(@Path("group_id") groupId: Int): Response<ExpenseGroupResponse>

    @GET("expenses/groups/shared/{share_token}")
    suspend fun joinGroupByToken(@Path("share_token") shareToken: String): Response<ExpenseGroupResponse>

    @PUT("expenses/groups/{group_id}")
    suspend fun updateGroup(
        @Path("group_id") groupId: Int,
        @Body request: UpdateExpenseGroupRequest
    ): Response<ExpenseGroupResponse>

    @DELETE("expenses/groups/{group_id}")
    suspend fun deleteGroup(@Path("group_id") groupId: Int): Response<MessageResponse>

    // Members
    @POST("expenses/groups/{group_id}/members")
    suspend fun addMember(
        @Path("group_id") groupId: Int,
        @Body request: AddMemberRequest
    ): Response<ExpenseGroupResponse>

    @DELETE("expenses/groups/{group_id}/members/{user_id}")
    suspend fun removeMember(
        @Path("group_id") groupId: Int,
        @Path("user_id") userId: Int
    ): Response<MessageResponse>

    // Expenses
    @POST("expenses/expenses")
    suspend fun createExpense(@Body request: CreateExpenseRequest): Response<ExpenseResponse>

    @GET("expenses/expenses")
    suspend fun getExpenses(
        @Query("group_id") groupId: Int? = null,
        @Query("skip") skip: Int = 0,
        @Query("limit") limit: Int = 100
    ): Response<List<ExpenseResponse>>

    @GET("expenses/expenses/{expense_id}")
    suspend fun getExpense(@Path("expense_id") expenseId: Int): Response<ExpenseResponse>

    @PUT("expenses/expenses/{expense_id}")
    suspend fun updateExpense(
        @Path("expense_id") expenseId: Int,
        @Body request: UpdateExpenseRequest
    ): Response<ExpenseResponse>

    @DELETE("expenses/expenses/{expense_id}")
    suspend fun deleteExpense(@Path("expense_id") expenseId: Int): Response<MessageResponse>

    // Balances
    @GET("expenses/groups/{group_id}/balances")
    suspend fun getBalances(@Path("group_id") groupId: Int): Response<List<BalanceResponse>>
}
