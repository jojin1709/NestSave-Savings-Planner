package com.nestsave.domain.calculations

import java.text.NumberFormat
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.Locale
import kotlin.math.max
import kotlin.math.pow
import kotlin.math.roundToInt
import kotlin.math.roundToLong

data class RDResult(
    val monthlyDeposit: Double,
    val annualInterestRate: Double,
    val tenureMonths: Int,
    val totalInvested: Double,
    val maturityAmount: Double,
    val totalInterestEarned: Double,
    val effectiveAnnualYield: Double
)

data class FDResult(
    val principal: Double,
    val annualInterestRate: Double,
    val tenureYears: Double,
    val maturityAmount: Double,
    val totalInterestEarned: Double
)

data class EMIResult(
    val monthlyEmi: Double,
    val totalPayment: Double,
    val totalInterest: Double,
    val loanAmount: Double
)

data class SIPResult(
    val monthlyInvestment: Double,
    val totalInvested: Double,
    val totalReturns: Double,
    val maturityAmount: Double,
    val annualReturnRate: Double,
    val durationYears: Int
)

data class InflationResult(
    val currentCost: Double,
    val annualInflationRate: Double,
    val years: Double,
    val futureCost: Double,
    val additionalCostNeeded: Double,
    val purchasingPowerRetainedPct: Int
)

data class PaceStatus(
    val status: String, // "ahead", "on_track", "behind"
    val varianceAmount: Double,
    val label: String
)

object FinancialCalculations {

    /**
     * Formats amounts using Indian numbering system (e.g. ₹1,50,000)
     */
    fun formatINR(amount: Double): String {
        val formatter = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
        formatter.maximumFractionDigits = 0
        return formatter.format(amount)
    }

    /**
     * Recurring Deposit (RD) Calculation with Indian Banking standard quarterly compounding:
     * A = P * ((1 + r/4)^(4n) - 1) / (1 - (1 + r/4)^(-1/3))
     */
    fun calculateRD(monthlyDeposit: Double, annualInterestRate: Double, tenureMonths: Int): RDResult {
        val p = max(0.0, monthlyDeposit)
        val r = max(0.0, annualInterestRate) / 100.0
        val n = tenureMonths / 12.0
        val totalInvested = p * tenureMonths

        if (p <= 0 || tenureMonths <= 0) {
            return RDResult(p, annualInterestRate, tenureMonths, 0.0, 0.0, 0.0, 0.0)
        }
        if (r <= 0) {
            return RDResult(p, 0.0, tenureMonths, totalInvested, totalInvested, 0.0, 0.0)
        }

        val i = r / 4.0
        val numerator = (1.0 + i).pow(4.0 * n) - 1.0
        val denominator = 1.0 - (1.0 + i).pow(-1.0 / 3.0)
        val maturityAmount = (p * (numerator / denominator)).roundToLong().toDouble()
        val totalInterestEarned = max(0.0, maturityAmount - totalInvested)
        val effectiveAnnualYield = if (totalInvested > 0 && n > 0) {
            ((maturityAmount - totalInvested) / totalInvested / n) * 100.0
        } else 0.0

        return RDResult(
            monthlyDeposit = p,
            annualInterestRate = annualInterestRate,
            tenureMonths = tenureMonths,
            totalInvested = totalInvested,
            maturityAmount = maturityAmount,
            totalInterestEarned = totalInterestEarned,
            effectiveAnnualYield = (effectiveAnnualYield * 100.0).roundToInt() / 100.0
        )
    }

    /**
     * Fixed Deposit (FD) Calculation with quarterly compounding:
     * A = P * (1 + r/400)^(4 * t)
     */
    fun calculateFD(principal: Double, annualInterestRate: Double, tenureYears: Double): FDResult {
        val p = max(0.0, principal)
        val r = max(0.0, annualInterestRate)
        val t = max(0.1, tenureYears)

        if (p <= 0) {
            return FDResult(0.0, r, t, 0.0, 0.0)
        }
        if (r <= 0) {
            return FDResult(p, 0.0, t, p, 0.0)
        }

        val maturityAmount = (p * (1.0 + r / 400.0).pow(4.0 * t)).roundToLong().toDouble()
        val totalInterestEarned = max(0.0, maturityAmount - p)

        return FDResult(
            principal = p,
            annualInterestRate = r,
            tenureYears = t,
            maturityAmount = maturityAmount,
            totalInterestEarned = totalInterestEarned
        )
    }

    /**
     * Standard Reducing Balance Loan EMI
     */
    fun calculateEMI(principal: Double, annualInterestRate: Double, tenureMonths: Int): EMIResult {
        val p = max(0.0, principal)
        val r = (max(0.0, annualInterestRate) / 12.0) / 100.0
        val n = max(1, tenureMonths)

        if (p <= 0) return EMIResult(0.0, 0.0, 0.0, 0.0)
        if (r <= 0) {
            val emi = (p / n).roundToLong().toDouble()
            return EMIResult(emi, p, 0.0, p)
        }

        val factor = (1.0 + r).pow(n.toDouble())
        val emi = (p * r * factor / (factor - 1.0)).roundToLong().toDouble()
        val totalPayment = (emi * n).roundToLong().toDouble()
        val totalInterest = max(0.0, totalPayment - p)

        return EMIResult(emi, totalPayment, totalInterest, p)
    }

    /**
     * Systematic Investment Plan (SIP) Compound Growth
     */
    fun calculateSIP(monthlyInvestment: Double, annualReturnRate: Double, durationYears: Int): SIPResult {
        val p = max(0.0, monthlyInvestment)
        val i = (max(0.0, annualReturnRate) / 12.0) / 100.0
        val n = max(1, durationYears * 12)
        val totalInvested = p * n

        if (p <= 0) return SIPResult(0.0, 0.0, 0.0, 0.0, annualReturnRate, durationYears)
        if (i <= 0) return SIPResult(p, totalInvested, 0.0, totalInvested, 0.0, durationYears)

        val factor = (1.0 + i).pow(n.toDouble())
        val maturityAmount = (p * ((factor - 1.0) / i) * (1.0 + i)).roundToLong().toDouble()
        val totalReturns = max(0.0, maturityAmount - totalInvested)

        return SIPResult(p, totalInvested, totalReturns, maturityAmount, annualReturnRate, durationYears)
    }

    /**
     * Inflation Adjustment for future purchasing power
     */
    fun calculateInflationAdjustedTarget(currentCost: Double, annualInflationRate: Double = 6.0, years: Double = 1.0): InflationResult {
        val cost = max(0.0, currentCost)
        val rate = max(0.0, annualInflationRate)
        val y = max(0.1, years)

        val futureCost = (cost * (1.0 + rate / 100.0).pow(y)).roundToLong().toDouble()
        val additionalNeeded = max(0.0, futureCost - cost)
        val retainedPct = if (futureCost > 0) ((cost / futureCost) * 100.0).roundToInt() else 100

        return InflationResult(
            currentCost = cost,
            annualInflationRate = rate,
            years = y,
            futureCost = futureCost,
            additionalCostNeeded = additionalNeeded,
            purchasingPowerRetainedPct = retainedPct
        )
    }

    fun daysRemaining(targetDateStr: String): Long {
        val target = LocalDate.parse(targetDateStr)
        val today = LocalDate.now()
        val diff = ChronoUnit.DAYS.between(today, target)
        return max(0, diff)
    }

    fun daysElapsed(startDateStr: String): Long {
        val start = LocalDate.parse(startDateStr)
        val today = LocalDate.now()
        val diff = ChronoUnit.DAYS.between(start, today)
        return max(0, diff)
    }

    fun requiredDaily(targetAmount: Double, currentAmount: Double, targetDateStr: String): Double {
        val days = daysRemaining(targetDateStr)
        val remaining = max(0.0, targetAmount - currentAmount)
        if (days <= 0) return remaining
        return (remaining / days).roundToLong().toDouble()
    }

    fun requiredWeekly(targetAmount: Double, currentAmount: Double, targetDateStr: String): Double {
        val days = daysRemaining(targetDateStr)
        val remaining = max(0.0, targetAmount - currentAmount)
        val weeks = max(1.0, days / 7.0)
        return (remaining / weeks).roundToLong().toDouble()
    }

    fun requiredMonthly(targetAmount: Double, currentAmount: Double, targetDateStr: String): Double {
        val days = daysRemaining(targetDateStr)
        val remaining = max(0.0, targetAmount - currentAmount)
        val months = max(0.5, days / 30.4375)
        return (remaining / months).roundToLong().toDouble()
    }

    fun savingsCapacity(income: Double, fixedExpenses: Double, otherSavings: Double, safetyBuffer: Double): Double {
        val capacity = income - fixedExpenses - otherSavings - safetyBuffer
        return max(0.0, capacity)
    }

    fun feasibility(requiredMonthly: Double, capacity: Double): String {
        if (capacity <= 0) return "Not Defined"
        val ratio = requiredMonthly / capacity
        return when {
            ratio <= 0.70 -> "Doable"
            ratio <= 1.00 -> "Tight"
            else -> "Not Realistic"
        }
    }

    fun aheadBehindSchedule(targetAmount: Double, currentAmount: Double, startDateStr: String, targetDateStr: String): PaceStatus {
        val totalDays = max(1L, ChronoUnit.DAYS.between(LocalDate.parse(startDateStr), LocalDate.parse(targetDateStr)))
        val daysPassed = max(0L, ChronoUnit.DAYS.between(LocalDate.parse(startDateStr), LocalDate.now()))
        val expectedProgress = targetAmount * (daysPassed.toDouble() / totalDays.toDouble())
        val diff = currentAmount - expectedProgress

        val status = when {
            diff > (targetAmount * 0.05) -> "ahead"
            diff < -(targetAmount * 0.05) -> "behind"
            else -> "on_track"
        }

        val label = when (status) {
            "ahead" -> "Ahead schedule (${formatINR(diff)})"
            "behind" -> "Behind schedule (${formatINR(-diff)})"
            else -> "On track"
        }

        return PaceStatus(status, diff, label)
    }
}
