package com.gestionale.app.data.repository

import com.gestionale.app.data.models.*
import com.gestionale.app.data.remote.api.ExpenseApi
import com.gestionale.app.utils.Resource
import com.gestionale.app.utils.safeApiCall
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ExpenseRepository @Inject constructor(
    private val expenseApi: ExpenseApi
) {

    // Groups
    suspend fun createGroup(name: String): Resource<ExpenseGroupResponse> {
        return safeApiCall { expenseApi.createGroup(CreateExpenseGroupRequest(name)) }
    }

    suspend fun getGroups(): Resource<List<ExpenseGroupResponse>> {
        return safeApiCall { expenseApi.getGroups() }
    }

    suspend fun getGroup(groupId: Int): Resource<ExpenseGroupResponse> {
        return safeApiCall { expenseApi.getGroup(groupId) }
    }

    suspend fun joinGroupByToken(shareToken: String): Resource<ExpenseGroupResponse> {
        return safeApiCall { expenseApi.joinGroupByToken(shareToken) }
    }

    suspend fun updateGroup(groupId: Int, name: String): Resource<ExpenseGroupResponse> {
        return safeApiCall { expenseApi.updateGroup(groupId, UpdateExpenseGroupRequest(name)) }
    }

    suspend fun deleteGroup(groupId: Int): Resource<MessageResponse> {
        return safeApiCall { expenseApi.deleteGroup(groupId) }
    }

    suspend fun addMember(groupId: Int, userEmail: String): Resource<ExpenseGroupResponse> {
        return safeApiCall { expenseApi.addMember(groupId, AddMemberRequest(userEmail)) }
    }

    suspend fun removeMember(groupId: Int, userId: Int): Resource<MessageResponse> {
        return safeApiCall { expenseApi.removeMember(groupId, userId) }
    }

    // Expenses
    suspend fun createExpense(
        description: String,
        amount: Double,
        tag: String,
        groupId: Int,
        divisionType: String,
        participants: List<ExpenseParticipantRequest>
    ): Resource<ExpenseResponse> {
        val request = CreateExpenseRequest(
            descrizione = description,
            importo = amount,
            tag = tag,
            groupId = groupId,
            divisionType = divisionType,
            participants = participants
        )
        return safeApiCall { expenseApi.createExpense(request) }
    }

    suspend fun getExpenses(groupId: Int? = null): Resource<List<ExpenseResponse>> {
        return safeApiCall { expenseApi.getExpenses(groupId) }
    }

    suspend fun getExpense(expenseId: Int): Resource<ExpenseResponse> {
        return safeApiCall { expenseApi.getExpense(expenseId) }
    }

    suspend fun updateExpense(
        expenseId: Int,
        description: String,
        amount: Double,
        tag: String
    ): Resource<ExpenseResponse> {
        return safeApiCall {
            expenseApi.updateExpense(expenseId, UpdateExpenseRequest(description, amount, tag))
        }
    }

    suspend fun deleteExpense(expenseId: Int): Resource<MessageResponse> {
        return safeApiCall { expenseApi.deleteExpense(expenseId) }
    }

    // Balances
    suspend fun getBalances(groupId: Int): Resource<List<BalanceResponse>> {
        return safeApiCall { expenseApi.getBalances(groupId) }
    }
}
