"use client";

import { useMemo } from "react";
import { ArrowLeft, Flame, Award, Star, Trophy, Calendar, Target, Zap } from "lucide-react";
import { Badge, SavingsStreak, Goal } from "../lib/types";
import { formatINR } from "../lib/calculations";

interface GamificationViewProps {
  badges: Badge[];
  streak: SavingsStreak;
  goals: Goal[];
  totalDeposited: number;
  onBack: () => void;
  onStartChallenge?: (challenge: {
    name: string;
    targetAmount: number;
    targetDate: string;
    note: string;
  }) => void;
}

function StreakRing({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const dash = circ * pct;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <svg width={88} height={88} viewBox="0 0 88 88">
          <circle cx={44} cy={44} r={r} fill="none" strokeWidth={8}
            className="stroke-zinc-100 dark:stroke-zinc-800" />
          <circle cx={44} cy={44} r={r} fill="none" strokeWidth={8}
            stroke={color}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 44 44)"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-extrabold text-zinc-900 dark:text-white">{value}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
    </div>
  );
}

export default function GamificationView({ badges, streak, goals, totalDeposited, onBack, onStartChallenge }: GamificationViewProps) {
  const earnedBadges = useMemo(() => badges.filter(b => b.earnedAt), [badges]);
  const unearnedBadges = useMemo(() => badges.filter(b => !b.earnedAt), [badges]);
  const completedGoals = useMemo(() => goals.filter(g => g.status === "completed").length, [goals]);

  const streakMilestones = [
    { days: 7, label: "7 Days", color: "#f97316" },
    { days: 14, label: "14 Days", color: "#eab308" },
    { days: 30, label: "30 Days", color: "#10b981" },
    { days: 60, label: "60 Days", color: "#0d684c" },
    { days: 100, label: "100 Days", color: "#a855f7" },
  ];

  const nextMilestone = streakMilestones.find(m => m.days > streak.currentStreak) || streakMilestones[streakMilestones.length - 1];

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Trophy size={22} className="text-[#0d684c] dark:text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight">Streaks & Badges</h1>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">Your savings milestones and consistency rewards</p>
      </div>

      {/* Streak Card */}
      <div className="finance-card p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Flame size={18} className="text-orange-500" />
          <h2 className="font-bold text-sm">Savings Streak</h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StreakRing
            value={streak.currentStreak}
            max={nextMilestone.days}
            label="Current"
            color={streak.currentStreak >= 7 ? "#f97316" : "#0d684c"}
          />
          <StreakRing
            value={streak.longestStreak}
            max={Math.max(streak.longestStreak, 30)}
            label="Best"
            color="#a855f7"
          />
          <StreakRing
            value={streak.totalDepositDays}
            max={Math.max(streak.totalDepositDays, 30)}
            label="Total Days"
            color="#3b82f6"
          />
        </div>

        {streak.currentStreak > 0 ? (
          <div className="mt-5 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-3.5 flex items-center gap-3">
            <Flame size={20} className="text-orange-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-orange-800 dark:text-orange-300">
                🔥 {streak.currentStreak}-day streak!
              </p>
              <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-0.5">
                {nextMilestone.days - streak.currentStreak} more days to reach your {nextMilestone.label} milestone
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-zinc-50 dark:bg-[#18181b] border border-zinc-100 dark:border-zinc-800 p-3.5 text-center">
            <p className="text-xs font-semibold text-zinc-500">Make a deposit today to start your streak! 🚀</p>
          </div>
        )}

        {/* Milestone Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1">
            <span>0</span>
            {streakMilestones.map(m => (
              <span key={m.days} className={streak.currentStreak >= m.days ? "text-[#0d684c] dark:text-emerald-400" : ""}>{m.days}</span>
            ))}
          </div>
          <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 via-yellow-400 to-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(100, (streak.currentStreak / 100) * 100)}%` }}
            />
            {streakMilestones.map(m => (
              <div
                key={m.days}
                className={`absolute top-0 w-0.5 h-full ${streak.currentStreak >= m.days ? "bg-white/60" : "bg-zinc-300 dark:bg-zinc-600"}`}
                style={{ left: `${(m.days / 100) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="finance-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Target size={20} className="text-[#0d684c] dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{goals.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Goals Created</p>
        </div>
        <div className="finance-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Trophy size={20} className="text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{completedGoals}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Completed</p>
        </div>
        <div className="finance-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Award size={20} className="text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{earnedBadges.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Badges Earned</p>
        </div>
      </div>

      {/* Total Deposited Banner */}
      {totalDeposited > 0 && (
        <div className="finance-card p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-[#0d684c]/10 dark:to-[#0f7a59]/10 border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0d684c] flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#0d684c] dark:text-emerald-400">All-Time Savings</p>
              <p className="text-xl font-extrabold text-zinc-900 dark:text-white">{formatINR(totalDeposited)}</p>
              <p className="text-[10px] text-zinc-500">Total deposited across all goals</p>
            </div>
          </div>
        </div>
      )}

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="finance-card p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
            <Star size={16} className="text-amber-500" />
            <h2 className="font-bold text-sm">Earned Badges ({earnedBadges.length})</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {earnedBadges.map(badge => (
              <div
                key={badge.id}
                className="flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 p-3"
              >
                <span className="text-2xl shrink-0">{badge.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{badge.name}</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5 line-clamp-2">{badge.description}</p>
                  {badge.earnedAt && (
                    <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">
                      {new Date(badge.earnedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {unearnedBadges.length > 0 && (
        <div className="finance-card p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
            <Award size={16} className="text-zinc-400" />
            <h2 className="font-bold text-sm text-zinc-500">Locked Badges ({unearnedBadges.length})</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {unearnedBadges.map(badge => (
              <div
                key={badge.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#18181b] p-3 opacity-60"
              >
                <span className="text-2xl shrink-0 grayscale">{badge.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-500 truncate">{badge.name}</p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5 line-clamp-2">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savings Challenges */}
      <div className="finance-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#0d684c] dark:text-emerald-400" />
            <h2 className="font-bold text-sm">Savings Challenges & Habit Sprints</h2>
          </div>
          <span className="text-[10px] text-zinc-400">Pre-built schedules</span>
        </div>
        <div className="space-y-3">
          {[
            {
              name: "52-Week Challenge",
              desc: "Save incrementally each week: ₹100 week 1, ₹200 week 2... reaching ₹5,200 in week 52.",
              emoji: "📅",
              targetAmount: 137800,
              durationDays: 365,
              note: "52-Week Challenge saving ₹100, ₹200... up to ₹5,200/wk."
            },
            {
              name: "30-Day Momentum Kickstart",
              desc: "Deposit ₹500 every day for 30 consecutive days to establish ironclad savings discipline.",
              emoji: "⚡",
              targetAmount: 15000,
              durationDays: 30,
              note: "30-Day habit sprint depositing ₹500 daily."
            },
            {
              name: "Daily ₹50 Habit Builder",
              desc: "Save just ₹50 every single day without feeling any pinch — accumulates ₹18,250 in 1 year.",
              emoji: "⭐",
              targetAmount: 18250,
              durationDays: 365,
              note: "Daily ₹50 habit builder for 365 days."
            },
            {
              name: "100-Day ₹25K Reserve",
              desc: "Deposit ₹250 per day for 100 days to build a fast ₹25,000 emergency buffer.",
              emoji: "🎯",
              targetAmount: 25000,
              durationDays: 100,
              note: "100-Day sprint building ₹25,000 cash reserve."
            }
          ].map(c => {
            const isAlreadyActive = goals.some(g => g.name === c.name && g.status === "active");
            return (
              <div
                key={c.name}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 p-3.5 hover:border-zinc-200 dark:hover:border-zinc-700 transition"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 mt-0.5">{c.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{c.name}</p>
                      <span className="text-[10px] font-bold text-[#0d684c] dark:text-emerald-400 bg-emerald-50 dark:bg-[#18181b] px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {formatINR(c.targetAmount)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">{c.desc}</p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {isAlreadyActive ? (
                    <span className="text-[11px] font-bold text-[#0d684c] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1">
                      ✓ Active Challenge
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + c.durationDays);
                        onStartChallenge?.({
                          name: c.name,
                          targetAmount: c.targetAmount,
                          targetDate: d.toISOString().slice(0, 10),
                          note: c.note
                        });
                      }}
                      className="btn-primary !py-1.5 !px-3 text-xs font-bold"
                    >
                      Start Challenge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
