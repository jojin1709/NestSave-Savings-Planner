import { Goal, Priority, Transaction } from "./types";

export function daysRemaining(targetDate: string): number {
  if (!targetDate) return 0;
  const end = new Date(targetDate + "T23:59:59");
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / 86400000);
  return Math.max(0, diff);
}

export function daysElapsed(startDate: string, today = new Date()): number {
  if (!startDate) return 0;
  const start = new Date(startDate + "T00:00:00");
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return Math.max(0, diff);
}

export function remainingAmount(targetAmount: number, currentAmount: number): number {
  return Math.max(0, Math.round(targetAmount) - Math.round(currentAmount));
}

export function requiredDaily(targetAmount: number, currentAmount: number, targetDate: string): number {
  const remaining = remainingAmount(targetAmount, currentAmount);
  if (remaining <= 0) return 0;
  const days = Math.max(daysRemaining(targetDate), 1);
  return Math.ceil(remaining / days);
}

export function requiredWeekly(targetAmount: number, currentAmount: number, targetDate: string): number {
  const remaining = remainingAmount(targetAmount, currentAmount);
  if (remaining <= 0) return 0;
  const weeks = Math.max(daysRemaining(targetDate) / 7, 0.1);
  return Math.ceil(remaining / weeks);
}

export function requiredMonthly(targetAmount: number, currentAmount: number, targetDate: string): number {
  const remaining = remainingAmount(targetAmount, currentAmount);
  if (remaining <= 0) return 0;
  const months = Math.max(daysRemaining(targetDate) / 30.4375, 0.1);
  return Math.ceil(remaining / months);
}

export function monthlyGoalRequirement(goal: Goal): number {
  if (goal.status !== "active" || goal.currentAmount >= goal.targetAmount) return 0;
  return requiredMonthly(goal.targetAmount, goal.currentAmount, goal.targetDate);
}

export function savingsCapacity(
  income = 0,
  fixedExpenses = 0,
  otherSavings = 0,
  safetyBuffer = 0
): number {
  const capacity = income - fixedExpenses - otherSavings - safetyBuffer;
  return Math.max(0, Math.round(capacity));
}

export type FeasibilityVerdict = "DOABLE" | "TIGHT" | "NOT REALISTIC";

export function feasibility(
  requiredMonthlyAmount: number,
  availableMonthlyCapacity: number
): {
  verdict: FeasibilityVerdict;
  ratio: number;
  description: string;
} {
  if (availableMonthlyCapacity <= 0) {
    return {
      verdict: "NOT REALISTIC",
      ratio: 0,
      description: "No monthly savings capacity defined or monthly expenses exceed income."
    };
  }

  const ratio = requiredMonthlyAmount / availableMonthlyCapacity;

  if (ratio <= 0.7) {
    return {
      verdict: "DOABLE",
      ratio,
      description: "Requires 70% or less of your available monthly savings capacity. Sustainable pace."
    };
  }

  if (ratio <= 1.0) {
    return {
      verdict: "TIGHT",
      ratio,
      description: "Consumes 70%–100% of your surplus. Requires tight financial discipline."
    };
  }

  return {
    verdict: "NOT REALISTIC",
    ratio,
    description: "Required savings exceeds your available monthly capacity. Consider extending the deadline."
  };
}

export function projectedCompletionDate(
  targetAmount: number,
  currentAmount: number,
  monthlySavingsPace: number
): Date | null {
  if (currentAmount >= targetAmount) return new Date();
  if (monthlySavingsPace <= 0) return null;
  const remaining = remainingAmount(targetAmount, currentAmount);
  const monthsNeeded = Math.ceil(remaining / monthlySavingsPace);
  const projected = new Date();
  projected.setMonth(projected.getMonth() + monthsNeeded);
  return projected;
}

export function currentPace(
  currentAmount: number,
  startDate: string,
  today = new Date()
): {
  dailyPace: number;
  monthlyPace: number;
} {
  const elapsed = Math.max(daysElapsed(startDate, today), 1);
  const dailyPace = currentAmount / elapsed;
  return {
    dailyPace: Math.round(dailyPace),
    monthlyPace: Math.round(dailyPace * 30.4375)
  };
}

export function aheadBehindSchedule(
  targetAmount: number,
  currentAmount: number,
  startDate: string,
  targetDate: string,
  today = new Date()
): {
  status: "ahead" | "on_track" | "behind";
  label: "Ahead" | "On Track" | "Behind";
  diffAmount: number;
  expectedAmount: number;
  progressPercent: number;
} {
  const progressPercent = targetAmount > 0
    ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
    : 0;

  if (!startDate || !targetDate || targetAmount <= 0) {
    return {
      status: "on_track",
      label: "On Track",
      diffAmount: 0,
      expectedAmount: 0,
      progressPercent
    };
  }

  const start = new Date(startDate + "T00:00:00");
  const end = new Date(targetDate + "T23:59:59");
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const elapsed = Math.max(0, Math.min(totalDays, Math.floor((today.getTime() - start.getTime()) / 86400000)));

  const expectedAmount = Math.round(targetAmount * (elapsed / totalDays));
  const diffAmount = currentAmount - expectedAmount;
  const tolerance = targetAmount * 0.05; // 5% buffer

  if (diffAmount > tolerance) {
    return { status: "ahead", label: "Ahead", diffAmount, expectedAmount, progressPercent };
  }
  if (diffAmount < -tolerance) {
    return { status: "behind", label: "Behind", diffAmount, expectedAmount, progressPercent };
  }

  return { status: "on_track", label: "On Track", diffAmount, expectedAmount, progressPercent };
}

export function suggestedDeadline(
  targetAmount: number,
  currentAmount: number,
  availableMonthlyCapacity: number,
  startDate?: string
): string {
  const remaining = remainingAmount(targetAmount, currentAmount);
  const base = startDate ? new Date(startDate) : new Date();

  if (availableMonthlyCapacity <= 0) {
    // Default safe horizon: 12 months
    const d = new Date(base);
    d.setMonth(d.getMonth() + 12);
    return d.toISOString().slice(0, 10);
  }

  const monthsNeeded = Math.max(1, Math.ceil(remaining / availableMonthlyCapacity));
  const d = new Date(base);
  d.setMonth(d.getMonth() + monthsNeeded);
  return d.toISOString().slice(0, 10);
}

export function priorityWeight(priority: Priority): number {
  switch (priority) {
    case "critical": return 4;
    case "high": return 3;
    case "medium": return 2;
    case "low": return 1;
  }
}

export function conflictDetection(
  goals: Goal[],
  totalMonthlyCapacity = 0
): {
  hasConflict: boolean;
  totalRequiredMonthly: number;
  totalMonthlyCapacity: number;
  deficit: number;
  activeGoalsCount: number;
} {
  const active = goals.filter(g => g.status === "active" && g.targetAmount > g.currentAmount);
  const totalRequiredMonthly = active.reduce((sum, g) => sum + monthlyGoalRequirement(g), 0);

  const hasConflict = totalMonthlyCapacity > 0 && totalRequiredMonthly > totalMonthlyCapacity;
  const deficit = hasConflict ? totalRequiredMonthly - totalMonthlyCapacity : 0;

  return {
    hasConflict,
    totalRequiredMonthly,
    totalMonthlyCapacity,
    deficit,
    activeGoalsCount: active.length
  };
}

export function multiGoalAllocation(
  goals: Goal[],
  totalMonthlyCapacity = 0
): {
  goalId: string;
  goalName: string;
  priority: Priority;
  suggestedMonthlyAllocation: number;
  requiredMonthly: number;
  sharePercent: number;
}[] {
  const active = goals.filter(g => g.status === "active" && g.targetAmount > g.currentAmount);
  if (active.length === 0 || totalMonthlyCapacity <= 0) return [];

  const totalWeight = active.reduce((sum, g) => sum + priorityWeight(g.priority), 0);

  return active.map(g => {
    const weight = priorityWeight(g.priority);
    const ratio = weight / totalWeight;
    const suggestedMonthlyAllocation = Math.round(totalMonthlyCapacity * ratio);
    const required = monthlyGoalRequirement(g);

    return {
      goalId: g.id,
      goalName: g.name,
      priority: g.priority,
      suggestedMonthlyAllocation,
      requiredMonthly: required,
      sharePercent: Math.round(ratio * 100)
    };
  });
}

export function formatINR(value: number): string {
  const safeVal = Math.max(0, Math.round(isNaN(value) ? 0 : value));
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(safeVal);
}

// -------------------------------------------------------------
// CSV GENERATION (RFC-4180 COMPLIANT)
// -------------------------------------------------------------
export function exportGoalsToCSV(goals: Goal[]): string {
  const headers = [
    "Goal ID", "Name", "Type", "Category", "Target Amount", "Current Amount",
    "Remaining Amount", "Start Date", "Target Date", "Priority", "Status",
    "Product URL", "Recurring Contribution", "Recurring Frequency", "Created At"
  ];

  const escapeCSV = (val: any) => {
    const str = val === undefined || val === null ? "" : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = goals.map(g => [
    escapeCSV(g.id),
    escapeCSV(g.name),
    escapeCSV(g.type),
    escapeCSV(g.category),
    g.targetAmount,
    g.currentAmount,
    remainingAmount(g.targetAmount, g.currentAmount),
    escapeCSV(g.startDate),
    escapeCSV(g.targetDate),
    escapeCSV(g.priority),
    escapeCSV(g.status),
    escapeCSV(g.productUrl || ""),
    g.recurringContribution || "",
    escapeCSV(g.recurringFrequency || ""),
    escapeCSV(g.createdAt)
  ]);

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
}

export function exportTransactionsToCSV(
  transactions: Transaction[],
  goalNameMap: Record<string, string>
): string {
  const headers = [
    "Transaction ID", "Goal ID", "Goal Name", "Type", "Amount", "Date", "Note", "Created At"
  ];

  const escapeCSV = (val: any) => {
    const str = val === undefined || val === null ? "" : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = transactions.map(t => [
    escapeCSV(t.id),
    escapeCSV(t.goalId),
    escapeCSV(goalNameMap[t.goalId] || "Unknown Goal"),
    escapeCSV(t.type),
    t.amount,
    escapeCSV(t.date),
    escapeCSV(t.note),
    escapeCSV(t.createdAt)
  ]);

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
}

// -------------------------------------------------------------
// FINANCIAL CALCULATORS MATH ENGINE
// -------------------------------------------------------------

export interface EMICalculationResult {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  principal: number;
}

export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): EMICalculationResult {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyEMI: 0, totalInterest: 0, totalPayment: 0, principal };
  }
  if (annualInterestRate <= 0) {
    const emi = Math.round(principal / tenureMonths);
    return { monthlyEMI: emi, totalInterest: 0, totalPayment: principal, principal };
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = Math.round((principal * monthlyRate * factor) / (factor - 1));
  const totalPayment = emi * tenureMonths;
  const totalInterest = Math.max(0, totalPayment - principal);

  return {
    monthlyEMI: emi,
    totalInterest,
    totalPayment,
    principal
  };
}

export interface SavingsVsEMIComparison {
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  tenureMonths: number;
  monthlyEMI: number;
  totalLoanCost: number;
  totalInterestPaid: number;
  monthsToSaveCash: number;
  interestSavedByWaiting: number;
}

export function compareSavingsVsEMI(
  purchasePrice: number,
  downPayment: number,
  annualInterestRate: number,
  tenureMonths: number,
  monthlySavingsPace: number
): SavingsVsEMIComparison {
  const loanAmount = Math.max(0, purchasePrice - downPayment);
  const emiResult = calculateEMI(loanAmount, annualInterestRate, tenureMonths);
  
  const netCashNeeded = Math.max(0, purchasePrice - downPayment);
  const pace = Math.max(monthlySavingsPace, 1);
  const monthsToSaveCash = Math.ceil(netCashNeeded / pace);

  return {
    purchasePrice,
    downPayment,
    loanAmount,
    tenureMonths,
    monthlyEMI: emiResult.monthlyEMI,
    totalLoanCost: downPayment + emiResult.totalPayment,
    totalInterestPaid: emiResult.totalInterest,
    monthsToSaveCash,
    interestSavedByWaiting: emiResult.totalInterest
  };
}

export interface SIPCalculationResult {
  monthlyInvestment: number;
  totalInvested: number;
  estimatedWealthGain: number;
  maturityValue: number;
  durationMonths: number;
}

export function calculateSIP(
  monthlyInvestment: number,
  expectedAnnualReturnRate: number,
  durationYears: number
): SIPCalculationResult {
  const months = Math.round(durationYears * 12);
  const totalInvested = monthlyInvestment * months;

  if (expectedAnnualReturnRate <= 0 || monthlyInvestment <= 0 || months <= 0) {
    return {
      monthlyInvestment,
      totalInvested,
      estimatedWealthGain: 0,
      maturityValue: totalInvested,
      durationMonths: months
    };
  }

  const monthlyRate = expectedAnnualReturnRate / 12 / 100;
  // Standard SIP Formula: M = P * [((1 + i)^n - 1) / i] * (1 + i)
  const factor = Math.pow(1 + monthlyRate, months);
  const maturityValue = Math.round(
    monthlyInvestment * ((factor - 1) / monthlyRate) * (1 + monthlyRate)
  );
  const estimatedWealthGain = Math.max(0, maturityValue - totalInvested);

  return {
    monthlyInvestment,
    totalInvested,
    estimatedWealthGain,
    maturityValue,
    durationMonths: months
  };
}

export interface EmergencyFundRecommendation {
  monthlyFixedExpenses: number;
  tier3Months: number;
  tier6Months: number;
  tier12Months: number;
}

export function calculateEmergencyFund(
  monthlyFixedExpenses: number
): EmergencyFundRecommendation {
  const base = Math.max(0, Math.round(monthlyFixedExpenses));
  return {
    monthlyFixedExpenses: base,
    tier3Months: base * 3,
    tier6Months: base * 6,
    tier12Months: base * 12
  };
}

export interface RDCalculationResult {
  monthlyDeposit: number;
  totalInvested: number;
  totalInterestEarned: number;
  maturityValue: number;
  tenureMonths: number;
  annualInterestRate: number;
}

/**
 * Calculates Recurring Deposit (RD) maturity with quarterly compounding
 * (Standard Indian Bank formula used by SBI, Post Office, HDFC, ICICI).
 */
export function calculateRD(
  monthlyDeposit: number,
  annualInterestRate: number,
  tenureMonths: number
): RDCalculationResult {
  const p = Math.max(0, Math.round(monthlyDeposit));
  const n = Math.max(1, Math.round(tenureMonths));
  const rate = Math.max(0, annualInterestRate);
  const totalInvested = p * n;

  if (p === 0 || rate === 0) {
    return {
      monthlyDeposit: p,
      totalInvested,
      totalInterestEarned: 0,
      maturityValue: totalInvested,
      tenureMonths: n,
      annualInterestRate: rate
    };
  }

  // Quarterly compounding rate: i = R / 400
  const i = rate / 400;
  let maturityValue = 0;
  for (let k = 1; k <= n; k++) {
    const monthsRemaining = n - k + 1;
    const quarters = monthsRemaining / 3;
    maturityValue += p * Math.pow(1 + i, quarters);
  }

  const roundedMaturity = Math.round(maturityValue);
  const totalInterestEarned = Math.max(0, roundedMaturity - totalInvested);

  return {
    monthlyDeposit: p,
    totalInvested,
    totalInterestEarned,
    maturityValue: roundedMaturity,
    tenureMonths: n,
    annualInterestRate: rate
  };
}

export interface FDCalculationResult {
  principal: number;
  totalInterestEarned: number;
  maturityValue: number;
  tenureMonths: number;
  annualInterestRate: number;
}

/**
 * Calculates Fixed Deposit (FD) maturity with quarterly compounding.
 */
export function calculateFD(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): FDCalculationResult {
  const p = Math.max(0, Math.round(principal));
  const n = Math.max(1, Math.round(tenureMonths));
  const rate = Math.max(0, annualInterestRate);

  if (p === 0 || rate === 0) {
    return {
      principal: p,
      totalInterestEarned: 0,
      maturityValue: p,
      tenureMonths: n,
      annualInterestRate: rate
    };
  }

  const quarters = n / 3;
  const i = rate / 400;
  const maturityValue = Math.round(p * Math.pow(1 + i, quarters));
  const totalInterestEarned = Math.max(0, maturityValue - p);

  return {
    principal: p,
    totalInterestEarned,
    maturityValue,
    tenureMonths: n,
    annualInterestRate: rate
  };
}

export interface InflationCalculationResult {
  currentCost: number;
  annualInflationRate: number;
  years: number;
  futureCost: number;
  additionalCostNeeded: number;
  purchasingPowerRetainedPct: number;
}

/**
 * Calculates the future cost adjusted for annual inflation.
 */
export function calculateInflationAdjustedTarget(
  currentCost: number,
  annualInflationRate = 6,
  years = 1
): InflationCalculationResult {
  const cost = Math.max(0, Math.round(currentCost));
  const rate = Math.max(0, annualInflationRate);
  const y = Math.max(0.1, years);

  const futureCost = Math.round(cost * Math.pow(1 + rate / 100, y));
  const additionalCostNeeded = Math.max(0, futureCost - cost);
  const purchasingPowerRetainedPct = futureCost > 0 ? Math.round((cost / futureCost) * 100) : 100;

  return {
    currentCost: cost,
    annualInflationRate: rate,
    years: y,
    futureCost,
    additionalCostNeeded,
    purchasingPowerRetainedPct
  };
}