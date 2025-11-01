package com.gestionale.app.data.models

import com.google.gson.annotations.SerializedName

// Expense Group models
data class ExpenseGroupResponse(
    val id: Int,
    val nome: String,
    @SerializedName("share_token") val shareToken: String,
    @SerializedName("creator_id") val creatorId: Int,
    val creator: UserResponse,
    val members: List<UserResponse> = emptyList(),
    @SerializedName("created_at") val createdAt: String
)

data class CreateExpenseGroupRequest(
    val nome: String
)

data class UpdateExpenseGroupRequest(
    val nome: String
)

// Expense models
data class ExpenseResponse(
    val id: Int,
    val descrizione: String,
    val importo: Double,
    val tag: String,
    @SerializedName("group_id") val groupId: Int,
    @SerializedName("payer_id") val payerId: Int,
    val payer: UserResponse,
    @SerializedName("created_at") val createdAt: String,
    val participants: List<ExpenseParticipantResponse> = emptyList()
)

data class ExpenseParticipantResponse(
    @SerializedName("user_id") val userId: Int,
    val user: UserResponse,
    val importo: Double?,
    val percentuale: Double?
)

data class CreateExpenseRequest(
    val descrizione: String,
    val importo: Double,
    val tag: String,
    @SerializedName("group_id") val groupId: Int,
    @SerializedName("division_type") val divisionType: String, // "equal", "exact", "percentage"
    val participants: List<ExpenseParticipantRequest>
)

data class ExpenseParticipantRequest(
    @SerializedName("user_id") val userId: Int,
    val importo: Double? = null,
    val percentuale: Double? = null
)

data class UpdateExpenseRequest(
    val descrizione: String,
    val importo: Double,
    val tag: String
)

// Balance models
data class BalanceResponse(
    @SerializedName("user_id") val userId: Int,
    val user: UserResponse,
    val balance: Double
)

data class AddMemberRequest(
    @SerializedName("user_email") val userEmail: String
)
