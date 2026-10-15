package com.nestsave.domain.models

import kotlinx.serialization.Serializable

@Serializable
enum class GoalType {
    PURCHASE, GENERAL, EMERGENCY, OTHER
}

@Serializable
enum class Priority {
    CRITICAL, HIGH, MEDIUM, LOW
}

@Serializable
enum class SavingsFrequency {
    DAILY, WEEKLY, MONTHLY
}

@Serializable
enum class GoalStatus {
    ACTIVE, COMPLETED, PAUSED, ARCHIVED
}

@Serializable
data class Goal(
    val id: String,
    val name: String,
    val type: GoalType = GoalType.PURCHASE,
    val category: String,
    val targetAmount: Double,
    val currentAmount: Double = 0.0,
    val startDate: String,
    val targetDate: String,
    val priority: Priority = Priority.MEDIUM,
    val icon: String = "target",
    val note: String? = null,
    val productUrl: String? = null,
    val recurringContribution: Double? = null,
    val recurringFrequency: SavingsFrequency? = null,
    val status: GoalStatus = GoalStatus.ACTIVE,
    val celebratedMilestones: List<Int> = emptyList(),
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class Transaction(
    val id: String,
    val goalId: String,
    val type: String, // "deposit" or "withdrawal"
    val amount: Double,
    val note: String = "",
    val date: String,
    val createdAt: String
)

@Serializable
data class Expense(
    val id: String,
    val description: String,
    val amount: Double,
    val category: String,
    val date: String,
    val isRecurring: Boolean = false,
    val createdAt: String
)

@Serializable
data class Budget(
    val id: String,
    val category: String,
    val monthlyLimit: Double,
    val month: String
)

@Serializable
data class AppSettings(
    val theme: String = "system", // "light", "dark", "system"
    val currency: String = "INR",
    val currencySymbol: String = "₹",
    val monthlyIncome: Double? = null,
    val fixedMonthlyExpenses: Double? = null,
    val otherMonthlySavings: Double? = null,
    val safetyBuffer: Double? = null,
    val notificationsEnabled: Boolean = false,
    val biometricsEnabled: Boolean = false,
    val appLockEnabled: Boolean = false,
    val pinHash: String? = null,
    val pinSalt: String? = null
)

@Serializable
data class SavingsStreak(
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val lastDepositDate: String? = null,
    val totalDepositDays: Int = 0
)

@Serializable
data class Badge(
    val id: String,
    val name: String,
    val description: String,
    val icon: String,
    val earnedAt: String? = null
)
