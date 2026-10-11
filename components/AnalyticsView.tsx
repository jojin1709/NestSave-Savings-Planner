"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft, BarChart3, TrendingUp, Wallet, Target,
  Calendar, ArrowUpRight, ArrowDownRight, PieChart, ShieldAlert,
  Sliders, Layers, CheckCircle2, AlertTriangle, Sparkles
} from "lucide-react";
import { Goal, Transaction, AppSettings } from "../lib/types";
import { formatINR, remainingAmount, monthlyGoalRequirement, savingsCapacity } from "../lib/calculations";

interface AnalyticsViewProps {
  goals: Goal[];
  transactions: Transaction[];
  settings: AppSettings;
  onBack: () => void;
  onNavigateGoal: (goalId: string) => void;
  onOpenSettings: () => void;
}

export default function AnalyticsView({
  goals,
  transactions,
  settings,
  onBack,
  onNavigateGoal,
  onOpenSettings
}: AnalyticsViewProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    amount: number;
    x: number;
    y: number;
  } | null>(null);

  // 1. Transaction Totals
  const { totalDeposits, totalWithdrawals, netBalance } = useMemo(() => {
    let deposits = 0;
    let withdrawals = 0;
    transactions.forEach(t => {
      if (t.type === "deposit") deposits += t.amount;
      else if (t.type === "withdrawal") withdrawals += t.amount;
    });
    return {
      totalDeposits: deposits,
      totalWithdrawals: withdrawals,
      netBalance: deposits - withdrawals
    };
  }, [transactions]);

  // 2. Cumulative Savings Trajectory (Time-Series)
  const trajectoryData = useMemo(() => {
    if (transactions.length === 0) return [];
    // Sort transactions chronologically
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by date
    const dailyMap = new Map<string, number>();
    let running = 0;

    sorted.forEach(t => {
      const delta = t.type === "deposit" ? t.amount : -t.amount;
      running += delta;
      dailyMap.set(t.date, Math.max(0, running));
    });

    const entries = Array.from(dailyMap.entries()).map(([date, cumulative]) => ({
      date,
      cumulative
    }));

    if (entries.length === 1) {
      const first = entries[0];
      const d = new Date(first.date);
      d.setDate(d.getDate() - 1);
      const prevDate = d.toISOString().slice(0, 10);
      return [
        { date: prevDate, cumulative: 0 },
        first
      ];
    }

    return entries;
  }, [transactions]);

  // 3. Category Breakdown
  const categoryStats = useMemo(() => {
    const map = new Map<string, { target: number; saved: number; count: number }>();
    goals.forEach(g => {
      const cat = g.category || "General";
      const existing = map.get(cat) || { target: 0, saved: 0, count: 0 };
      existing.target += g.targetAmount;
      existing.saved += g.currentAmount;
      existing.count += 1;
      map.set(cat, existing);
    });

    const totalSavedAcrossGoals = goals.reduce((acc, g) => acc + g.currentAmount, 0) || 1;
    return Array.from(map.entries()).map(([category, stats]) => ({
      category,
      ...stats,
      percentOfTotalSaved: Math.round((stats.saved / totalSavedAcrossGoals) * 100)
    })).sort((a, b) => b.saved - a.saved);
  }, [goals]);

  // 4. Cash Flow & Monthly Allocation
  const cashFlowMetrics = useMemo(() => {
    const income = settings.monthlyIncome || 0;
    const expenses = settings.fixedMonthlyExpenses || 0;
    const otherSavings = settings.otherMonthlySavings || 0;
    const buffer = settings.safetyBuffer || 0;
    const capacity = savingsCapacity(income, expenses, otherSavings, buffer);

    const activeGoals = goals.filter(g => g.status === "active");
    const totalMonthlyNeeded = activeGoals.reduce((sum, g) => sum + monthlyGoalRequirement(g), 0);

    const utilization = capacity > 0 ? Math.round((totalMonthlyNeeded / capacity) * 100) : 0;

    return {
      income,
      expenses,
      capacity,
      totalMonthlyNeeded,
      utilization,
      isConfigured: income > 0
    };
  }, [goals, settings]);

  // 5. Goal Completion Metrics
  const activeGoals = useMemo(() => goals.filter(g => g.status === "active"), [goals]);
  const completedGoals = useMemo(() => goals.filter(g => g.status === "completed" || g.currentAmount >= g.targetAmount), [goals]);
  const totalTarget = useMemo(() => goals.reduce((acc, g) => acc + g.targetAmount, 0), [goals]);
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((netBalance / totalTarget) * 100)) : 0;

  // Chart coordinate calculations
  const svgWidth = 800;
  const svgHeight = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const maxVal = useMemo(() => {
    if (trajectoryData.length === 0) return 10000;
    const peak = Math.max(...trajectoryData.map(d => d.cumulative));
    return peak === 0 ? 10000 : peak * 1.15;
  }, [trajectoryData]);

  const points = useMemo(() => {
    if (trajectoryData.length < 2) return [];
    const count = trajectoryData.length;
    return trajectoryData.map((d, idx) => {
      const x = padding.left + (idx / (count - 1)) * chartW;
      const y = padding.top + chartH - (d.cumulative / maxVal) * chartH;
      return { x, y, ...d };
    });
  }, [trajectoryData, maxVal, chartW, chartH]);

  const pathD = useMemo(() => {
    if (points.length < 2) return "";
    return points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      // Smooth curve
      const prev = points[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, "");
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length < 2) return "";
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const baseY = padding.top + chartH;
    return `${pathD} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [pathD, points, chartH]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header & Back */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Financial Analytics & Insights</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            Real-time trajectory, goal progress distribution, and monthly cash flow utilization.
          </p>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-[#121212]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#0d684c] dark:bg-emerald-950/40 dark:text-emerald-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-500">Total Funded</div>
            <div className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
              {overallProgress}% ({formatINR(netBalance)})
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="finance-card p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Total Saved</span>
            <Wallet size={16} className="text-[#0d684c] dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{formatINR(netBalance)}</div>
          <div className="text-[11px] text-zinc-500">
            Across {goals.length} {goals.length === 1 ? "goal" : "goals"}
          </div>
        </div>

        {/* KPI 2 */}
        <div className="finance-card p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Total Deposits</span>
            <ArrowUpRight size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatINR(totalDeposits)}</div>
          <div className="text-[11px] text-zinc-500">Cumulative contributions</div>
        </div>

        {/* KPI 3 */}
        <div className="finance-card p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Total Withdrawals</span>
            <ArrowDownRight size={16} className="text-zinc-400" />
          </div>
          <div className="text-xl font-bold text-zinc-700 dark:text-zinc-300">{formatINR(totalWithdrawals)}</div>
          <div className="text-[11px] text-zinc-500">Redeemed / reallocated</div>
        </div>

        {/* KPI 4 */}
        <div className="finance-card p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Completed Goals</span>
            <CheckCircle2 size={16} className="text-[#0d684c] dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {completedGoals.length} <span className="text-xs font-normal text-zinc-500">/ {goals.length}</span>
          </div>
          <div className="text-[11px] text-zinc-500">
            {activeGoals.length} currently active
          </div>
        </div>
      </div>

      {/* CHART 1: Cumulative Savings Trajectory (Time-Series Area Chart) */}
      <div className="finance-card p-5 space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-[#0d684c] dark:text-emerald-400" />
              <h3 className="font-bold text-sm">Cumulative Savings Growth Trajectory</h3>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Historical net balance curve calculated from your ledger deposits and withdrawals.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0d684c] dark:bg-emerald-500"></span>
              Net Vault Balance
            </span>
          </div>
        </div>

        {trajectoryData.length >= 2 ? (
          <div className="relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[500px]"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d684c" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0d684c" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padding.top + chartH * ratio;
                const val = maxVal * (1 - ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="currentColor"
                      className="text-zinc-200 dark:text-zinc-800/80"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-zinc-400 text-[10px] font-mono"
                    >
                      {formatINR(Math.round(val))}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaD} fill="url(#emeraldGradient)" />

              {/* Main Curve */}
              <path
                d={pathD}
                fill="none"
                stroke="#0d684c"
                strokeWidth="2.75"
                strokeLinecap="round"
                className="dark:stroke-emerald-400 transition-all"
              />

              {/* Data points */}
              {points.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint?.date === pt.date ? 6 : 4}
                  className="fill-white stroke-[#0d684c] stroke-2 dark:fill-[#121212] dark:stroke-emerald-400 cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint({ date: pt.date, amount: pt.cumulative, x: pt.x, y: pt.y })}
                />
              ))}

              {/* Date labels at bottom */}
              {points.map((pt, i) => {
                // Show only a subset if many points
                if (points.length > 8 && i % Math.ceil(points.length / 6) !== 0 && i !== points.length - 1) return null;
                return (
                  <text
                    key={i}
                    x={pt.x}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className="fill-zinc-400 text-[10px] font-mono"
                  >
                    {pt.date.slice(5)}
                  </text>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute pointer-events-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs shadow-xl dark:border-zinc-800 dark:bg-[#18181b] z-20 -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                  marginTop: "-10px"
                }}
              >
                <div className="font-semibold text-zinc-500">{hoveredPoint.date}</div>
                <div className="text-sm font-extrabold text-[#0d684c] dark:text-emerald-400">
                  {formatINR(hoveredPoint.amount)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
            <p className="text-xs text-zinc-500">
              {transactions.length === 1
                ? "1 transaction recorded. Log more deposits over time to render your trajectory curve."
                : "No transactions recorded yet. Record deposits to your goals to track your growth curve."}
            </p>
          </div>
        )}
      </div>

      {/* TWO COLUMNS: Goal Comparison & Cash Flow Split */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CHART 2: Active Goal Comparison Progress */}
        <div className="finance-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-[#0d684c] dark:text-emerald-400" />
              <h3 className="font-bold text-sm">Active Goals Comparison</h3>
            </div>
            <span className="text-xs text-zinc-500 font-medium">{activeGoals.length} active</span>
          </div>

          {activeGoals.length > 0 ? (
            <div className="space-y-3.5">
              {activeGoals.map(g => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) || 0;
                return (
                  <div
                    key={g.id}
                    onClick={() => onNavigateGoal(g.id)}
                    className="group rounded-xl border border-zinc-100 p-3 hover:border-zinc-200 hover:bg-zinc-50/50 dark:border-zinc-800/80 dark:hover:border-zinc-700 dark:hover:bg-[#18181b]/50 cursor-pointer transition space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 group-hover:text-[#0d684c] dark:text-zinc-100 dark:group-hover:text-emerald-400">
                        {g.name}
                      </span>
                      <span className="font-mono text-zinc-500 font-medium">
                        {formatINR(g.currentAmount)} / {formatINR(g.targetAmount)} ({pct}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-[#0d684c] dark:bg-emerald-500 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
              <p className="text-xs text-zinc-500">No active goals. Create a savings goal to compare progress.</p>
            </div>
          )}
        </div>

        {/* CHART 3: Cash Flow Capacity & Allocation */}
        <div className="finance-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-[#0d684c] dark:text-emerald-400" />
              <h3 className="font-bold text-sm">Monthly Cash Flow & Capacity</h3>
            </div>
            {!cashFlowMetrics.isConfigured && (
              <button
                onClick={onOpenSettings}
                className="text-xs font-bold text-[#0d684c] hover:underline dark:text-emerald-400"
              >
                Configure
              </button>
            )}
          </div>

          {cashFlowMetrics.isConfigured ? (
            <div className="space-y-4">
              {/* Capacity Utilization Bar */}
              <div className="rounded-xl border border-zinc-100 p-3.5 space-y-2 dark:border-zinc-800/80 dark:bg-[#18181b]/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">Capacity Utilization</span>
                  <span className={`font-mono font-bold ${
                    cashFlowMetrics.utilization > 100
                      ? "text-rose-500"
                      : cashFlowMetrics.utilization > 80
                      ? "text-amber-500"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {cashFlowMetrics.utilization}%
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      cashFlowMetrics.utilization > 100
                        ? "bg-rose-500"
                        : cashFlowMetrics.utilization > 80
                        ? "bg-amber-500"
                        : "bg-[#0d684c] dark:bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, cashFlowMetrics.utilization)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Goals Require: {formatINR(cashFlowMetrics.totalMonthlyNeeded)}/mo</span>
                  <span>Available: {formatINR(cashFlowMetrics.capacity)}/mo</span>
                </div>
              </div>

              {/* Monthly Breakdown Breakdown Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-zinc-100 p-3 space-y-0.5 dark:border-zinc-800 dark:bg-[#18181b]/30">
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Monthly Income</div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{formatINR(cashFlowMetrics.income)}</div>
                </div>
                <div className="rounded-xl border border-zinc-100 p-3 space-y-0.5 dark:border-zinc-800 dark:bg-[#18181b]/30">
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Fixed Expenses</div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{formatINR(cashFlowMetrics.expenses)}</div>
                </div>
              </div>

              {cashFlowMetrics.utilization > 100 && (
                <div className="rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400 flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>
                    Your active goals exceed your calculated monthly savings capacity by{" "}
                    <strong>{formatINR(cashFlowMetrics.totalMonthlyNeeded - cashFlowMetrics.capacity)}/mo</strong>. Consider extending deadlines.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center dark:border-zinc-800 space-y-2">
              <p className="text-xs text-zinc-500">
                Calibrate your monthly take-home income and expenses to unlock conflict detection and capacity utilization.
              </p>
              <button
                onClick={onOpenSettings}
                className="btn-secondary !py-1.5 text-xs font-bold"
              >
                Configure Cash Flow
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CHART 4: Category Allocation Breakdown */}
      {categoryStats.length > 0 && (
        <div className="finance-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <PieChart size={18} className="text-[#0d684c] dark:text-emerald-400" />
            <h3 className="font-bold text-sm">Portfolio Distribution by Category</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {categoryStats.map(c => (
              <div
                key={c.category}
                className="rounded-xl border border-zinc-100 p-3.5 space-y-1.5 dark:border-zinc-800 dark:bg-[#18181b]/40"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{c.category}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {c.count} {c.count === 1 ? "goal" : "goals"}
                  </span>
                </div>
                <div className="text-base font-extrabold text-[#0d684c] dark:text-emerald-400">
                  {formatINR(c.saved)}{" "}
                  <span className="text-[11px] font-normal text-zinc-400">of {formatINR(c.target)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-[#0d684c] dark:bg-emerald-500"
                    style={{ width: `${Math.min(100, Math.round((c.saved / c.target) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
