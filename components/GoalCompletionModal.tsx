"use client";

import { CheckCircle2, Award, ArrowRight, Target } from "lucide-react";
import { Goal } from "../lib/types";
import { formatINR, daysElapsed } from "../lib/calculations";
import Confetti from "./Confetti";

interface GoalCompletionModalProps {
  goal: Goal;
  onViewGoal: () => void;
  onBackToDashboard: () => void;
}

export default function GoalCompletionModal({
  goal,
  onViewGoal,
  onBackToDashboard
}: GoalCompletionModalProps) {
  const elapsedDays = daysElapsed(goal.startDate || goal.createdAt.slice(0, 10));

  function formatDuration(days: number) {
    if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) return `${months} month${months === 1 ? "" : "s"}`;
    return `${months} month${months === 1 ? "" : "s"} ${remainingDays} day${remainingDays === 1 ? "" : "s"}`;
  }

  return (
    <>
      <Confetti />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="finance-card w-full max-w-md p-6 text-center space-y-5 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#0d684c] dark:bg-[#18181b] dark:text-emerald-400">
            <Award size={32} />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0d684c] dark:bg-[#18181b] dark:text-emerald-400">
              <CheckCircle2 size={12} /> Goal Completed
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">
              You reached your goal!
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Target amount achieved successfully through planned contributions.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#18181b] space-y-2.5 text-xs text-left">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400">Goal:</span>
              <strong className="font-bold text-zinc-900 dark:text-white text-sm">{goal.name}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Final Saved:</span>
              <strong className="font-bold text-[#0d684c] dark:text-emerald-400">{formatINR(goal.currentAmount)}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Target Amount:</span>
              <strong className="font-bold text-zinc-800 dark:text-zinc-200">{formatINR(goal.targetAmount)}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Completion Date:</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Time Taken:</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{formatDuration(elapsedDays)}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onBackToDashboard}
              className="btn-secondary flex-1 text-xs font-bold"
            >
              Back to Dashboard
            </button>
            <button
              onClick={onViewGoal}
              className="btn-primary flex-1 text-xs font-bold"
            >
              <span>View Goal</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
