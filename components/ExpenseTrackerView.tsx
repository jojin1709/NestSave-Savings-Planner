"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft, Plus, Trash2, TrendingDown, AlertTriangle,
  CheckCircle2, ChevronRight, X, IndianRupee, Target,
  BarChart3, Calendar
} from "lucide-react";
import { Expense, Budget, ExpenseCategory } from "../lib/types";
import { formatINR } from "../lib/calculations";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food & Dining", "Transport", "Shopping", "Bills & Utilities",
  "Entertainment", "Health", "Education", "Rent", "Investments", "Other"
];

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#f97316",
  "Transport": "#3b82f6",
  "Shopping": "#a855f7",
  "Bills & Utilities": "#eab308",
  "Entertainment": "#ec4899",
  "Health": "#10b981",
  "Education": "#06b6d4",
  "Rent": "#f43f5e",
  "Investments": "#0d684c",
  "Other": "#71717a",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  "Food & Dining": "🍔",
  "Transport": "🚗",
  "Shopping": "🛍️",
  "Bills & Utilities": "💡",
  "Entertainment": "🎬",
  "Health": "💊",
  "Education": "📚",
  "Rent": "🏠",
  "Investments": "📈",
  "Other": "📦",
};

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

interface ExpenseTrackerProps {
  expenses: Expense[];
  budgets: Budget[];
  onBack: () => void;
  onAddExpense: (expense: Expense) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  onSaveBudget: (budget: Budget) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
}

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function dateInput(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatMonth(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export default function ExpenseTrackerView({
  expenses, budgets, onBack, onAddExpense, onDeleteExpense, onSaveBudget, onDeleteBudget
}: ExpenseTrackerProps) {
  const [tab, setTab] = useState<"log" | "budgets" | "history">("log");
  const [addForm, setAddForm] = useState(false);

  // Add expense form
  const [expCategory, setExpCategory] = useState<ExpenseCategory>("Food & Dining");
  const [expAmount, setExpAmount] = useState("");
  const [expNote, setExpNote] = useState("");
  const [expDate, setExpDate] = useState(dateInput());
  const [addingExpense, setAddingExpense] = useState(false);

  // Budget form
  const [budgetForm, setBudgetForm] = useState(false);
  const [budCategory, setBudCategory] = useState<ExpenseCategory>("Food & Dining");
  const [budLimit, setBudLimit] = useState("");

  const selectedMonth = currentMonth();

  const thisMonthExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const totalThisMonth = useMemo(() => {
    return thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  }, [thisMonthExpenses]);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    thisMonthExpenses.forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([cat, amt]) => ({ category: cat, amount: amt }))
      .sort((a, b) => b.amount - a.amount);
  }, [thisMonthExpenses]);

  const thisMonthBudgets = useMemo(() => {
    return budgets.filter(b => b.month === selectedMonth);
  }, [budgets, selectedMonth]);

  const budgetStatus = useMemo(() => {
    return thisMonthBudgets.map(b => {
      const spent = thisMonthExpenses
        .filter(e => e.category === b.category)
        .reduce((s, e) => s + e.amount, 0);
      const pct = b.monthlyLimit > 0 ? Math.min(100, Math.round((spent / b.monthlyLimit) * 100)) : 0;
      const remaining = Math.max(0, b.monthlyLimit - spent);
      return { ...b, spent, pct, remaining, overBudget: spent > b.monthlyLimit };
    });
  }, [thisMonthBudgets, thisMonthExpenses]);

  async function handleAddExpense() {
    const amt = Number(expAmount);
    if (!amt || amt <= 0) return;
    setAddingExpense(true);
    try {
      const expense: Expense = {
        id: uid(),
        category: expCategory,
        amount: Math.round(amt),
        date: expDate,
        note: expNote.trim(),
        createdAt: new Date().toISOString()
      };
      await onAddExpense(expense);
      setExpAmount("");
      setExpNote("");
      setExpDate(dateInput());
      setAddForm(false);
    } finally {
      setAddingExpense(false);
    }
  }

  async function handleSaveBudget() {
    const limit = Number(budLimit);
    if (!limit || limit <= 0) return;
    const existing = thisMonthBudgets.find(b => b.category === budCategory);
    if (existing) {
      await onSaveBudget({ ...existing, monthlyLimit: limit });
    } else {
      await onSaveBudget({
        id: uid(),
        category: budCategory,
        monthlyLimit: Math.round(limit),
        month: selectedMonth,
        createdAt: new Date().toISOString()
      });
    }
    setBudLimit("");
    setBudgetForm(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => setAddForm(true)}
          className="btn-primary !py-2 text-xs font-bold"
        >
          <Plus size={14} /> Log Expense
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expense Tracker</h1>
        <p className="text-xs text-zinc-500 mt-0.5">{formatMonth(selectedMonth)} · All spending stays on your device</p>
      </div>

      {/* Summary Card */}
      <div className="finance-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Total Spent This Month</p>
            <p className="text-3xl font-extrabold tracking-tight mt-1 text-zinc-900 dark:text-white">{formatINR(totalThisMonth)}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{thisMonthExpenses.length} transactions recorded</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/30">
            <TrendingDown size={22} className="text-rose-600 dark:text-rose-400" />
          </div>
        </div>

        {/* Top categories mini bar */}
        {categoryTotals.length > 0 && (
          <div className="mt-4 space-y-2">
            {categoryTotals.slice(0, 4).map(({ category, amount }) => {
              const pct = totalThisMonth > 0 ? Math.round((amount / totalThisMonth) * 100) : 0;
              const color = CATEGORY_COLORS[category] || "#71717a";
              return (
                <div key={category} className="flex items-center gap-3 text-xs">
                  <span className="text-sm">{CATEGORY_EMOJIS[category]}</span>
                  <span className="w-28 font-semibold text-zinc-700 dark:text-zinc-300 truncate">{category}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 w-16 text-right">{formatINR(amount)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-zinc-100 dark:bg-[#18181b]">
        {(["log", "budgets", "history"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition capitalize ${
              tab === t
                ? "bg-white dark:bg-[#121212] text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {t === "log" ? "Quick Log" : t === "budgets" ? "Budgets" : "History"}
          </button>
        ))}
      </div>

      {/* QUICK LOG TAB */}
      {tab === "log" && (
        <div className="space-y-3">
          {/* Category grid */}
          <div className="finance-card p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Tap to Log</p>
            <div className="grid grid-cols-2 gap-2">
              {EXPENSE_CATEGORIES.map(cat => {
                const spent = thisMonthExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setExpCategory(cat);
                      setAddForm(true);
                    }}
                    className="flex items-center gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 p-3 text-left hover:border-zinc-300 dark:hover:border-zinc-600 transition active:scale-95"
                  >
                    <span className="text-xl">{CATEGORY_EMOJIS[cat]}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{cat}</p>
                      {spent > 0 && (
                        <p className="text-[10px] font-semibold text-zinc-400">{formatINR(spent)} this month</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BUDGETS TAB */}
      {tab === "budgets" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">Set monthly spending limits per category</p>
            <button
              onClick={() => setBudgetForm(true)}
              className="btn-secondary !py-1.5 text-xs"
            >
              <Plus size={13} /> Set Budget
            </button>
          </div>

          {budgetStatus.length === 0 ? (
            <div className="finance-card p-8 text-center">
              <Target size={28} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
              <p className="text-xs font-semibold text-zinc-500">No budgets set yet</p>
              <p className="text-[11px] text-zinc-400 mt-1">Set a monthly limit to track overspending</p>
            </div>
          ) : (
            budgetStatus.map(b => (
              <div key={b.id} className="finance-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_EMOJIS[b.category]}</span>
                    <div>
                      <p className="font-bold text-sm text-zinc-900 dark:text-white">{b.category}</p>
                      <p className="text-[10px] text-zinc-400">{formatINR(b.spent)} of {formatINR(b.monthlyLimit)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.overBudget ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={10} /> Over Budget
                      </span>
                    ) : b.pct >= 80 ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={10} /> {b.pct}% Used
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#0d684c] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={10} /> {formatINR(b.remaining)} left
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteBudget(b.id)}
                      className="text-zinc-400 hover:text-rose-500 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.overBudget ? "bg-rose-500" : b.pct >= 80 ? "bg-amber-500" : "bg-[#0d684c]"
                    }`}
                    style={{ width: `${Math.min(100, b.pct)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div className="finance-card overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-sm">Transaction History</h3>
            <span className="text-xs text-zinc-400">{expenses.length} total</span>
          </div>
          {expenses.length === 0 ? (
            <div className="p-8 text-center">
              <BarChart3 size={28} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
              <p className="text-xs text-zinc-400">No expenses logged yet</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {expenses.map(e => (
                <div key={e.id} className="flex items-center justify-between p-4 hover:bg-zinc-50/50 dark:hover:bg-[#18181b]/50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{CATEGORY_EMOJIS[e.category]}</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {e.note || e.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-zinc-400">{e.date}</span>
                        <span className="text-[10px] text-zinc-400">·</span>
                        <span className="text-[10px] text-zinc-400">{e.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400">
                      −{formatINR(e.amount)}
                    </span>
                    <button
                      onClick={() => onDeleteExpense(e.id)}
                      className="text-zinc-300 hover:text-rose-500 dark:text-zinc-600 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Expense Modal */}
      {addForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="finance-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Log Expense</h3>
              <button onClick={() => setAddForm(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="label">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {EXPENSE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setExpCategory(cat)}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                      expCategory === cat
                        ? "border-[#0d684c] bg-emerald-50 text-[#0d684c] dark:border-emerald-500 dark:bg-[#18181b] dark:text-emerald-400"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <span>{CATEGORY_EMOJIS[cat]}</span>
                    <span className="truncate">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 250"
                value={expAmount}
                onChange={e => setExpAmount(e.target.value)}
                className="input font-bold text-lg"
                autoFocus
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setExpAmount(String(amt))}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181b] px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    {formatINR(amt)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Lunch with team"
                value={expNote}
                onChange={e => setExpNote(e.target.value)}
                className="input text-xs"
              />
            </div>

            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={expDate}
                onChange={e => setExpDate(e.target.value)}
                className="input text-xs"
              />
            </div>

            <button
              onClick={handleAddExpense}
              disabled={!expAmount || Number(expAmount) <= 0 || addingExpense}
              className="btn-primary w-full"
            >
              <IndianRupee size={14} /> Log {expCategory} Expense
            </button>
          </div>
        </div>
      )}

      {/* Budget Form Modal */}
      {budgetForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="finance-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Set Monthly Budget</h3>
              <button onClick={() => setBudgetForm(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="label">Category</label>
              <select
                value={budCategory}
                onChange={e => setBudCategory(e.target.value as ExpenseCategory)}
                className="input text-sm cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Monthly Limit (₹)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={budLimit}
                onChange={e => setBudLimit(e.target.value)}
                className="input font-bold"
                autoFocus
              />
            </div>

            <button
              onClick={handleSaveBudget}
              disabled={!budLimit || Number(budLimit) <= 0}
              className="btn-primary w-full"
            >
              <Target size={14} /> Save Budget for {formatMonth(selectedMonth)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
