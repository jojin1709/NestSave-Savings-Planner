"use client";

import { useMemo, useState } from "react";
import { X, Calendar, AlertTriangle, ArrowRight, CheckCircle2, RotateCcw, Clock, TrendingUp } from "lucide-react";
import { Goal } from "../lib/types";
import {
  formatINR, remainingAmount, daysRemaining, requiredMonthly,
  currentPace, suggestedDeadline
} from "../lib/calculations";

interface RecalibratePlanModalProps {
  goal: Goal;
  onClose: () => void;
  onSaveUpdatedGoal: (updatedGoal: Goal) => Promise<void>;
}

export default function RecalibratePlanModal({
  goal,
  onClose,
  onSaveUpdatedGoal
}: RecalibratePlanModalProps) {
  const remaining = remainingAmount(goal.targetAmount, goal.currentAmount);
  const daysLeft = daysRemaining(goal.targetDate);
  const newRequiredMonthly = requiredMonthly(goal.targetAmount, goal.currentAmount, goal.targetDate);

  const paceInfo = useMemo(() => {
    return currentPace(goal.currentAmount, goal.startDate);
  }, [goal]);

  const recommendedDate = useMemo(() => {
    return suggestedDeadline(goal.targetAmount, goal.currentAmount, paceInfo.monthlyPace);
  }, [goal, paceInfo]);

  const [saving, setSaving] = useState(false);

  async function handleKeepDeadline() {
    setSaving(true);
    await onSaveUpdatedGoal({
      ...goal,
      recurringContribution: newRequiredMonthly,
      note: (goal.note ? goal.note + "\n" : "") + `Recalibrated: Recommitted to original deadline with ₹${newRequiredMonthly.toLocaleString("en-IN")}/mo target.`
    });
    setSaving(false);
    onClose();
  }

  async function handleExtendDeadline() {
    setSaving(true);
    await onSaveUpdatedGoal({
      ...goal,
      targetDate: recommendedDate,
      note: (goal.note ? goal.note + "\n" : "") + `Recalibrated: Extended deadline to ${recommendedDate} to maintain sustainable pace of ₹${Math.round(paceInfo.monthlyPace).toLocaleString("en-IN")}/mo.`
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="finance-card w-full max-w-lg p-5 sm:p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <RotateCcw size={18} className="text-[#0d684c] dark:text-emerald-400" />
            <h2 className="text-base font-bold tracking-tight">Recalibrate Savings Plan</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X size={18} />
          </button>
        </div>

        {/* Goal Status Header */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-bold text-rose-900 dark:text-rose-200 text-sm block">
                "{goal.name}" is currently behind schedule
              </strong>
              <p className="text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                You have saved <span className="font-bold">{formatINR(goal.currentAmount)}</span> of <span className="font-bold">{formatINR(goal.targetAmount)}</span> ({formatINR(remaining)} remaining) with {daysLeft} days until {goal.targetDate}.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-500">
          Choose how you would like to recalibrate your plan to get back on track:
        </p>

        {/* 2 Options Cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Option 1: Keep Deadline */}
          <div className="rounded-xl border-2 border-zinc-200 dark:border-zinc-800 p-4 space-y-3 flex flex-col justify-between hover:border-[#0d684c] dark:hover:border-emerald-500 transition">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <Clock size={15} className="text-zinc-500" />
                <span>Option 1: Keep Deadline</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Maintain your target date of <strong className="text-zinc-700 dark:text-zinc-300">{goal.targetDate}</strong> by increasing monthly savings.
              </p>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-zinc-400">New Required Monthly</span>
                <div className="text-lg font-black text-[#0d684c] dark:text-emerald-400">
                  {formatINR(newRequiredMonthly)}/mo
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleKeepDeadline}
              className="btn-primary w-full text-xs font-bold mt-3 !py-2"
            >
              Recommit to Deadline
            </button>
          </div>

          {/* Option 2: Extend Deadline */}
          <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-50/30 dark:bg-[#18181b] p-4 space-y-3 flex flex-col justify-between hover:border-[#0d684c] dark:hover:border-emerald-400 transition">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d684c] dark:text-emerald-400">
                <TrendingUp size={15} />
                <span>Option 2: Keep Current Pace</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Stay at your current pace of <strong className="text-zinc-700 dark:text-zinc-300">{formatINR(Math.round(paceInfo.monthlyPace))}/mo</strong> and extend deadline.
              </p>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Suggested New Deadline</span>
                <div className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  {recommendedDate}
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleExtendDeadline}
              className="btn-primary w-full text-xs font-bold mt-3 !py-2 !bg-[#0d684c]"
            >
              Apply New Deadline
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs !py-1.5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
