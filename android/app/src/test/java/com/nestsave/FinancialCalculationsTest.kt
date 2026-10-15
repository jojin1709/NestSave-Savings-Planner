package com.nestsave

import com.nestsave.domain.calculations.FinancialCalculations
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class FinancialCalculationsTest {

    @Test
    fun testRecurringDepositCalculation() {
        // ₹5,000/month at 7.1% p.a. for 12 months with quarterly compounding
        val result = FinancialCalculations.calculateRD(5000.0, 7.1, 12)
        assertEquals(60000.0, result.totalInvested, 0.01)
        assertTrue("Maturity should exceed 62000", result.maturityAmount > 62000.0)
        assertTrue("Interest earned should be positive", result.totalInterestEarned > 2000.0)
    }

    @Test
    fun testFixedDepositCalculation() {
        // ₹1,00,000 at 7.5% p.a. for 1 year quarterly compounded:
        // A = 100000 * (1 + 7.5/400)^4 = 100000 * (1.01875)^4 = 107713.58 -> ~1,07,714
        val result = FinancialCalculations.calculateFD(100000.0, 7.5, 1.0)
        assertEquals(107714.0, result.maturityAmount, 2.0)
        assertEquals(7714.0, result.totalInterestEarned, 2.0)
    }

    @Test
    fun testEMICalculation() {
        // ₹10,00,000 at 9.0% for 24 months
        val result = FinancialCalculations.calculateEMI(1000000.0, 9.0, 24)
        assertTrue("EMI should be around 45685", result.monthlyEmi in 45600.0..45800.0)
        assertTrue("Total interest should be around 96435", result.totalInterest in 96000.0..97000.0)
    }

    @Test
    fun testInflationAdjustment() {
        // ₹10,00,000 at 6% for 5 years: 1000000 * (1.06)^5 = 1,338,226
        val result = FinancialCalculations.calculateInflationAdjustedTarget(1000000.0, 6.0, 5.0)
        assertEquals(1338226.0, result.futureCost, 2.0)
        assertEquals(338226.0, result.additionalCostNeeded, 2.0)
        assertEquals(75, result.purchasingPowerRetainedPct)
    }

    @Test
    fun testFeasibilityVerdict() {
        val capacity = 20000.0
        assertEquals("Doable", FinancialCalculations.feasibility(12000.0, capacity)) // 60%
        assertEquals("Tight", FinancialCalculations.feasibility(18000.0, capacity)) // 90%
        assertEquals("Not Realistic", FinancialCalculations.feasibility(25000.0, capacity)) // 125%
    }
}
