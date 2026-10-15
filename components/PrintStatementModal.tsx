"use client";

import { useMemo } from "react";
import { X, Printer, ShieldCheck, CheckCircle2, Award, Target, Wallet } from "lucide-react";
import { Goal, Transaction, AppSettings, SavingsStreak, Badge } from "../lib/types";
import { formatINR, monthlyGoalRequirement, savingsCapacity } from "../lib/calculations";
import NestSaveLogo from "./NestSaveLogo";

interface PrintStatementModalProps {
  goals: Goal[];
  transactions: Transaction[];
  settings: AppSettings;
  streak: SavingsStreak;
  badges: Badge[];
  onClose: () => void;
}

export default function PrintStatementModal({
  goals,
  transactions,
  settings,
  streak,
  badges,
  onClose
}: PrintStatementModalProps) {
  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }, []);

  const totalSaved = useMemo(() => goals.reduce((s, g) => s + g.currentAmount, 0), [goals]);
  const totalTarget = useMemo(() => goals.reduce((s, g) => s + g.targetAmount, 0), [goals]);
  const activeGoals = useMemo(() => goals.filter(g => g.status === "active"), [goals]);
  const completedGoals = useMemo(() => goals.filter(g => g.status === "completed"), [goals]);
  const earnedBadges = useMemo(() => badges.filter(b => b.earnedAt), [badges]);

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="finance-card w-full max-w-3xl max-h-[92vh] flex flex-col p-6 shadow-2xl bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 border-zinc-200">
        {/* Controls Bar (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 no-print">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
            <Printer size={16} />
            <span>Print or Save PDF Statement</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-primary !py-1.5 !px-3 text-xs font-bold flex items-center gap-1.5"
            >
              <Printer size={14} /> Print / Save as PDF
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 p-1">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-6 text-zinc-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4">
            <div className="flex items-center gap-3">
              <NestSaveLogo size={42} />
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">NestSave Financial Statement</h1>
                <p className="text-[11px] text-zinc-500 font-medium">Local-First Sovereign Savings Vault • Zero Cloud</p>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold">{todayStr}</div>
              <div className="text-[10px] text-zinc-500 font-mono">Vault ID: NSV-{Math.abs(totalTarget).toString(16).toUpperCase()}</div>
            </div>
          </div>

          {/* Metric Summary Grid */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="rounded-xl border border-zinc-200 p-3 bg-zinc-50">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Total Saved</span>
              <strong className="text-base font-extrabold text-[#0d684c]">{formatINR(totalSaved)}</strong>
            </div>
            <div className="rounded-xl border border-zinc-200 p-3 bg-zinc-50">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Total Target</span>
              <strong className="text-base font-extrabold text-zinc-900">{formatINR(totalTarget)}</strong>
            </div>
            <div className="rounded-xl border border-zinc-200 p-3 bg-zinc-50">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Active Goals</span>
              <strong className="text-base font-extrabold text-zinc-900">{activeGoals.length}</strong>
            </div>
            <div className="rounded-xl border border-zinc-200 p-3 bg-zinc-50">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Savings Streak</span>
              <strong className="text-base font-extrabold text-orange-600">🔥 {streak.currentStreak} Days</strong>
            </div>
          </div>

          {/* Active Goals Table */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">Active Savings Plans</h2>
            <div className="rounded-xl border border-zinc-200 overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-100 text-[10px] uppercase font-bold text-zinc-600 border-b border-zinc-200">
                  <tr>
                    <th className="p-2.5">Goal Name</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Deadline</th>
                    <th className="p-2.5 text-right">Target</th>
                    <th className="p-2.5 text-right">Saved</th>
                    <th className="p-2.5 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {activeGoals.map(g => {
                    const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
                    return (
                      <tr key={g.id}>
                        <td className="p-2.5 font-bold text-zinc-900">{g.name}</td>
                        <td className="p-2.5 text-zinc-600 capitalize">{g.category}</td>
                        <td className="p-2.5 text-zinc-600 font-mono text-[11px]">{g.targetDate}</td>
                        <td className="p-2.5 text-right font-mono">{formatINR(g.targetAmount)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#0d684c]">{formatINR(g.currentAmount)}</td>
                        <td className="p-2.5 text-right font-bold">{pct}%</td>
                      </tr>
                    );
                  })}
                  {activeGoals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-zinc-400">No active savings plans currently open.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Completed Goals Section (Certificates of Achievement) */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">Completed Achievements (100% Funded)</h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {completedGoals.map(cg => (
                  <div key={cg.id} className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-3 flex items-start gap-2.5">
                    <CheckCircle2 size={18} className="text-[#0d684c] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-zinc-900">{cg.name}</div>
                      <div className="text-[11px] text-emerald-800 font-mono">100% Complete • {formatINR(cg.targetAmount)} Saved</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges Earned */}
          {earnedBadges.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1.5">Earned Milestones & Badges</span>
              <div className="flex flex-wrap gap-2">
                {earnedBadges.map(b => (
                  <span key={b.id} className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-semibold bg-zinc-50">
                    <span>{b.icon}</span>
                    <span>{b.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Official Footer Verification */}
          <div className="pt-6 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#0d684c]" />
              <span>Certified Authenticated Local Vault Record • Generated entirely offline</span>
            </div>
            <div>NestSave • nestsave.vercel.app</div>
          </div>
        </div>
      </div>
    </div>
  );
}
