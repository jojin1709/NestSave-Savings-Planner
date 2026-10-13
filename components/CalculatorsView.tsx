"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft, Calculator, Coins, ShieldCheck, TrendingUp,
  CreditCard, Sparkles, AlertCircle, CheckCircle2, ArrowRight,
  PiggyBank, Info, ChevronRight, Zap
} from "lucide-react";
import { AppSettings, Goal } from "../lib/types";
import {
  formatINR, calculateEMI, compareSavingsVsEMI,
  calculateSIP, calculateEmergencyFund, savingsCapacity
} from "../lib/calculations";

interface CalculatorsViewProps {
  settings: AppSettings;
  onBack: () => void;
  onCreateGoalFromCalculator: (params: {
    name: string;
    targetAmount: number;
    category: string;
    targetDate: string;
    note?: string;
  }) => void;
}

export default function CalculatorsView({
  settings,
  onBack,
  onCreateGoalFromCalculator
}: CalculatorsViewProps) {
  const [activeTab, setActiveTab] = useState<"emi" | "sip" | "emergency">("emi");

  // --- TAB 1: SAVINGS VS EMI STATE ---
  const [purchasePrice, setPurchasePrice] = useState<number>(80000);
  const [downPayment, setDownPayment] = useState<number>(10000);
  const [annualRate, setAnnualRate] = useState<number>(14);
  const [emiTenure, setEmiTenure] = useState<number>(12);
  const [customSavingsPace, setCustomSavingsPace] = useState<number>(
    settings.monthlyIncome
      ? savingsCapacity(
          settings.monthlyIncome,
          settings.fixedMonthlyExpenses || 0,
          settings.otherMonthlySavings || 0,
          settings.safetyBuffer || 0
        ) || 8000
      : 8000
  );

  const emiComparison = useMemo(() => {
    return compareSavingsVsEMI(
      purchasePrice,
      downPayment,
      annualRate,
      emiTenure,
      customSavingsPace
    );
  }, [purchasePrice, downPayment, annualRate, emiTenure, customSavingsPace]);

  // Target date calculated for saving cash
  const projectedCashDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + emiComparison.monthsToSaveCash);
    return d.toISOString().slice(0, 10);
  }, [emiComparison.monthsToSaveCash]);

  // --- TAB 2: SIP & WEALTH STATE ---
  const [monthlySIP, setMonthlySIP] = useState<number>(5000);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [sipYears, setSipYears] = useState<number>(3);

  const sipResult = useMemo(() => {
    return calculateSIP(monthlySIP, expectedReturn, sipYears);
  }, [monthlySIP, expectedReturn, sipYears]);

  const projectedSIPDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + sipYears);
    return d.toISOString().slice(0, 10);
  }, [sipYears]);

  // --- TAB 3: EMERGENCY FUND STATE ---
  const [monthlyExpensesInput, setMonthlyExpensesInput] = useState<number>(
    settings.fixedMonthlyExpenses || 25000
  );

  const emergencyRecommendation = useMemo(() => {
    return calculateEmergencyFund(monthlyExpensesInput);
  }, [monthlyExpensesInput]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Financial Calculators</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            Compare loan interest vs savings, calculate compound SIP growth, and size your emergency fund.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-[#121212]">
        <button
          onClick={() => setActiveTab("emi")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
            activeTab === "emi"
              ? "bg-[#0d684c] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          <CreditCard size={15} />
          <span>Savings vs. EMI</span>
        </button>

        <button
          onClick={() => setActiveTab("sip")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
            activeTab === "sip"
              ? "bg-[#0d684c] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          <TrendingUp size={15} />
          <span>SIP & Compound Growth</span>
        </button>

        <button
          onClick={() => setActiveTab("emergency")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
            activeTab === "emergency"
              ? "bg-[#0d684c] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          <ShieldCheck size={15} />
          <span>Emergency Fund</span>
        </button>
      </div>

      {/* TAB 1: SAVINGS VS EMI */}
      {activeTab === "emi" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Input Controls */}
            <div className="finance-card p-5 space-y-4 lg:col-span-5">
              <h3 className="font-bold text-sm">Purchase & Loan Details</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="label">Item / Purchase Price (₹)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={e => setPurchasePrice(Math.max(0, Number(e.target.value)))}
                    className="input font-semibold"
                  />
                </div>

                <div>
                  <label className="label">Down Payment (₹)</label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={e => setDownPayment(Math.max(0, Number(e.target.value)))}
                    className="input font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">EMI Interest (% p.a.)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={annualRate}
                      onChange={e => setAnnualRate(Math.max(0, Number(e.target.value)))}
                      className="input font-semibold"
                    />
                  </div>

                  <div>
                    <label className="label">Tenure (Months)</label>
                    <select
                      value={emiTenure}
                      onChange={e => setEmiTenure(Number(e.target.value))}
                      className="input font-semibold cursor-pointer"
                    >
                      <option value={6}>6 Months</option>
                      <option value={9}>9 Months</option>
                      <option value={12}>12 Months (1 yr)</option>
                      <option value={18}>18 Months</option>
                      <option value={24}>24 Months (2 yrs)</option>
                      <option value={36}>36 Months (3 yrs)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Your Monthly Savings Capacity (₹)</label>
                  <input
                    type="number"
                    value={customSavingsPace}
                    onChange={e => setCustomSavingsPace(Math.max(1, Number(e.target.value)))}
                    className="input font-semibold"
                  />
                  <p className="mt-1 text-[11px] text-zinc-500">
                    How much you can set aside each month if saving cash instead of taking loan.
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison Results */}
            <div className="space-y-4 lg:col-span-7">
              {/* Highlight Card: Interest Saved */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Savings Advantage
                  </span>
                  <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
                    Zero Debt
                  </span>
                </div>

                <div className="text-2xl font-black text-[#0d684c] dark:text-emerald-400">
                  Save {formatINR(emiComparison.interestSavedByWaiting)} in interest
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  By saving cash at {formatINR(customSavingsPace)}/month, you can buy this outright in{" "}
                  <strong>{emiComparison.monthsToSaveCash} months</strong> without paying any bank interest or loan processing fees.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onCreateGoalFromCalculator({
                        name: `Savings for Purchase (${formatINR(purchasePrice)})`,
                        targetAmount: purchasePrice - downPayment,
                        category: "Purchase",
                        targetDate: projectedCashDate,
                        note: `Calculated via NestSave EMI comparator. Saving cash avoids ${formatINR(emiComparison.interestSavedByWaiting)} in loan interest.`
                      });
                    }}
                    className="btn-primary !py-2 text-xs font-bold"
                  >
                    <Sparkles size={14} /> Turn into a NestSave Goal
                  </button>
                </div>
              </div>

              {/* Side by Side Comparison Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Loan Option */}
                <div className="finance-card p-4 space-y-3 border-rose-200/60 dark:border-rose-950/40">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <CreditCard size={14} />
                    <span>Option 1: Buy on EMI</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Monthly EMI:</span>
                      <span className="font-bold font-mono">{formatINR(emiComparison.monthlyEMI)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Loan Tenure:</span>
                      <span className="font-semibold">{emiTenure} Months</span>
                    </div>
                    <div className="flex justify-between text-rose-600 dark:text-rose-400">
                      <span>Total Interest Paid:</span>
                      <span className="font-bold font-mono">+{formatINR(emiComparison.totalInterestPaid)}</span>
                    </div>
                    <div className="border-t border-zinc-100 pt-1.5 dark:border-zinc-800 flex justify-between font-bold">
                      <span>Total You Pay:</span>
                      <span className="font-mono text-rose-600 dark:text-rose-400">{formatINR(emiComparison.totalLoanCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Cash Option */}
                <div className="finance-card p-4 space-y-3 border-emerald-200/60 dark:border-emerald-950/40">
                  <div className="flex items-center gap-2 text-[#0d684c] dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <PiggyBank size={14} />
                    <span>Option 2: Save First</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Monthly Savings:</span>
                      <span className="font-bold font-mono">{formatINR(customSavingsPace)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Time to Goal:</span>
                      <span className="font-semibold">{emiComparison.monthsToSaveCash} Months</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Interest Paid:</span>
                      <span className="font-bold font-mono">₹0 (Zero)</span>
                    </div>
                    <div className="border-t border-zinc-100 pt-1.5 dark:border-zinc-800 flex justify-between font-bold">
                      <span>Total You Pay:</span>
                      <span className="font-mono text-[#0d684c] dark:text-emerald-400">{formatINR(purchasePrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SIP & COMPOUND WEALTH GROWTH */}
      {activeTab === "sip" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Controls */}
            <div className="finance-card p-5 space-y-4 lg:col-span-5">
              <h3 className="font-bold text-sm">SIP Investment Parameters</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="label">Monthly Contribution (₹)</label>
                  <input
                    type="number"
                    value={monthlySIP}
                    onChange={e => setMonthlySIP(Math.max(0, Number(e.target.value)))}
                    className="input font-semibold"
                  />
                </div>

                <div>
                  <label className="label">Expected Return (% p.a.)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={expectedReturn}
                    onChange={e => setExpectedReturn(Math.max(0, Number(e.target.value)))}
                    className="input font-semibold"
                  />
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Typical index funds average 10–14% long-term return in India.
                  </p>
                </div>

                <div>
                  <label className="label">Time Horizon (Years): {sipYears} Years</label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={sipYears}
                    onChange={e => setSipYears(Number(e.target.value))}
                    className="w-full accent-[#0d684c] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>1 yr</span>
                    <span>5 yrs</span>
                    <span>10 yrs</span>
                    <span>15 yrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4 lg:col-span-7">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-[#121212]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Total Estimated Value
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#0d684c] dark:bg-emerald-950/40 dark:text-emerald-400">
                    Compound Growth
                  </span>
                </div>

                <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                  {formatINR(sipResult.maturityValue)}
                </div>

                {/* Progress Proportion Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Invested Capital</span>
                    <span>Wealth Gain (Returns)</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex">
                    <div
                      className="h-full bg-zinc-600 dark:bg-zinc-400 transition-all duration-300"
                      style={{
                        width: `${(sipResult.totalInvested / sipResult.maturityValue) * 100}%`
                      }}
                      title="Invested Amount"
                    />
                    <div
                      className="h-full bg-[#0d684c] dark:bg-emerald-500 transition-all duration-300 flex-1"
                      title="Wealth Gain"
                    />
                  </div>
                </div>

                {/* Breakdown Tiles */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="rounded-xl border border-zinc-100 p-3 space-y-0.5 dark:border-zinc-800/80 dark:bg-[#18181b]/50">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Total Invested</div>
                    <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      {formatINR(sipResult.totalInvested)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-100 p-3 space-y-0.5 dark:border-zinc-800/80 dark:bg-[#18181b]/50">
                    <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      Estimated Gains
                    </div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatINR(sipResult.estimatedWealthGain)}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onCreateGoalFromCalculator({
                        name: `SIP Wealth Target (${sipYears} Years)`,
                        targetAmount: sipResult.maturityValue,
                        category: "Investment",
                        targetDate: projectedSIPDate,
                        note: `Systematic Investment Plan aiming for ${formatINR(sipResult.maturityValue)} at ${expectedReturn}% p.a. returns.`
                      });
                    }}
                    className="btn-primary !py-2 text-xs font-bold"
                  >
                    <Sparkles size={14} /> Track as Wealth Goal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EMERGENCY FUND CALCULATOR */}
      {activeTab === "emergency" && (
        <div className="space-y-6">
          <div className="finance-card p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm">Emergency Fund Buffer Calibration</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Financial safety guidelines recommend holding 3 to 6 months of mandatory living expenses in cash or liquid funds.
              </p>
            </div>

            <div className="max-w-xs">
              <label className="label">Monthly Fixed Living Expenses (₹)</label>
              <input
                type="number"
                value={monthlyExpensesInput}
                onChange={e => setMonthlyExpensesInput(Math.max(0, Number(e.target.value)))}
                className="input font-semibold text-xs"
              />
            </div>

            {/* 3 Tier Cards */}
            <div className="grid gap-4 md:grid-cols-3 pt-2">
              {/* Tier 1: 3 Months */}
              <div className="rounded-2xl border border-zinc-200 p-4 space-y-3 dark:border-zinc-800 dark:bg-[#18181b]/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-zinc-500">Tier 1 • Essential</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    3 Months
                  </span>
                </div>

                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {formatINR(emergencyRecommendation.tier3Months)}
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed">
                  Basic baseline safety net for unexpected medical bills or quick minor repairs.
                </p>

                <button
                  onClick={() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + 6);
                    onCreateGoalFromCalculator({
                      name: "Emergency Fund (3 Months)",
                      targetAmount: emergencyRecommendation.tier3Months,
                      category: "Emergency",
                      targetDate: d.toISOString().slice(0, 10),
                      note: "Starter emergency cushion covering 3 months of essential fixed expenses."
                    });
                  }}
                  className="btn-secondary w-full text-xs font-bold"
                >
                  Create 3-Mo Goal
                </button>
              </div>

              {/* Tier 2: 6 Months (Recommended) */}
              <div className="rounded-2xl border-2 border-[#0d684c] p-4 space-y-3 dark:border-emerald-500 dark:bg-[#121212] relative shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-[#0d684c] dark:text-emerald-400">
                    Tier 2 • Recommended
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    6 Months
                  </span>
                </div>

                <div className="text-2xl font-black text-[#0d684c] dark:text-emerald-400">
                  {formatINR(emergencyRecommendation.tier6Months)}
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed">
                  The gold standard safety buffer. Protects against career transitions, layoffs, or health leaves.
                </p>

                <button
                  onClick={() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + 12);
                    onCreateGoalFromCalculator({
                      name: "Emergency Fund (6 Months)",
                      targetAmount: emergencyRecommendation.tier6Months,
                      category: "Emergency",
                      targetDate: d.toISOString().slice(0, 10),
                      note: "Recommended standard emergency reserve covering 6 months of living expenses."
                    });
                  }}
                  className="btn-primary w-full text-xs font-bold"
                >
                  Create 6-Mo Goal
                </button>
              </div>

              {/* Tier 3: 12 Months */}
              <div className="rounded-2xl border border-zinc-200 p-4 space-y-3 dark:border-zinc-800 dark:bg-[#18181b]/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-zinc-500">Tier 3 • High Security</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    12 Months
                  </span>
                </div>

                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {formatINR(emergencyRecommendation.tier12Months)}
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed">
                  Best for freelancers, business owners, or single-earner households wanting peace of mind.
                </p>

                <button
                  onClick={() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + 24);
                    onCreateGoalFromCalculator({
                      name: "Emergency Fund (12 Months)",
                      targetAmount: emergencyRecommendation.tier12Months,
                      category: "Emergency",
                      targetDate: d.toISOString().slice(0, 10),
                      note: "High-security 1-year emergency reserve for maximum financial resilience."
                    });
                  }}
                  className="btn-secondary w-full text-xs font-bold"
                >
                  Create 12-Mo Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
