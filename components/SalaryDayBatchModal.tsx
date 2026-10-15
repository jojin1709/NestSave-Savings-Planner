"use client";

import { useState, useMemo } from "react";
import { X, Wallet, CheckCircle2, Sparkles, SlidersHorizontal, ArrowRight } from "lucide-react";
import { Goal } from "../lib/types";
import { formatINR, monthlyGoalRequirement, remainingAmount } from "../lib/calculations";
import GoalCategoryIcon from "./GoalCategoryIcon";

interface SalaryDayBatchModalProps {
  goals: Goal[];
  onClose: () => void;
  onConfirmBatchDeposit: (allocations: Array<{ goalId: string; amount: number }>) => Promise<void>;
}

export default function SalaryDayBatchModal({
  goals,
  onClose,
  onConfirmBatchDeposit
}: SalaryDayBatchModalProps) {
  const activeGoals = useMemo(() => {
    return goals.filter(g => g.status === "active" && g.currentAmount < g.targetAmount);
  }, [goals]);

  // Initial allocations based on monthlyGoalRequirement
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    activeGoals.forEach(g => {
      const needed = monthlyGoalRequirement(g);
      const rem = remainingAmount(g.targetAmount, g.currentAmount);
      init[g.id] = Math.min(needed > 0 ? needed : 1000, rem);
    });
    return init;
  });

  const [submitting, setSubmitting] = useState(false);

  const totalDeposit = useMemo(() => {
    return Object.values(allocations).reduce((sum, amt) => sum + (Number(amt) || 0), 0);
  }, [allocations]);

  const validAllocationsCount = useMemo(() => {
    return Object.values(allocations).filter(amt => amt > 0).length;
  }, [allocations]);

  function handleAmountChange(goalId: string, val: number, maxLimit: number) {
    const clamped = Math.max(0, Math.min(val, maxLimit));
    setAllocations(prev => ({ ...prev, [goalId]: clamped }));
  }

  function handleZeroAll() {
    const reset: Record<string, number> = {};
    activeGoals.forEach(g => { reset[g.id] = 0; });
    setAllocations(reset);
  }

  function handleResetToPlanned() {
    const planned: Record<string, number> = {};
    activeGoals.forEach(g => {
      const needed = monthlyGoalRequirement(g);
      const rem = remainingAmount(g.targetAmount, g.currentAmount);
      planned[g.id] = Math.min(needed > 0 ? needed : 1000, rem);
    });
    setAllocations(planned);
  }

  async function handleConfirm() {
    if (submitting || totalDeposit <= 0) return;
    setSubmitting(true);
    const payload = Object.entries(allocations)
      .filter(([_, amt]) => amt > 0)
      .map(([goalId, amount]) => ({ goalId, amount }));

    await onConfirmBatchDeposit(payload);
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="finance-card w-full max-w-xl max-h-[90vh] flex flex-col p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-2 text-[#0d684c] dark:text-emerald-400">
              <Wallet size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Salary Day Batch Allocation</h2>
              <p className="text-[11px] text-zinc-500">Deposit across all active savings plans in one tap</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X size={18} />
          </button>
        </div>

        {/* Quick presets bar */}
        <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 text-xs">
          <span className="text-zinc-500">Active Goals: {activeGoals.length}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToPlanned}
              className="rounded-lg px-2 py-1 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
            >
              Reset to Planned
            </button>
            <button
              onClick={handleZeroAll}
              className="rounded-lg px-2 py-1 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Goals Allocation List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
          {activeGoals.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              No active goals with remaining targets found.
            </div>
          ) : (
            activeGoals.map(goal => {
              const currentAmt = allocations[goal.id] ?? 0;
              const remaining = remainingAmount(goal.targetAmount, goal.currentAmount);
              const plannedMonthly = monthlyGoalRequirement(goal);
              const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;

              return (
                <div
                  key={goal.id}
                  className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 p-3.5 bg-zinc-50/50 dark:bg-[#18181b]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GoalCategoryIcon category={goal.category} icon={goal.icon} size={18} />
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{goal.name}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {formatINR(goal.currentAmount)} of {formatINR(goal.targetAmount)} ({pct}%) • Needs {formatINR(plannedMonthly)}/mo
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-bold text-zinc-400">₹</span>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      max={remaining}
                      value={currentAmt === 0 ? "" : currentAmt}
                      placeholder="0"
                      onChange={e => handleAmountChange(goal.id, Number(e.target.value), remaining)}
                      className="w-28 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#121212] px-2.5 py-1.5 text-xs font-bold text-right outline-none focus:border-[#0d684c]"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Action */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Total Batch Contribution</span>
            <div className="text-xl font-extrabold text-[#0d684c] dark:text-emerald-400">
              {formatINR(totalDeposit)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary !py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || totalDeposit <= 0}
              className="btn-primary !py-2 text-xs font-bold flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Deposit {formatINR(totalDeposit)} ({validAllocationsCount} Goals)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
