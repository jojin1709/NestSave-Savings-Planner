package com.nestsave.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "goals")
data class GoalEntity(
    @PrimaryKey val id: String,
    val name: String,
    val type: String,
    val category: String,
    val targetAmount: Double,
    val currentAmount: Double,
    val startDate: String,
    val targetDate: String,
    val priority: String,
    val icon: String,
    val note: String?,
    val productUrl: String?,
    val recurringContribution: Double?,
    val recurringFrequency: String?,
    val status: String,
    val celebratedMilestones: String, // Comma separated e.g. "25,50,75,100"
    val createdAt: String,
    val updatedAt: String
)

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    val goalId: String,
    val type: String,
    val amount: Double,
    val note: String,
    val date: String,
    val createdAt: String
)

@Entity(tableName = "expenses")
data class ExpenseEntity(
    @PrimaryKey val id: String,
    val description: String,
    val amount: Double,
    val category: String,
    val date: String,
    val isRecurring: Boolean,
    val createdAt: String
)

@Entity(tableName = "budgets")
data class BudgetEntity(
    @PrimaryKey val id: String,
    val category: String,
    val monthlyLimit: Double,
    val month: String
)
