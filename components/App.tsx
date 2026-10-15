"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, CalendarDays, Check,
  ChevronRight, CircleHelp, Download, ExternalLink, IndianRupee,
  Link2, Moon, Plus, RotateCcw, Save, Settings, ShieldCheck,
  Sparkles, Trash2, Upload, Wallet, X, Sun, SlidersHorizontal,
  Flame, Award, AlertCircle, CheckCircle2, Clock, Percent, TrendingUp,
  FileSpreadsheet, AlertTriangle, Calendar, Repeat, PlayCircle, Bot,
  PauseCircle, CheckCircle, RefreshCw, Cpu, Wifi, WifiOff, Undo2, Target,
  Smartphone, Share, BarChart3, TrendingDown, Trophy, Home, Calculator, Bell,
  Lock, Unlock, Printer, KeyRound
} from "lucide-react";

import NestSaveLogo from "./NestSaveLogo";
import ConfirmationModal from "./ConfirmationModal";
import GoalCompletionModal from "./GoalCompletionModal";
import GoalCategoryIcon, { ICON_OPTIONS } from "./GoalCategoryIcon";
import AnalyticsView from "./AnalyticsView";
import ExpenseTrackerView from "./ExpenseTrackerView";
import GamificationView from "./GamificationView";
import CalculatorsView from "./CalculatorsView";
import AppLockModal from "./AppLockModal";
import SalaryDayBatchModal from "./SalaryDayBatchModal";
import RecalibratePlanModal from "./RecalibratePlanModal";
import PrintStatementModal from "./PrintStatementModal";
import EncryptedVaultModal from "./EncryptedVaultModal";
import { hashPin, verifyPin } from "../lib/security";

import {
  Goal, Transaction, AppSettings, GoalStatus, GoalType, Priority, SavingsFrequency,
  Expense, Budget, Badge, SavingsStreak
} from "../lib/types";

import {
  getAllGoals, saveGoal, deleteGoal, getAllTransactions,
  addTransactionAndUpdateGoal, getSettings, saveSettings,
  exportFullBackup, importFullBackup, resetDatabase, DEFAULT_SETTINGS,
  getAllExpenses, saveExpense, deleteExpense,
  getAllBudgets, saveBudget, deleteBudget,
  getStreak, updateStreak, getBadges, awardBadge
} from "../lib/storage";

import {
  formatINR, daysRemaining, daysElapsed, remainingAmount,
  requiredDaily, requiredWeekly, requiredMonthly, monthlyGoalRequirement,
  savingsCapacity, feasibility, projectedCompletionDate, currentPace,
  aheadBehindSchedule, suggestedDeadline, conflictDetection,
  multiGoalAllocation, exportGoalsToCSV, exportTransactionsToCSV,
  calculateInflationAdjustedTarget
} from "../lib/calculations";

import {
  AI_MODELS, detectDeviceCapability, answerFinancialQueryLocally
} from "../lib/ai-assistant";

const CATEGORIES = [
  "Technology", "Vehicle", "Travel", "Education", "Home",
  "Health", "Emergency", "Personal", "Other"
];

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function dateInput(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function addMonthsToDate(months: number, base = new Date()) {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function triggerHaptic(type: "light" | "success" = "light") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      if (type === "success") {
        navigator.vibrate([25, 40, 25]);
      } else {
        navigator.vibrate(15);
      }
    } catch {}
  }
}

export default function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // NEW: Expense & Budget data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // NEW: Gamification
  const [streak, setStreak] = useState<SavingsStreak>({ currentStreak: 0, longestStreak: 0, lastDepositDate: null, totalDepositDays: 0 });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [newBadgeToast, setNewBadgeToast] = useState<Badge | null>(null);

  // Navigation — includes new views
  const [view, setView] = useState<"dashboard" | "goal" | "settings" | "ai" | "analytics" | "expenses" | "gamification" | "calculators">("dashboard");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  // Celebrations & Confirmations
  const [completedGoalForCelebration, setCompletedGoalForCelebration] = useState<Goal | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "paused">("all");
  const [sortBy, setSortBy] = useState<"targetDate" | "progress" | "targetAmount">("targetDate");

  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  // Reversible Toast Notification with Undo Action
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error" | "info" | "warning";
    action?: {
      label: string;
      onAction: () => void;
    };
  } | null>(null);

  // App Lock State
  const [isUnlocked, setIsUnlocked] = useState(true);

  // New Feature Modals
  const [showSalaryDayModal, setShowSalaryDayModal] = useState(false);
  const [recalibratingGoal, setRecalibratingGoal] = useState<Goal | null>(null);
  const [showPrintStatement, setShowPrintStatement] = useState(false);
  const [encryptedModalMode, setEncryptedModalMode] = useState<"export" | "import" | null>(null);
  const [rawBackupJson, setRawBackupJson] = useState("");
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = localStorage.getItem("nestsave_dismiss_android_banner") === "true";
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (!isDismissed && isAndroid) {
        setShowAndroidBanner(true);
      }
    }
  }, []);

  // 1. Initial Load & PWA
  useEffect(() => {
    async function init() {
      const [storedGoals, storedTx, storedSettings, storedExpenses, storedBudgets] = await Promise.all([
        getAllGoals(),
        getAllTransactions(),
        getSettings(),
        getAllExpenses(),
        getAllBudgets()
      ]);
      setGoals(storedGoals);
      setTransactions(storedTx);
      setSettings(storedSettings);
      setExpenses(storedExpenses);
      setBudgets(storedBudgets);
      setStreak(getStreak());
      setBadges(getBadges());
      if (storedSettings.appLockEnabled && storedSettings.pinHash && storedSettings.pinSalt) {
        setIsUnlocked(false);
      }
      setReady(true);
    }
    init();

    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check if running as installed standalone PWA
    if (typeof window !== "undefined") {
      const isApp =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isApp);

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e);
      };

      const handleAppInstalled = () => {
        setInstallPrompt(null);
        setIsStandalone(true);
        showToast("NestSave installed successfully to your home screen!");
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);
      window.addEventListener("appinstalled", handleAppInstalled);

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function triggerInstallApp() {
    if (installPrompt) {
      installPrompt.prompt();
      try {
        const choice = await installPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstallPrompt(null);
          setIsStandalone(true);
          showToast("Installing NestSave to your device...");
        }
      } catch {}
    } else {
      showToast("Download prompt ready. Use browser menu → 'Install app' to install.", "info");
    }
  }

  const isDark = useMemo(() => {
    if (settings.theme === "dark") return true;
    if (settings.theme === "light") return false;
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, [settings.theme]);

  // 2. Pure Black Theme Management
  useEffect(() => {
    if (!ready) return;
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [isDark, ready]);

  // Toast Auto-dismiss (6 seconds if has undo, else 3.5s)
  useEffect(() => {
    if (!toast) return;
    const timeout = toast.action ? 6000 : 3500;
    const t = setTimeout(() => setToast(null), timeout);
    return () => clearTimeout(t);
  }, [toast]);

  function showToast(
    message: string,
    type: "success" | "error" | "info" | "warning" = "success",
    action?: { label: string; onAction: () => void }
  ) {
    setToast({ message, type, action });
  }

  async function refreshData() {
    const [storedGoals, storedTx, storedSettings, storedExpenses, storedBudgets] = await Promise.all([
      getAllGoals(),
      getAllTransactions(),
      getSettings(),
      getAllExpenses(),
      getAllBudgets()
    ]);
    setGoals(storedGoals);
    setTransactions(storedTx);
    setSettings(storedSettings);
    setExpenses(storedExpenses);
    setBudgets(storedBudgets);
    setBadges(getBadges());
    setStreak(getStreak());
  }

  // Badge check helper
  function checkAndAwardBadges(opts: {
    goalsCount?: number;
    completedCount?: number;
    depositCount?: number;
    newStreak?: SavingsStreak;
    pct?: number;
  }) {
    const newBadges: Badge[] = [];
    const currentBadges = getBadges();
    const wasEarned = (id: string) => currentBadges.find(b => b.id === id)?.earnedAt;

    if (opts.goalsCount !== undefined && opts.goalsCount >= 1 && !wasEarned("first_goal")) {
      if (awardBadge("first_goal")) newBadges.push(getBadges().find(b => b.id === "first_goal")!);
    }
    if (opts.goalsCount !== undefined && opts.goalsCount >= 5 && !wasEarned("five_goals")) {
      if (awardBadge("five_goals")) newBadges.push(getBadges().find(b => b.id === "five_goals")!);
    }
    if (opts.depositCount !== undefined && opts.depositCount >= 1 && !wasEarned("first_deposit")) {
      if (awardBadge("first_deposit")) newBadges.push(getBadges().find(b => b.id === "first_deposit")!);
    }
    if (opts.depositCount !== undefined && opts.depositCount >= 10 && !wasEarned("consistent_saver")) {
      if (awardBadge("consistent_saver")) newBadges.push(getBadges().find(b => b.id === "consistent_saver")!);
    }
    if (opts.newStreak !== undefined && opts.newStreak.currentStreak >= 7 && !wasEarned("streak_7")) {
      if (awardBadge("streak_7")) newBadges.push(getBadges().find(b => b.id === "streak_7")!);
    }
    if (opts.newStreak !== undefined && opts.newStreak.currentStreak >= 30 && !wasEarned("streak_30")) {
      if (awardBadge("streak_30")) newBadges.push(getBadges().find(b => b.id === "streak_30")!);
    }
    if (opts.completedCount !== undefined && opts.completedCount >= 1 && !wasEarned("goal_completed")) {
      if (awardBadge("goal_completed")) newBadges.push(getBadges().find(b => b.id === "goal_completed")!);
    }
    if (opts.completedCount !== undefined && opts.completedCount >= 3 && !wasEarned("three_completed")) {
      if (awardBadge("three_completed")) newBadges.push(getBadges().find(b => b.id === "three_completed")!);
    }
    if (opts.pct !== undefined && opts.pct >= 50 && !wasEarned("halfway_hero")) {
      if (awardBadge("halfway_hero")) newBadges.push(getBadges().find(b => b.id === "halfway_hero")!);
    }
    if (opts.pct !== undefined && opts.pct >= 75 && !wasEarned("savings_champion")) {
      if (awardBadge("savings_champion")) newBadges.push(getBadges().find(b => b.id === "savings_champion")!);
    }
    if (newBadges.length > 0) {
      setBadges(getBadges());
      const validBadge = newBadges.find(b => b != null);
      if (validBadge) setNewBadgeToast(validBadge);
    }
  }

  // Financial Capacity
  const availableMonthlyCapacity = useMemo(() => {
    return savingsCapacity(
      settings.monthlyIncome,
      settings.fixedMonthlyExpenses,
      settings.otherMonthlySavings,
      settings.safetyBuffer
    );
  }, [settings]);

  // Dashboard Metrics
  const dashboardTotals = useMemo(() => {
    const saved = goals.reduce((s, g) => s + g.currentAmount, 0);
    const target = goals.reduce((s, g) => s + g.targetAmount, 0);
    const remaining = Math.max(0, target - saved);
    const overallPct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

    const active = goals.filter(g => g.status === "active");
    const completed = goals.filter(g => g.status === "completed");

    const paceStats = active.reduce(
      (acc, g) => {
        const pace = aheadBehindSchedule(g.targetAmount, g.currentAmount, g.startDate, g.targetDate);
        if (pace.status === "ahead") acc.ahead++;
        else if (pace.status === "behind") acc.behind++;
        else acc.onTrack++;
        return acc;
      },
      { ahead: 0, behind: 0, onTrack: 0 }
    );

    return {
      saved,
      target,
      remaining,
      overallPct,
      activeCount: active.length,
      completedCount: completed.length,
      paceStats
    };
  }, [goals]);

  // Multi-Goal Conflict Detection
  const conflictReport = useMemo(() => {
    return conflictDetection(goals, availableMonthlyCapacity);
  }, [goals, availableMonthlyCapacity]);

  // Priority Allocations
  const priorityAllocations = useMemo(() => {
    return multiGoalAllocation(goals, availableMonthlyCapacity);
  }, [goals, availableMonthlyCapacity]);

  // Filtered Goals
  const filteredGoals = useMemo(() => {
    return goals
      .filter(g => {
        if (statusFilter === "active") return g.status === "active";
        if (statusFilter === "completed") return g.status === "completed";
        if (statusFilter === "paused") return g.status === "paused";
        return g.status !== "archived";
      })
      .filter(g => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          g.name.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.type.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "targetDate") {
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        }
        if (sortBy === "progress") {
          const pctA = a.targetAmount ? a.currentAmount / a.targetAmount : 0;
          const pctB = b.targetAmount ? b.currentAmount / b.targetAmount : 0;
          return pctB - pctA;
        }
        if (sortBy === "targetAmount") {
          return b.targetAmount - a.targetAmount;
        }
        return 0;
      });
  }, [goals, statusFilter, searchQuery, sortBy]);

  const selectedGoal = useMemo(() => {
    return goals.find(g => g.id === selectedGoalId) || null;
  }, [goals, selectedGoalId]);

  const selectedGoalTransactions = useMemo(() => {
    if (!selectedGoalId) return [];
    return transactions.filter(t => t.goalId === selectedGoalId);
  }, [transactions, selectedGoalId]);

  // -------------------------------------------------------------
  // ACTIONS WITH MILESTONE CELEBRATIONS & UNDO
  // -------------------------------------------------------------
  async function handleCreateGoal(newGoal: Goal, initialDeposit?: number) {
    await saveGoal(newGoal);
    if (initialDeposit && initialDeposit > 0) {
      await addTransactionAndUpdateGoal({
        goalId: newGoal.id,
        type: "deposit",
        amount: initialDeposit,
        note: "Initial savings contribution",
        date: newGoal.startDate || dateInput()
      });
    }
    await refreshData();
    setShowCreateWizard(false);
    setSelectedGoalId(newGoal.id);
    setView("goal");
    triggerHaptic("success");
    showToast("Your savings plan is ready.");
    // Check badges after goal creation
    const allGoals = await getAllGoals();
    checkAndAwardBadges({ goalsCount: allGoals.length });
  }

  async function handleCreateGoalFromCalculator(params: {
    name: string;
    targetAmount: number;
    category: string;
    targetDate: string;
    note?: string;
  }) {
    const newGoal: Goal = {
      id: uid(),
      name: params.name,
      type: params.category.toLowerCase().includes("emergency") ? "emergency" : "purchase",
      category: params.category,
      targetAmount: params.targetAmount,
      currentAmount: 0,
      startDate: dateInput(),
      targetDate: params.targetDate,
      priority: "high",
      note: params.note,
      status: "active",
      celebratedMilestones: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await handleCreateGoal(newGoal);
  }

  async function handleTransaction(
    goalId: string,
    type: "deposit" | "withdrawal",
    amount: number,
    note: string
  ) {
    try {
      const targetGoal = goals.find(g => g.id === goalId);
      if (!targetGoal) return;

      const prevAmount = targetGoal.currentAmount;
      const targetAmount = targetGoal.targetAmount;

      const { transaction, updatedGoal } = await addTransactionAndUpdateGoal({
        goalId,
        type,
        amount,
        note
      });

      await refreshData();

      const newAmount = updatedGoal.currentAmount;
      const prevPct = targetAmount > 0 ? (prevAmount / targetAmount) * 100 : 0;
      const newPct = targetAmount > 0 ? (newAmount / targetAmount) * 100 : 0;

      if (type === "deposit") {
        // Update streak for deposit
        const today = dateInput();
        const newStreak = updateStreak(today);
        setStreak(newStreak);
        triggerHaptic("light");
        const roundedPct = Math.min(100, Math.round(newPct));

        // Check gamification badges
        const allTx = await getAllTransactions();
        const depositTxCount = allTx.filter(t => t.type === "deposit").length;
        const allGoals = await getAllGoals();
        const completedCount = allGoals.filter(g => g.status === "completed").length;
        checkAndAwardBadges({
          depositCount: depositTxCount,
          newStreak,
          completedCount,
          pct: Math.round(newPct)
        });

        // 1. Check 100% Goal Completion Celebration
        if (newAmount >= targetAmount && !targetGoal.celebratedMilestones?.includes(100)) {
          triggerHaptic("success");
          const celebrated = [...(targetGoal.celebratedMilestones || []), 100];
          await saveGoal({ ...updatedGoal, celebratedMilestones: celebrated });
          await refreshData();
          setCompletedGoalForCelebration(updatedGoal);
          return;
        }

        // 2. Check Milestones (25%, 50%, 75%)
        const milestones = [
          { pct: 25, msg: "Nice start — you're 25% there." },
          { pct: 50, msg: "Halfway there." },
          { pct: 75, msg: "You're getting close." }
        ];

        let milestoneMessage = "";
        const celebratedList = [...(targetGoal.celebratedMilestones || [])];

        for (const m of milestones) {
          if (prevPct < m.pct && newPct >= m.pct && !celebratedList.includes(m.pct)) {
            milestoneMessage = m.msg;
            celebratedList.push(m.pct);
          }
        }

        if (milestoneMessage) {
          triggerHaptic("success");
          await saveGoal({ ...updatedGoal, celebratedMilestones: celebratedList });
          await refreshData();
          showToast(`+ ${formatINR(amount)} added. ${milestoneMessage}`);
        } else {
          showToast(`+ ${formatINR(amount)} added. You're now ${roundedPct}% toward your goal.`);
        }
      } else {
        // Withdrawal feedback (never celebrates)
        showToast(`${formatINR(amount)} withdrawn. Balance, pace, and projected completion updated.`, "info");
      }
    } catch (err: any) {
      showToast(err?.message || "Transaction failed", "error");
    }
  }

  // Reversible Goal Archive
  async function handleArchiveGoal(goal: Goal) {
    const prevStatus = goal.status;
    const updated = { ...goal, status: "archived" as GoalStatus };
    await saveGoal(updated);
    await refreshData();
    setView("dashboard");
    setSelectedGoalId(null);

    // Provide Undo window
    showToast(`"${goal.name}" archived.`, "info", {
      label: "Undo",
      onAction: async () => {
        await saveGoal({ ...goal, status: prevStatus });
        await refreshData();
        showToast(`"${goal.name}" restored.`, "success");
      }
    });
  }

  // Confirmation Modal Delete Goal
  function requestDeleteGoal(goalId: string, goalName: string) {
    setConfirmDialog({
      title: `Delete "${goalName}"?`,
      message: "This will permanently remove this goal and all of its local transaction records from your device.",
      confirmLabel: "Delete Goal",
      isDestructive: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        await deleteGoal(goalId);
        await refreshData();
        setView("dashboard");
        setSelectedGoalId(null);
        showToast("Goal permanently removed.", "info");
      }
    });
  }

  // Confirmation Modal Reset Database
  function requestResetDatabase() {
    setConfirmDialog({
      title: "Reset Local Vault?",
      message: "This will permanently delete all goals, transactions, and custom settings from this browser's IndexedDB. This cannot be undone.",
      confirmLabel: "Reset All Data",
      isDestructive: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        await resetDatabase();
        await refreshData();
        setView("dashboard");
        setSelectedGoalId(null);
        showToast("All local data has been erased.", "info");
      }
    });
  }

  // Backup & CSV Actions
  async function handleExportJSON() {
    const backup = await exportFullBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nestsave-backup-${dateInput()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup exported successfully.");
  }

  function handleExportGoalsCSV() {
    if (goals.length === 0) {
      showToast("No goals available to export.", "info");
      return;
    }
    const csv = exportGoalsToCSV(goals);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nestsave-goals-${dateInput()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Goals CSV exported.");
  }

  function handleExportTransactionsCSV(forGoalId?: string) {
    const txList = forGoalId ? transactions.filter(t => t.goalId === forGoalId) : transactions;
    if (txList.length === 0) {
      showToast("No transactions recorded yet to export.", "info");
      return;
    }
    const goalMap = goals.reduce((m, g) => ({ ...m, [g.id]: g.name }), {} as Record<string, string>);
    const csv = exportTransactionsToCSV(txList, goalMap);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nestsave-transactions-${dateInput()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Transactions CSV exported.");
  }

  async function handleImportJSON(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      const result = await importFullBackup(String(reader.result));
      if (result.success) {
        await refreshData();
        showToast("Backup imported successfully.");
      } else {
        showToast(result.error || "Failed to import backup.", "error");
      }
    };
    reader.readAsText(file);
  }

  // Expense & Budget handlers
  async function handleAddExpense(expense: Expense) {
    await saveExpense(expense);
    await refreshData();
  }

  async function handleDeleteExpense(id: string) {
    await deleteExpense(id);
    await refreshData();
    showToast("Expense deleted.", "info");
  }

  async function handleSaveBudget(budget: Budget) {
    await saveBudget(budget);
    await refreshData();
    showToast("Budget saved.");
  }

  async function handleDeleteBudget(id: string) {
    await deleteBudget(id);
    await refreshData();
    showToast("Budget removed.", "info");
  }

  // Salary Day Batch Deposit handler
  async function handleBatchDeposit(allocations: Array<{ goalId: string; amount: number }>) {
    try {
      let total = 0;
      for (const item of allocations) {
        if (item.amount > 0) {
          total += item.amount;
          await addTransactionAndUpdateGoal({
            goalId: item.goalId,
            type: "deposit",
            amount: item.amount,
            note: "Salary Day Batch Allocation",
            date: dateInput()
          });
        }
      }

      await refreshData();
      const today = dateInput();
      const newStreak = updateStreak(today);
      setStreak(newStreak);
      triggerHaptic("success");

      const allTx = await getAllTransactions();
      const depositTxCount = allTx.filter(t => t.type === "deposit").length;
      const allGoals = await getAllGoals();
      const completedCount = allGoals.filter(g => g.status === "completed").length;
      checkAndAwardBadges({
        depositCount: depositTxCount,
        newStreak,
        completedCount
      });

      showToast(`Salary Day: ${formatINR(total)} allocated across ${allocations.length} goals!`);
    } catch (err: any) {
      showToast(err?.message || "Batch deposit failed", "error");
    }
  }

  // Behind-Schedule Recalibration handler
  async function handleRecalibrateGoal(updatedGoal: Goal) {
    await saveGoal(updatedGoal);
    await refreshData();
    showToast(`Plan for "${updatedGoal.name}" recalibrated!`);
  }

  // App Lock PIN Handlers
  async function handleSetAppPin(pin: string) {
    const { hash, salt } = await hashPin(pin);
    const newSettings: AppSettings = {
      ...settings,
      appLockEnabled: true,
      pinHash: hash,
      pinSalt: salt
    };
    await saveSettings(newSettings);
    setSettings(newSettings);
    showToast("4-Digit PIN Lock is now active.");
  }

  async function handleRemoveAppPin() {
    const newSettings: AppSettings = {
      ...settings,
      appLockEnabled: false,
      pinHash: undefined,
      pinSalt: undefined
    };
    await saveSettings(newSettings);
    setSettings(newSettings);
    showToast("PIN Lock disabled.", "info");
  }

  // Decrypted Vault Restore handler
  async function handleImportDecryptedBackup(json: string) {
    const result = await importFullBackup(json);
    if (result.success) {
      await refreshData();
      showToast("Encrypted vault successfully decrypted and restored.");
    } else {
      showToast(result.error || "Failed to restore backup.", "error");
    }
  }

  async function handleOpenEncryptedExport() {
    const backup = await exportFullBackup();
    setRawBackupJson(JSON.stringify(backup, null, 2));
    setEncryptedModalMode("export");
  }

  // Total deposited across all transactions
  const totalDeposited = useMemo(() => {
    return transactions.filter(t => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  // Savings Rate %: deposited this month / monthly income
  const savingsRate = useMemo(() => {
    if (!settings.monthlyIncome || settings.monthlyIncome <= 0) return null;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthDeposits = transactions
      .filter(t => t.type === "deposit" && t.date.startsWith(currentMonth))
      .reduce((s, t) => s + t.amount, 0);
    return Math.min(100, Math.round((thisMonthDeposits / settings.monthlyIncome) * 100));
  }, [transactions, settings.monthlyIncome]);

  // Goals behind schedule
  const behindGoals = useMemo(() => {
    return goals.filter(g => {
      if (g.status !== "active") return false;
      const pace = aheadBehindSchedule(g.targetAmount, g.currentAmount, g.startDate, g.targetDate);
      return pace.status === "behind";
    });
  }, [goals]);

  // Handle Push Notification enable
  async function handleEnableNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Browser notifications are not supported on this browser.", "error");
      return;
    }
    if (Notification.permission === "granted") {
      try {
        new Notification("NestSave Reminder", {
          body: "Keep your savings momentum going! Track your progress today.",
          icon: "/icon.svg"
        });
      } catch {}
      const newSettings = { ...settings, pushNotificationsEnabled: true, notificationsEnabled: true };
      await saveSettings(newSettings);
      setSettings(newSettings);
      showToast("Notification reminder sent! Reminders are active.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const newSettings = { ...settings, pushNotificationsEnabled: true, notificationsEnabled: true };
      await saveSettings(newSettings);
      setSettings(newSettings);
      try {
        new Notification("NestSave Reminder Active", {
          body: "Push reminders enabled! You'll stay accountable to your savings goals.",
          icon: "/icon.svg"
        });
      } catch {}
      showToast("Browser notifications enabled! You'll get saving reminders.");
    } else {
      showToast("Notification permission denied. Enable it in browser settings.", "warning");
    }
  }

  // Handle Web Share
  async function handleShareGoal(goal: Goal) {
    const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
    const text = `💰 I'm saving for "${goal.name}" on NestSave!\n` +
      `Progress: ${formatINR(goal.currentAmount)} / ${formatINR(goal.targetAmount)} (${pct}%)\n` +
      `Target date: ${new Date(goal.targetDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}\n` +
      `Track your savings locally at NestSave — zero cloud, 100% private.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `NestSave — ${goal.name}`, text });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast("Goal progress copied to clipboard!");
      } catch {
        showToast("Sharing not supported on this browser.", "warning");
      }
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-white dark:bg-[#000000]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0d684c] border-t-transparent" />
          <p className="text-xs font-semibold text-zinc-500">Accessing private device storage…</p>
        </div>
      </div>
    );
  }

  // Bottom Nav tab definition
  const mainTabs = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "expenses", label: "Expenses", icon: TrendingDown },
    { id: "gamification", label: "Badges", icon: Trophy },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const isMainView = ["dashboard", "analytics", "expenses", "gamification", "settings"].includes(view);

  return (
    <div className={`min-h-screen transition-colors duration-150 ${isDark ? "dark bg-[#000000] text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      {/* Offline Status Warning Pill */}
      {!isOnline && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-center text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
          <WifiOff size={14} />
          <span>Offline Mode Active • Your financial vault is running 100% locally on this device.</span>
        </div>
      )}

      {/* Android Native App Promotion Banner on Mobile */}
      {showAndroidBanner && (
        <div className="border-b border-emerald-500/20 bg-emerald-950/40 text-emerald-300 px-4 py-2 text-xs font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="truncate">
              Using Android? Download our <strong>100% offline app</strong> with biometric lock.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="/download"
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold transition whitespace-nowrap"
            >
              Get APK
            </a>
            <button
              onClick={() => {
                setShowAndroidBanner(false);
                if (typeof window !== "undefined") {
                  localStorage.setItem("nestsave_dismiss_android_banner", "true");
                }
              }}
              className="text-zinc-400 hover:text-white p-1"
              aria-label="Dismiss banner"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main App Header — compact on mobile */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/90 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-[#000000]/95 pwa-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => { setView("dashboard"); setSelectedGoalId(null); }}
            className="flex items-center gap-2.5 text-left focus-visible:rounded-lg"
          >
            <NestSaveLogo size={34} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight">NestSave</span>
                {streak.currentStreak >= 3 && (
                  <span className="rounded-full bg-orange-100 dark:bg-orange-950/40 px-1.5 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                    🔥 {streak.currentStreak}d
                  </span>
                )}
              </div>
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Zero Cloud Savings Planner
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* Streak indicator on mobile */}
            {streak.currentStreak >= 1 && (
              <button
                onClick={() => setView("gamification")}
                className="flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 px-2.5 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 sm:hidden"
              >
                <Flame size={12} />
                {streak.currentStreak}
              </button>
            )}

            {/* Calculators button */}
            <button
              onClick={() => { setView("calculators"); setSelectedGoalId(null); }}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-2 text-xs font-semibold transition ${
                view === "calculators"
                  ? "border-[#0d684c] bg-emerald-50 text-[#0d684c] dark:border-emerald-500 dark:bg-[#18181b] dark:text-emerald-300"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-300 dark:hover:bg-[#202024]"
              }`}
              title="Financial Calculators (EMI vs Cash, SIP, Emergency Fund)"
            >
              <Calculator size={15} />
              <span className="hidden sm:inline">Calculators</span>
            </button>

            {/* AI button — desktop only in header, mobile via bottom nav */}
            <button
              onClick={() => setView("ai")}
              className={`hidden sm:flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                view === "ai"
                  ? "border-[#0d684c] bg-emerald-50 text-[#0d684c] dark:border-emerald-500 dark:bg-[#18181b] dark:text-emerald-300"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-300 dark:hover:bg-[#202024]"
              }`}
              title="Local Financial Assistant"
            >
              <Bot size={15} />
              <span>AI</span>
            </button>

            {/* Download Native Android App */}
            <a
              href="/download"
              className="flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-600/10 px-2.5 sm:px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-600/20 transition"
              title="Download Native Android APK"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Get APK</span>
            </a>

            {/* Install PWA button */}
            {!isStandalone && (
              <button
                onClick={triggerInstallApp}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#0d684c]/40 bg-emerald-50 px-2.5 py-2 text-xs font-semibold text-[#0d684c] hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition"
                title="Install NestSave App to Phone or Desktop"
              >
                <Smartphone size={15} />
                <span>Install</span>
              </button>
            )}

            {/* Salary Day Batch Allocation */}
            <button
              onClick={() => setShowSalaryDayModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-300/50 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/30 px-2.5 sm:px-3 py-2 text-xs font-semibold text-[#0d684c] dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
              title="Salary Day Batch Allocator (1-Tap Deposit Across Active Goals)"
            >
              <Wallet size={15} />
              <span className="hidden md:inline">Salary Day</span>
            </button>

            {/* Printable PDF Statement & Certificates */}
            <button
              onClick={() => setShowPrintStatement(true)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-2.5 sm:px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-300 dark:hover:bg-[#202024] transition"
              title="Print Financial Statement & Completion Certificates"
            >
              <Printer size={15} />
              <span className="hidden lg:inline">Statement</span>
            </button>

            {/* Lock Vault Button */}
            {settings.appLockEnabled && (
              <button
                onClick={() => setIsUnlocked(false)}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-2.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-300 dark:hover:bg-[#202024] transition"
                title="Lock Local Vault"
              >
                <Lock size={15} className="text-zinc-600 dark:text-zinc-300" />
              </button>
            )}

            {/* Create Goal button */}
            <button
              onClick={() => setShowCreateWizard(true)}
              className="btn-primary !py-2 text-xs font-bold"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Create Goal</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 pb-28">
        {/* VIEW 1: DASHBOARD */}
        {view === "dashboard" && (
          <>
            {goals.length === 0 ? (
              <CleanEmptyDashboard
                onCreate={() => setShowCreateWizard(true)}
                onOpenCalculators={() => setView("calculators")}
              />
            ) : (
              <div className="space-y-6">
                {/* Conflict Detection Warning Banner */}
                {conflictReport.hasConflict && (
                  <div className="finance-card border-amber-300 bg-amber-50/70 p-4 text-amber-900 dark:border-amber-800/60 dark:bg-[#18181b] dark:text-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div className="flex-1 text-xs">
                        <strong className="font-bold text-sm block mb-0.5">Savings Capacity Conflict Detected</strong>
                        <p className="leading-relaxed">
                          Your active goals require a total of <span className="font-bold">{formatINR(conflictReport.totalRequiredMonthly)}/month</span>, but your available capacity is <span className="font-bold">{formatINR(conflictReport.totalMonthlyCapacity)}/month</span>. Requirements currently exceed capacity by <span className="font-bold text-rose-600 dark:text-rose-400">{formatINR(conflictReport.deficit)}/month</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dashboard Metrics Grid */}
                <section className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                  <DashboardStatCard
                    label="Total Saved"
                    value={formatINR(dashboardTotals.saved)}
                    helper={`${dashboardTotals.overallPct}% of target reached`}
                    icon={<Wallet size={18} className="text-[#0d684c] dark:text-emerald-400" />}
                  />
                  <DashboardStatCard
                    label="Total Target"
                    value={formatINR(dashboardTotals.target)}
                    helper={`${formatINR(dashboardTotals.remaining)} remaining`}
                    icon={<Target size={18} className="text-zinc-500" />}
                  />
                  <DashboardStatCard
                    label="Savings Capacity"
                    value={availableMonthlyCapacity > 0 ? `${formatINR(availableMonthlyCapacity)}/mo` : "Not defined"}
                    helper={availableMonthlyCapacity > 0 ? "Discretionary surplus" : "Set in Settings"}
                    icon={<TrendingUp size={18} className="text-zinc-500" />}
                  />
                  <DashboardStatCard
                    label="Active Goals"
                    value={String(dashboardTotals.activeCount)}
                    helper={`${dashboardTotals.paceStats.ahead} ahead • ${dashboardTotals.paceStats.behind} behind`}
                    icon={<Clock size={18} className="text-zinc-500" />}
                  />
                  <DashboardStatCard
                    label="Savings Rate"
                    value={savingsRate !== null ? `${savingsRate}%` : "—"}
                    helper={savingsRate !== null ? `of ₹${(settings.monthlyIncome || 0).toLocaleString("en-IN")} income` : "Set income in Settings"}
                    icon={<Percent size={18} className={savingsRate !== null && savingsRate >= 20 ? "text-[#0d684c] dark:text-emerald-400" : "text-zinc-500"} />}
                    highlight={savingsRate !== null && savingsRate >= 20}
                  />
                </section>

                {/* Behind-Schedule Alert Banner */}
                {behindGoals.length > 0 && (
                  <div className="finance-card border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                          {behindGoals.length} goal{behindGoals.length > 1 ? "s are" : " is"} behind schedule
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {behindGoals.map(g => {
                            const reqM = requiredMonthly(g.targetAmount, g.currentAmount, g.targetDate);
                            return (
                              <div key={g.id} className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-[#18181b] border border-rose-200 dark:border-rose-900/60 px-2.5 py-1 text-xs shadow-sm">
                                <span className="font-bold text-rose-800 dark:text-rose-300">
                                  {g.name}
                                </span>
                                <span className="text-[11px] text-zinc-500">
                                  needs {formatINR(reqM)}/mo
                                </span>
                                <button
                                  onClick={() => setRecalibratingGoal(g)}
                                  className="inline-flex items-center gap-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 text-[10px] font-extrabold transition shadow-sm"
                                  title="Recalibrate monthly contribution or target deadline"
                                >
                                  <RefreshCw size={10} />
                                  <span>Recalibrate</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(["all", "active", "completed", "paused"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
                          statusFilter === tab
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                            : "border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#121212] dark:text-zinc-400"
                        }`}
                      >
                        {tab === "all" ? `All (${goals.length})` : `${tab} (${goals.filter(g => g.status === tab).length})`}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-56">
                      <input
                        type="text"
                        placeholder="Search goals..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="input !py-1.5 !text-xs pl-8"
                      />
                      <SlidersHorizontal size={13} className="absolute left-2.5 top-2.5 text-zinc-400" />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="input !py-1.5 !w-auto text-xs font-semibold cursor-pointer"
                    >
                      <option value="targetDate">Sort: Target Date</option>
                      <option value="progress">Sort: Progress %</option>
                      <option value="targetAmount">Sort: Target Amount</option>
                    </select>

                    <button
                      onClick={() => { setView("calculators"); setSelectedGoalId(null); }}
                      className="btn-secondary !py-1.5 text-xs font-semibold"
                      title="Financial Calculators (EMI vs Cash, SIP, Emergency Buffer)"
                    >
                      <Calculator size={14} />
                      <span className="hidden sm:inline">Calculators</span>
                    </button>

                    <button
                      onClick={handleExportGoalsCSV}
                      className="btn-secondary !py-1.5 text-xs font-semibold"
                      title="Export Goals to CSV"
                    >
                      <FileSpreadsheet size={14} />
                      <span className="hidden sm:inline">CSV</span>
                    </button>
                  </div>
                </div>

                {/* Goals List & Allocation Panel */}
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                  <div className="space-y-3">
                    {filteredGoals.length === 0 ? (
                      <div className="finance-card p-10 text-center text-xs text-zinc-500">
                        No goals found matching the selected filter.
                      </div>
                    ) : (
                      filteredGoals.map(goal => (
                        <GoalItemCard
                          key={goal.id}
                          goal={goal}
                          onSelect={() => {
                            setSelectedGoalId(goal.id);
                            setView("goal");
                          }}
                          onQuickDeposit={amt => handleTransaction(goal.id, "deposit", amt, "Quick deposit")}
                          onShare={() => handleShareGoal(goal)}
                          onRecalibrate={g => setRecalibratingGoal(g)}
                        />
                      ))
                    )}
                  </div>

                  {/* Priority Allocation Sidebar */}
                  <div className="space-y-4">
                    <div className="finance-card p-5">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="font-bold text-sm">Priority Allocation</h3>
                        <span className="text-[11px] font-semibold text-zinc-500">Weighted Split</span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Proportional distribution of your available monthly savings capacity across active goals.
                      </p>

                      {priorityAllocations.length === 0 ? (
                        <p className="mt-4 rounded-xl bg-zinc-50 dark:bg-[#18181b] p-3 text-xs text-zinc-500 text-center">
                          {availableMonthlyCapacity <= 0
                            ? "Configure monthly cash flow in Settings to view priority split."
                            : "No active goals requiring contributions."}
                        </p>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {priorityAllocations.map(a => (
                            <div key={a.goalId} className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#18181b] p-2.5">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="truncate pr-2">{a.goalName}</span>
                                <span className="font-bold text-[#0d684c] dark:text-emerald-400">
                                  {formatINR(a.suggestedMonthlyAllocation)}/mo
                                </span>
                              </div>
                              <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400">
                                <span className="capitalize">{a.priority} Priority</span>
                                <span>{a.sharePercent}% of capacity</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Real Transactions Activity Card */}
                    <div className="finance-card p-5">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="font-bold text-sm">Recent Transactions</h3>
                        <span className="text-xs text-zinc-500">{transactions.length} total</span>
                      </div>
                      {transactions.length === 0 ? (
                        <p className="mt-3 text-xs text-zinc-400 text-center py-4">
                          No transactions recorded yet.
                        </p>
                      ) : (
                        <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                          {transactions.slice(0, 4).map(t => {
                            const goal = goals.find(g => g.id === t.goalId);
                            return (
                              <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">
                                    {goal?.name || "Savings Goal"}
                                  </p>
                                  <p className="text-[10px] text-zinc-400">{t.date}</p>
                                </div>
                                <span className={`font-bold ${t.type === "deposit" ? "text-[#0d684c] dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                  {t.type === "deposit" ? "+" : "−"}{formatINR(t.amount)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* VIEW 2: GOAL DETAIL PAGE */}
        {view === "goal" && selectedGoal && (
          <GoalDetailPage
            goal={selectedGoal}
            transactions={selectedGoalTransactions}
            capacity={availableMonthlyCapacity}
            onBack={() => { setView("dashboard"); setSelectedGoalId(null); }}
            onTransaction={handleTransaction}
            onRecalibrate={g => setRecalibratingGoal(g)}
            onStatusChange={async (goal, status) => {
              if (status === "archived") {
                await handleArchiveGoal(goal);
              } else {
                await saveGoal({ ...goal, status });
                await refreshData();
                showToast(`Goal status updated to ${status}.`);
              }
            }}
            onDelete={goalId => requestDeleteGoal(goalId, selectedGoal.name)}
            onExportCSV={() => handleExportTransactionsCSV(selectedGoal.id)}
            onSaveEdit={async (updatedGoal) => {
              await saveGoal(updatedGoal);
              await refreshData();
              showToast("Goal updated successfully.");
            }}
          />
        )}

        {/* VIEW 3: SETTINGS & PRIVACY */}
        {view === "settings" && (
          <SettingsView
            settings={settings}
            onSaveSettings={async (newSettings) => {
              setSettings(newSettings);
              const isDark =
                newSettings.theme === "dark" ||
                (newSettings.theme === "system" &&
                  typeof window !== "undefined" &&
                  window.matchMedia("(prefers-color-scheme: dark)").matches);
              if (isDark) {
                document.documentElement.classList.add("dark");
                document.body.classList.add("dark");
              } else {
                document.documentElement.classList.remove("dark");
                document.body.classList.remove("dark");
              }
              await saveSettings(newSettings);
              showToast("Preferences saved.");
            }}
            onBack={() => setView("dashboard")}
            onExportJSON={handleExportJSON}
            onExportCSV={handleExportGoalsCSV}
            onImportJSON={handleImportJSON}
            onResetAll={requestResetDatabase}
            isStandalone={isStandalone}
            onTriggerInstall={triggerInstallApp}
            onEnableNotifications={handleEnableNotifications}
            onSetPin={handleSetAppPin}
            onRemovePin={handleRemoveAppPin}
            onExportEncrypted={handleOpenEncryptedExport}
            onImportEncrypted={() => setEncryptedModalMode("import")}
          />
        )}

        {/* VIEW 4: LOCAL AI ASSISTANT */}
        {view === "ai" && (
          <LocalAIAssistantView
            goals={goals}
            settings={settings}
            onBack={() => setView("dashboard")}
            onSaveSettings={async (newSettings) => {
              await saveSettings(newSettings);
              setSettings(newSettings);
            }}
          />
        )}

        {/* VIEW 5: ANALYTICS & CHARTS */}
        {view === "analytics" && (
          <AnalyticsView
            goals={goals}
            transactions={transactions}
            settings={settings}
            onBack={() => setView("dashboard")}
            onNavigateGoal={(goalId) => {
              setSelectedGoalId(goalId);
              setView("goal");
            }}
            onOpenSettings={() => setView("settings")}
          />
        )}

        {/* VIEW 6: EXPENSE TRACKER */}
        {view === "expenses" && (
          <ExpenseTrackerView
            expenses={expenses}
            budgets={budgets}
            onBack={() => setView("dashboard")}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {/* VIEW 7: GAMIFICATION & BADGES */}
        {view === "gamification" && (
          <GamificationView
            badges={badges}
            streak={streak}
            goals={goals}
            totalDeposited={totalDeposited}
            onBack={() => setView("dashboard")}
            onStartChallenge={(ch) =>
              handleCreateGoalFromCalculator({
                ...ch,
                category: "Personal"
              })
            }
          />
        )}

        {/* VIEW 8: FINANCIAL CALCULATORS */}
        {view === "calculators" && (
          <CalculatorsView
            settings={settings}
            onBack={() => setView("dashboard")}
            onCreateGoalFromCalculator={handleCreateGoalFromCalculator}
          />
        )}
      </main>

      {/* ========== BOTTOM NAVIGATION BAR ========== */}
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        {mainTabs.map(({ id, label, icon: Icon }) => {
          const isActive = view === id || (id === "dashboard" && view === "goal") || (id === "dashboard" && view === "ai") || (id === "dashboard" && view === "calculators");
          return (
            <button
              key={id}
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
              onClick={() => {
                if (id === "dashboard") {
                  setView("dashboard");
                  setSelectedGoalId(null);
                } else {
                  setView(id as any);
                }
              }}
              aria-label={label}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* 5-Step Goal Creation Wizard Modal */}
      {showCreateWizard && (
        <MultiStepGoalCreationWizard
          availableCapacity={availableMonthlyCapacity}
          onClose={() => setShowCreateWizard(false)}
          onCreate={handleCreateGoal}
        />
      )}

      {/* Dedicated Goal Completion Celebration Modal (100%) */}
      {completedGoalForCelebration && (
        <GoalCompletionModal
          goal={completedGoalForCelebration}
          onViewGoal={() => {
            setSelectedGoalId(completedGoalForCelebration.id);
            setView("goal");
            setCompletedGoalForCelebration(null);
          }}
          onBackToDashboard={() => {
            setView("dashboard");
            setSelectedGoalId(null);
            setCompletedGoalForCelebration(null);
          }}
        />
      )}

      {/* In-App Confirmation Modal */}
      {confirmDialog && (
        <ConfirmationModal
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          isDestructive={confirmDialog.isDestructive}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Reusable Toast with Undo — positioned above bottom nav */}
      {toast && (
        <div className="fixed bottom-24 left-4 right-4 sm:bottom-5 sm:left-auto sm:right-5 sm:w-auto z-50 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-semibold text-zinc-900 shadow-xl dark:border-zinc-800 dark:bg-[#121212] dark:text-zinc-100 animate-in fade-in duration-150">
          {toast.type === "error" ? (
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
          ) : toast.type === "warning" ? (
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-[#0d684c] dark:text-emerald-400 shrink-0" />
          )}

          <span className="flex-1">{toast.message}</span>

          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onAction();
                setToast(null);
              }}
              className="ml-2 inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-800 hover:bg-zinc-200 dark:bg-[#18181b] dark:text-zinc-200 dark:hover:bg-[#202024]"
            >
              <Undo2 size={12} />
              <span>{toast.action.label}</span>
            </button>
          )}

          <button
            onClick={() => setToast(null)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* New Badge Toast notification */}
      {newBadgeToast && (
        <div className="fixed bottom-24 left-4 right-4 sm:bottom-20 sm:left-auto sm:right-5 sm:w-80 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-white dark:bg-[#121212] px-4 py-3.5 shadow-2xl">
            <span className="text-3xl shrink-0">{newBadgeToast.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Badge Unlocked!</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">{newBadgeToast.name}</p>
              <p className="text-[11px] text-zinc-400 truncate">{newBadgeToast.description}</p>
            </div>
            <button onClick={() => setNewBadgeToast(null)} className="text-zinc-300 hover:text-zinc-500 dark:text-zinc-600">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 1-Tap Salary Day Batch Modal */}
      {showSalaryDayModal && (
        <SalaryDayBatchModal
          goals={goals}
          onClose={() => setShowSalaryDayModal(false)}
          onConfirmBatchDeposit={handleBatchDeposit}
        />
      )}

      {/* Recalibrate Behind-Schedule Goal Modal */}
      {recalibratingGoal && (
        <RecalibratePlanModal
          goal={recalibratingGoal}
          onClose={() => setRecalibratingGoal(null)}
          onSaveUpdatedGoal={handleRecalibrateGoal}
        />
      )}

      {/* Printable Statement & Certificates Modal */}
      {showPrintStatement && (
        <PrintStatementModal
          goals={goals}
          transactions={transactions}
          settings={settings}
          streak={streak}
          badges={badges}
          onClose={() => setShowPrintStatement(false)}
        />
      )}

      {/* Encrypted Vault Export/Import Modal */}
      {encryptedModalMode && (
        <EncryptedVaultModal
          mode={encryptedModalMode}
          rawBackupJson={rawBackupJson}
          onImportDecrypted={handleImportDecryptedBackup}
          onClose={() => setEncryptedModalMode(null)}
        />
      )}

      {/* 4-Digit Local PIN Lock Modal */}
      {ready && settings.appLockEnabled && settings.pinHash && settings.pinSalt && !isUnlocked && (
        <AppLockModal
          pinHash={settings.pinHash}
          pinSalt={settings.pinSalt}
          onUnlock={() => setIsUnlocked(true)}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// CLEAN EMPTY DASHBOARD (USER'S ICON + NO FAKE DATA)
// -------------------------------------------------------------
function CleanEmptyDashboard({
  onCreate,
  onOpenCalculators
}: {
  onCreate: () => void;
  onOpenCalculators?: () => void;
}) {
  return (
    <div className="finance-card mx-auto max-w-2xl px-6 py-16 text-center sm:py-24">
      {/* Official Squircle Target Logo */}
      <div className="mx-auto mb-4 flex items-center justify-center">
        <NestSaveLogo size={56} />
      </div>

      <h2 className="text-2xl font-bold tracking-tight">Your savings journey starts here.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        Create your first goal and build a plan around what matters to you.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button onClick={onCreate} className="btn-primary text-sm font-bold">
          <Plus size={16} />
          <span>Create your first goal</span>
        </button>
        {onOpenCalculators && (
          <button onClick={onOpenCalculators} className="btn-secondary text-sm font-semibold">
            <Calculator size={16} />
            <span>Try Financial Calculators</span>
          </button>
        )}
      </div>

      <div className="mt-12 grid gap-3 text-left sm:grid-cols-3 pt-8 border-t border-zinc-100 dark:border-zinc-800">
        <div className="rounded-xl bg-zinc-50 dark:bg-[#18181b] p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d684c] dark:text-emerald-400">1. Specific Goal</span>
          <p className="mt-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">Real Purpose</p>
          <p className="mt-0.5 text-[11px] text-zinc-500 leading-relaxed">Define targets for tech, vehicles, emergencies, or personal milestones.</p>
        </div>
        <div className="rounded-xl bg-zinc-50 dark:bg-[#18181b] p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d684c] dark:text-emerald-400">2. Deterministic Math</span>
          <p className="mt-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">Daily & Monthly Pace</p>
          <p className="mt-0.5 text-[11px] text-zinc-500 leading-relaxed">Exact burn-rate calculations without guesswork or fake metrics.</p>
        </div>
        <div className="rounded-xl bg-zinc-50 dark:bg-[#18181b] p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d684c] dark:text-emerald-400">3. Local Sovereignty</span>
          <p className="mt-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">Zero Cloud Data</p>
          <p className="mt-0.5 text-[11px] text-zinc-500 leading-relaxed">Your income and contributions remain sandboxed in your browser.</p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DASHBOARD STAT CARD
// -------------------------------------------------------------
function DashboardStatCard({
  label, value, helper, icon, highlight
}: {
  label: string; value: string; helper: string; icon: React.ReactNode; highlight?: boolean;
}) {
  return (
    <div className={`finance-card p-4 sm:p-5 ${highlight ? "border-emerald-200 dark:border-emerald-900/40" : ""}`}>
      <div className="flex items-center justify-between text-zinc-400">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</span>
        {icon}
      </div>
      <p className={`mt-2 text-xl sm:text-2xl font-extrabold tracking-tight ${highlight ? "text-[#0d684c] dark:text-emerald-400" : "text-zinc-900 dark:text-white"}`}>{value}</p>
      <p className="mt-1 text-xs text-zinc-500 truncate">{helper}</p>
    </div>
  );
}

// -------------------------------------------------------------
// GOAL ITEM CARD
// -------------------------------------------------------------
function GoalItemCard({
  goal, onSelect, onQuickDeposit, onShare, onRecalibrate
}: {
  goal: Goal;
  onSelect: () => void;
  onQuickDeposit: (amt: number) => void;
  onShare: () => void;
  onRecalibrate?: (goal: Goal) => void;
}) {
  const pct = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    : 0;

  const daysLeft = daysRemaining(goal.targetDate);
  const reqMonth = requiredMonthly(goal.targetAmount, goal.currentAmount, goal.targetDate);
  const pace = aheadBehindSchedule(goal.targetAmount, goal.currentAmount, goal.startDate, goal.targetDate);

  const priorityStyles: Record<Priority, string> = {
    critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
    high: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    medium: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
    low: "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-[#18181b] dark:text-zinc-400 dark:border-zinc-800"
  };

  return (
    <div className="finance-card p-4 sm:p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer" onClick={onSelect}>
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-[#18181b] dark:text-zinc-200">
            <GoalCategoryIcon icon={goal.icon} category={goal.category} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                {goal.name}
              </h4>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${priorityStyles[goal.priority]}`}>
                {goal.priority}
              </span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-[#18181b] dark:text-zinc-400 capitalize">
                {goal.category}
              </span>
              {goal.status === "active" && (
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                  pace.status === "ahead"
                    ? "bg-emerald-50 text-[#0d684c] border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900"
                    : pace.status === "behind"
                    ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-[#18181b] dark:text-zinc-400 dark:border-zinc-800"
                }`}>
                  {pace.label}
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-zinc-500">
              <span>{daysLeft === 0 ? "Target date reached" : `${daysLeft} days remaining`}</span>
              <span>•</span>
              <span>{formatINR(reqMonth)}/mo needed</span>
              {goal.recurringContribution && (
                <>
                  <span>•</span>
                  <span>{formatINR(goal.recurringContribution)}/{goal.recurringFrequency || "mo"}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-base font-extrabold text-zinc-900 dark:text-white">
            {formatINR(goal.currentAmount)}
          </p>
          <p className="text-xs text-zinc-400">
            of {formatINR(goal.targetAmount)} ({pct}%)
          </p>
        </div>
      </div>

      {/* Progress Bar with smooth CSS transition */}
      <div className="mt-3.5 cursor-pointer" onClick={onSelect}>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-[#18181b]">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${
              pct >= 100 ? "bg-emerald-500" : pace.status === "behind" ? "bg-rose-500 dark:bg-rose-500" : "bg-[#0d684c] dark:bg-emerald-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="mt-3.5 flex items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        {/* Quick deposits */}
        {goal.status === "active" && goal.currentAmount < goal.targetAmount ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-zinc-400 shrink-0">Quick:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {[500, 1000, 5000].map(amt => (
                <button
                  key={amt}
                  onClick={() => onQuickDeposit(amt)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-300 dark:hover:bg-[#242428]"
                >
                  +{formatINR(amt)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Recalibrate button if behind */}
          {goal.status === "active" && pace.status === "behind" && onRecalibrate && (
            <button
              onClick={e => { e.stopPropagation(); onRecalibrate(goal); }}
              className="flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 px-2.5 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 transition"
              title="Recalibrate this goal's pace or deadline"
            >
              <RefreshCw size={12} />
              <span>Recalibrate</span>
            </button>
          )}
          {/* Share button */}
          <button
            onClick={e => { e.stopPropagation(); onShare(); }}
            className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 px-2 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-[#18181b] transition"
            title="Share goal progress"
          >
            <Share size={12} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GOAL DETAIL PAGE
// -------------------------------------------------------------
function GoalDetailPage({
  goal, transactions, capacity, onBack, onTransaction, onStatusChange, onDelete, onExportCSV, onSaveEdit, onRecalibrate
}: {
  goal: Goal;
  transactions: Transaction[];
  capacity: number;
  onBack: () => void;
  onTransaction: (goalId: string, type: "deposit" | "withdrawal", amount: number, note: string) => Promise<void>;
  onStatusChange: (goal: Goal, status: GoalStatus) => Promise<void>;
  onDelete: (goalId: string) => void;
  onExportCSV: () => void;
  onSaveEdit: (goal: Goal) => Promise<void>;
  onRecalibrate?: (goal: Goal) => void;
}) {
  const [txType, setTxType] = useState<"deposit" | "withdrawal">("deposit");
  const [txAmount, setTxAmount] = useState("");
  const [txNote, setTxNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // What-if scenario state
  const [whatIfTarget, setWhatIfTarget] = useState(goal.targetAmount);
  const [whatIfDeadline, setWhatIfDeadline] = useState(goal.targetDate);

  const pct = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    : 0;

  const remaining = remainingAmount(goal.targetAmount, goal.currentAmount);
  const daysLeft = daysRemaining(goal.targetDate);
  const reqMonth = requiredMonthly(goal.targetAmount, goal.currentAmount, goal.targetDate);
  const reqWeek = requiredWeekly(goal.targetAmount, goal.currentAmount, goal.targetDate);
  const reqDay = requiredDaily(goal.targetAmount, goal.currentAmount, goal.targetDate);
  const pace = aheadBehindSchedule(goal.targetAmount, goal.currentAmount, goal.startDate, goal.targetDate);
  const projected = projectedCompletionDate(goal.targetAmount, goal.currentAmount, capacity > 0 ? capacity : reqMonth);

  const whatIfReqMonth = requiredMonthly(whatIfTarget, goal.currentAmount, whatIfDeadline);
  const whatIfDiff = whatIfReqMonth - reqMonth;

  async function handleRecordTransaction() {
    const amt = Number(txAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }
    if (txType === "withdrawal" && amt > goal.currentAmount) {
      alert("Withdrawal amount cannot exceed available goal savings.");
      return;
    }
    await onTransaction(goal.id, txType, amt, txNote);
    setTxAmount("");
    setTxNote("");
  }

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> All Goals
        </button>

        <div className="flex items-center gap-2">
          {goal.productUrl && (
            <a
              href={goal.productUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary !py-1.5 text-xs"
            >
              <ExternalLink size={14} /> Open Product ↗
            </a>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary !py-1.5 text-xs"
          >
            Edit Goal
          </button>
        </div>
      </div>

      {/* Main Goal Overview Card */}
      <section className="finance-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-[#18181b] dark:text-zinc-200">
              <GoalCategoryIcon icon={goal.icon} category={goal.category} size={28} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-[#18181b] dark:text-zinc-300 capitalize">
                  {goal.category}
                </span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-[#18181b] dark:text-zinc-300 uppercase">
                  {goal.priority} Priority
                </span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                  goal.status === "active" ? "bg-emerald-50 text-[#0d684c] dark:bg-emerald-950/40 dark:text-emerald-300" :
                  goal.status === "completed" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" :
                  "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                }`}>
                  {goal.status}
                </span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-[#18181b] dark:text-zinc-400">
                  {pace.label}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {goal.name}
              </h1>
              {goal.note && (
                <p className="mt-1 text-xs text-zinc-500 leading-relaxed max-w-xl">{goal.note}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {goal.status === "active" ? (
              <button
                onClick={() => onStatusChange(goal, "paused")}
                className="btn-secondary !py-1.5 text-xs"
              >
                <PauseCircle size={14} /> Pause
              </button>
            ) : goal.status === "paused" ? (
              <button
                onClick={() => onStatusChange(goal, "active")}
                className="btn-secondary !py-1.5 text-xs"
              >
                <PlayCircle size={14} /> Resume
              </button>
            ) : null}

            {goal.status !== "completed" && (
              <button
                onClick={() => onStatusChange(goal, "completed")}
                className="btn-secondary !py-1.5 text-xs text-blue-700 dark:text-blue-400"
              >
                <CheckCircle size={14} /> Mark Complete
              </button>
            )}
          </div>
        </div>

        {/* Progress Gauge */}
        <div className="mt-8 rounded-xl bg-zinc-50 dark:bg-[#18181b] p-4 sm:p-5 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                {formatINR(goal.currentAmount)}
              </span>
              <span className="ml-2 text-xs font-medium text-zinc-500">
                saved of {formatINR(goal.targetAmount)} ({formatINR(remaining)} left)
              </span>
            </div>
            <span className="text-base font-bold text-[#0d684c] dark:text-emerald-400">
              {pct}%
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-[#0d684c] dark:bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Milestones (25%, 50%, 75%, 100%) */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[25, 50, 75, 100].map(m => {
              const reached = pct >= m;
              return (
                <div
                  key={m}
                  className={`rounded-xl border p-2.5 ${
                    reached
                      ? "border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "border-zinc-200 bg-white/50 text-zinc-400 dark:border-zinc-800 dark:bg-[#121212]/50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {reached ? <CheckCircle2 size={13} className="text-[#0d684c] dark:text-emerald-400" /> : <Clock size={13} />}
                    <span>{m}% Milestone</span>
                  </div>
                  <p className="mt-1 text-[11px] font-semibold">
                    {formatINR(goal.targetAmount * (m / 100))}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 1-Click Recalibrate Behind Schedule Banner */}
      {goal.status === "active" && pace.status === "behind" && onRecalibrate && (
        <div className="finance-card border-rose-300 bg-rose-50/70 p-4 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 text-xs">
            <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-rose-900 dark:text-rose-200">
                This goal is behind schedule ({pace.label})
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-0.5">
                Current pace requires {formatINR(reqMonth)}/mo to hit your {new Date(goal.targetDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} deadline.
              </p>
            </div>
          </div>
          <button
            onClick={() => onRecalibrate(goal)}
            className="btn-primary !bg-rose-600 hover:!bg-rose-700 !text-white !py-2 text-xs font-bold shrink-0 inline-flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw size={14} /> Recalibrate Plan
          </button>
        </div>
      )}

      {/* Burn Rate Pace Cards */}
      <section className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="finance-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Required / Month</p>
          <p className="mt-1 text-lg font-extrabold text-zinc-900 dark:text-white">{formatINR(reqMonth)}</p>
        </div>
        <div className="finance-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Required / Week</p>
          <p className="mt-1 text-lg font-extrabold text-zinc-900 dark:text-white">{formatINR(reqWeek)}</p>
        </div>
        <div className="finance-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Required / Day</p>
          <p className="mt-1 text-lg font-extrabold text-zinc-900 dark:text-white">{formatINR(reqDay)}</p>
        </div>
        <div className="finance-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Days Remaining</p>
          <p className="mt-1 text-lg font-extrabold text-zinc-900 dark:text-white">{daysLeft} days</p>
        </div>
      </section>

      {/* Two-Column Action Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* What-If Scenario Planner */}
          <section className="finance-card p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-sm">What-If Scenario Planner</h3>
                <p className="text-xs text-zinc-500">Test how target amount or deadline adjustments affect required savings.</p>
              </div>
              <button
                onClick={() => {
                  setWhatIfTarget(goal.targetAmount);
                  setWhatIfDeadline(goal.targetDate);
                }}
                className="text-xs font-semibold text-[#0d684c] dark:text-emerald-400 hover:underline"
              >
                Reset
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Simulate Target Amount</label>
                <input
                  type="number"
                  min="1"
                  value={whatIfTarget}
                  onChange={e => setWhatIfTarget(Number(e.target.value) || goal.targetAmount)}
                  className="input font-semibold"
                />
              </div>
              <div>
                <label className="label">Simulate Target Deadline</label>
                <input
                  type="date"
                  value={whatIfDeadline}
                  onChange={e => setWhatIfDeadline(e.target.value)}
                  className="input font-semibold"
                />
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-zinc-50 dark:bg-[#18181b] p-4 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500 block">Required Monthly Rate:</span>
                <span className="text-lg font-extrabold text-zinc-900 dark:text-white">{formatINR(whatIfReqMonth)}/mo</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block">Difference from Plan:</span>
                <span className={`text-sm font-bold ${whatIfDiff > 0 ? "text-amber-600" : "text-[#0d684c] dark:text-emerald-400"}`}>
                  {whatIfDiff >= 0 ? "+" : ""}{formatINR(whatIfDiff)}/mo
                </span>
              </div>
            </div>
          </section>

          {/* Transaction History */}
          <section className="finance-card overflow-hidden">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Transaction History</h3>
                <p className="text-xs text-zinc-500">Real contributions and withdrawals for this goal.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onExportCSV}
                  className="btn-secondary !py-1.5 text-xs"
                  title="Export goal transactions to CSV"
                >
                  <FileSpreadsheet size={13} /> Export CSV
                </button>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-[#18181b] dark:text-zinc-400">
                  {transactions.length} records
                </span>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No transactions recorded yet. Use the panel on the right to log contributions.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-80 overflow-y-auto">
                {transactions.map(t => (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-[#18181b]/50 transition text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold ${
                        t.type === "deposit"
                          ? "bg-emerald-50 text-[#0d684c] dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                      }`}>
                        {t.type === "deposit" ? "+" : "−"}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-800 dark:text-zinc-200">{t.note || (t.type === "deposit" ? "Deposit" : "Withdrawal")}</p>
                        <p className="text-[10px] text-zinc-400">{t.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-extrabold ${t.type === "deposit" ? "text-[#0d684c] dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {t.type === "deposit" ? "+" : "−"}{formatINR(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Aside: Add Money + Archive */}
        <aside className="space-y-6">
          <section className="finance-card p-5 sm:p-6">
            <h3 className="font-bold text-sm">Add or Withdraw Money</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Record a contribution towards this goal.</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTxType("deposit")}
                className={`rounded-xl py-2 text-xs font-bold transition ${
                  txType === "deposit"
                    ? "bg-[#0d684c] text-white"
                    : "border border-zinc-300 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-300"
                }`}
              >
                + Deposit
              </button>
              <button
                type="button"
                onClick={() => setTxType("withdrawal")}
                className={`rounded-xl py-2 text-xs font-bold transition ${
                  txType === "withdrawal"
                    ? "bg-rose-700 text-white dark:bg-rose-600"
                    : "border border-zinc-300 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-300"
                }`}
              >
                − Withdraw
              </button>
            </div>

            {txType === "deposit" && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTxAmount(String(amt))}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-300"
                  >
                    +{formatINR(amt)}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div>
                <label className="label">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  value={txAmount}
                  onChange={e => setTxAmount(e.target.value)}
                  className="input font-semibold"
                />
              </div>

              <div>
                <label className="label">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly transfer, bonus"
                  value={txNote}
                  onChange={e => setTxNote(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleRecordTransaction}
                className="btn-primary w-full mt-2"
              >
                <Save size={15} /> Save {txType === "deposit" ? "Deposit" : "Withdrawal"}
              </button>
            </div>
          </section>

          {/* Archive / Delete */}
          <div className="finance-card p-5 space-y-3">
            <button
              onClick={() => onStatusChange(goal, "archived")}
              className="w-full text-left text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Archive Goal (Hide from active)
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="w-full text-left text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              Permanently Delete Goal
            </button>
          </div>
        </aside>
      </div>

      {/* Edit Goal Modal */}
      {isEditing && (
        <EditGoalModal
          goal={goal}
          onClose={() => setIsEditing(false)}
          onSave={async (updated) => {
            await onSaveEdit(updated);
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 5-STEP GOAL CREATION FLOW (MULTI-STEP WIZARD)
// -------------------------------------------------------------
function MultiStepGoalCreationWizard({
  availableCapacity, onClose, onCreate
}: {
  availableCapacity: number;
  onClose: () => void;
  onCreate: (goal: Goal, initialDeposit?: number) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [productUrl, setProductUrl] = useState("");
  const [isManual, setIsManual] = useState(false);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [alreadySaved, setAlreadySaved] = useState("");
  const [category, setCategory] = useState("Technology");
  const [customCategory, setCustomCategory] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("purchase");
  const [icon, setIcon] = useState("target");
  const [note, setNote] = useState("");

  const [startDate, setStartDate] = useState(dateInput());
  const [targetDate, setTargetDate] = useState(addMonthsToDate(6));
  const [frequency, setFrequency] = useState<SavingsFrequency>("monthly");
  const [priority, setPriority] = useState<Priority>("medium");
  const [enableRecurring, setEnableRecurring] = useState(false);
  const [recurringAmount, setRecurringAmount] = useState("");

  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [otherSavings, setOtherSavings] = useState("");
  const [safetyBuffer, setSafetyBuffer] = useState("");

  const [accountForInflation, setAccountForInflation] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);

  const targetN = Number(targetAmount) || 0;
  const currentN = Number(alreadySaved) || 0;
  const incomeN = Number(income) || 0;
  const expensesN = Number(expenses) || 0;
  const otherSavingsN = Number(otherSavings) || 0;
  const safetyBufferN = Number(safetyBuffer) || 0;

  const yearsToTarget = useMemo(() => {
    if (!startDate || !targetDate) return 1;
    const diffMs = new Date(targetDate).getTime() - new Date(startDate).getTime();
    return Math.max(0.1, Number((diffMs / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1)));
  }, [startDate, targetDate]);

  const inflationCalculation = useMemo(() => {
    if (!accountForInflation || targetN <= 0) return null;
    return calculateInflationAdjustedTarget(targetN, Number(inflationRate) || 6, yearsToTarget);
  }, [accountForInflation, targetN, inflationRate, yearsToTarget]);

  const calculatedCapacity = useMemo(() => {
    if (incomeN > 0) {
      return savingsCapacity(incomeN, expensesN, otherSavingsN, safetyBufferN);
    }
    return availableCapacity;
  }, [incomeN, expensesN, otherSavingsN, safetyBufferN, availableCapacity]);

  const reqMonth = targetDate ? requiredMonthly(targetN, currentN, targetDate) : 0;
  const reqWeek = targetDate ? requiredWeekly(targetN, currentN, targetDate) : 0;
  const reqDay = targetDate ? requiredDaily(targetN, currentN, targetDate) : 0;
  const fitVerdict = calculatedCapacity > 0 ? feasibility(reqMonth, calculatedCapacity) : null;
  const projDate = projectedCompletionDate(targetN, currentN, calculatedCapacity > 0 ? calculatedCapacity : reqMonth);

  function handleAutoSuggestDeadline() {
    if (targetN <= 0) return;
    const suggested = suggestedDeadline(targetN, currentN, calculatedCapacity, startDate);
    setTargetDate(suggested);
  }

  function handleFinish() {
    const finalCategory = category === "Other" && customCategory.trim() ? customCategory.trim() : category;

    const newGoal: Goal = {
      id: uid(),
      name: name.trim() || "Untitled Goal",
      type: goalType,
      category: finalCategory,
      productUrl: productUrl.trim() || undefined,
      targetAmount: targetN,
      currentAmount: currentN,
      startDate: startDate || dateInput(),
      targetDate: targetDate || addMonthsToDate(6),
      priority,
      icon: icon || "target",
      note: note.trim() || undefined,
      recurringContribution: enableRecurring && Number(recurringAmount) > 0 ? Number(recurringAmount) : undefined,
      recurringFrequency: enableRecurring ? frequency : undefined,
      status: currentN >= targetN ? "completed" : "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onCreate(newGoal, currentN);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="finance-card w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white/95 px-6 py-4 dark:border-zinc-800 dark:bg-[#121212]/95 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d684c] dark:text-emerald-400">
              Step {step} of 5
            </span>
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
              {step === 1 && "What are you saving for?"}
              {step === 2 && "Goal Details"}
              {step === 3 && "Time & Saving Plan"}
              {step === 4 && "Financial Capacity"}
              {step === 5 && "Plan Review"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500 leading-relaxed">
                You can attach an optional product or goal link to track what you want to buy, or simply create the goal manually.
              </p>

              <div>
                <label className="label">Product or Goal Link (Optional)</label>
                <div className="relative">
                  <Link2 size={16} className="absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="url"
                    placeholder="https://example.com/product..."
                    value={productUrl}
                    onChange={e => setProductUrl(e.target.value)}
                    className="input pl-9 text-xs"
                  />
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Note: NestSave does not scrape or fetch prices online. You will enter the target amount manually.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsManual(true); setStep(2); }}
                  className="btn-secondary flex-1"
                >
                  Create Manually
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary flex-1"
                >
                  Continue with Link
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">Goal Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Work Laptop, Summer Trip, Emergency Buffer"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input font-semibold"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Target Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 75000"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="input font-semibold"
                  />
                </div>
                <div>
                  <label className="label">Already Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={alreadySaved}
                    onChange={e => setAlreadySaved(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="input text-xs cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Goal Type</label>
                  <select
                    value={goalType}
                    onChange={e => setGoalType(e.target.value as GoalType)}
                    className="input text-xs cursor-pointer capitalize"
                  >
                    <option value="purchase">Purchase</option>
                    <option value="general">General Savings</option>
                    <option value="emergency">Emergency Fund</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {category === "Other" && (
                <div>
                  <label className="label">Custom Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Wedding, Business Seed"
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              )}

              <div>
                <label className="label">Select Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(({ id, label, Icon: IconComp }) => (
                    <button
                      key={id}
                      type="button"
                      title={label}
                      onClick={() => setIcon(id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition ${
                        icon === id
                          ? "border-[#0d684c] bg-emerald-50 text-[#0d684c] dark:border-emerald-500 dark:bg-[#18181b] dark:text-emerald-400 font-semibold"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-[#121212] dark:text-zinc-400 dark:hover:border-zinc-700"
                      }`}
                    >
                      <IconComp size={15} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Note (Optional)</label>
                <textarea
                  placeholder="Any details about this goal..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="input min-h-16 resize-none text-xs"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button
                  type="button"
                  disabled={!name.trim() || targetN <= 0}
                  onClick={() => setStep(3)}
                  className="btn-primary flex-1"
                >
                  Next: Time Plan
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label !mb-0">Target Deadline *</label>
                    <button
                      type="button"
                      onClick={handleAutoSuggestDeadline}
                      className="text-[10px] font-bold text-[#0d684c] dark:text-emerald-400 hover:underline"
                    >
                      Suggest Realistic Deadline
                    </button>
                  </div>
                  <input
                    type="date"
                    min={startDate}
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="input text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Savings Frequency</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as SavingsFrequency)}
                    className="input text-xs cursor-pointer capitalize"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    className="input text-xs cursor-pointer capitalize"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-zinc-50 dark:bg-[#18181b] p-4 border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Live Calculated Pace</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white dark:bg-[#121212] p-2 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Required / Day</span>
                    <strong className="text-xs font-extrabold">{formatINR(reqDay)}</strong>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-[#121212] p-2 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Required / Week</span>
                    <strong className="text-xs font-extrabold">{formatINR(reqWeek)}</strong>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-[#121212] p-2 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Required / Month</span>
                    <strong className="text-xs font-extrabold text-[#0d684c] dark:text-emerald-400">{formatINR(reqMonth)}</strong>
                  </div>
                </div>
              </div>

              {/* Inflation Adjustment Real Value Calculator */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={accountForInflation}
                      onChange={e => setAccountForInflation(e.target.checked)}
                      className="rounded accent-[#0d684c]"
                    />
                    <span>Account for Inflation (Real Value Calculator)</span>
                  </label>
                  {accountForInflation && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500">
                      <span>Rate:</span>
                      <input
                        type="number"
                        min="1"
                        max="25"
                        value={inflationRate}
                        onChange={e => setInflationRate(Number(e.target.value) || 6)}
                        className="w-12 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121212] px-1 py-0.5 text-center text-xs font-bold"
                      />
                      <span>% p.a.</span>
                    </div>
                  )}
                </div>

                {accountForInflation && inflationCalculation && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-amber-900 dark:text-amber-200">
                          Real Future Cost: {formatINR(inflationCalculation.futureCost)}
                        </p>
                        <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                          At {inflationRate}% inflation over {yearsToTarget} years, ₹{formatINR(targetN)} today will lose {100 - inflationCalculation.purchasingPowerRetainedPct}% purchasing power (+{formatINR(inflationCalculation.additionalCostNeeded)} needed).
                        </p>
                      </div>
                      {targetN !== inflationCalculation.futureCost && (
                        <button
                          type="button"
                          onClick={() => setTargetAmount(String(inflationCalculation.futureCost))}
                          className="shrink-0 rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-sm transition"
                        >
                          Apply {formatINR(inflationCalculation.futureCost)}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={enableRecurring}
                    onChange={e => setEnableRecurring(e.target.checked)}
                    className="rounded accent-[#0d684c]"
                  />
                  <span>Enable recurring contribution reminder</span>
                </label>
                {enableRecurring && (
                  <div className="pt-2">
                    <label className="label">Contribution Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={recurringAmount}
                      onChange={e => setRecurringAmount(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary flex-1">Next: Financial Capacity</button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500 leading-relaxed">
                Enter your monthly cash flow to calculate true savings capacity:
                <br /><code className="text-[11px] text-zinc-600 dark:text-zinc-300">Capacity = Income - Fixed Expenses - Other Savings - Safety Buffer</code>
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Monthly Take-Home Income (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 60000"
                    value={income}
                    onChange={e => setIncome(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label">Fixed Monthly Expenses (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Rent, bills, groceries"
                    value={expenses}
                    onChange={e => setExpenses(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Other Committed Monthly Savings (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. Existing investments"
                    value={otherSavings}
                    onChange={e => setOtherSavings(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label">Monthly Safety Buffer (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Unplanned cushion"
                    value={safetyBuffer}
                    onChange={e => setSafetyBuffer(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-zinc-50 dark:bg-[#18181b] p-4 border border-zinc-100 dark:border-zinc-800 text-xs">
                <span className="text-zinc-500 block">Calculated Available Monthly Capacity:</span>
                <strong className="text-base font-extrabold text-zinc-900 dark:text-white mt-0.5 block">
                  {calculatedCapacity > 0 ? `${formatINR(calculatedCapacity)}/month` : "Limited (No income entered)"}
                </strong>
                {calculatedCapacity <= 0 && (
                  <p className="mt-1 text-[11px] text-zinc-400">
                    If income/expenses are not entered, feasibility analysis will be indicated as limited.
                  </p>
                )}
              </div>

              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1">Back</button>
                <button type="button" onClick={() => setStep(5)} className="btn-primary flex-1">Next: Plan Review</button>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 font-bold">
                  <span>Goal: {name}</span>
                  <span className="capitalize text-zinc-500">{category}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Target Amount</span>
                    <strong className="font-extrabold text-sm">{formatINR(targetN)}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Already Saved</span>
                    <strong className="font-extrabold text-sm">{formatINR(currentN)}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Remaining</span>
                    <strong className="font-extrabold text-sm">{formatINR(targetN - currentN)}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Available Capacity</span>
                    <strong className="font-extrabold text-sm">{calculatedCapacity > 0 ? formatINR(calculatedCapacity) + "/mo" : "Limited"}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-zinc-50 dark:bg-[#18181b] p-2">
                    <span className="text-[10px] text-zinc-400 block">Monthly Needed</span>
                    <strong className="text-xs font-bold text-[#0d684c] dark:text-emerald-400">{formatINR(reqMonth)}</strong>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-[#18181b] p-2">
                    <span className="text-[10px] text-zinc-400 block">Weekly Needed</span>
                    <strong className="text-xs font-bold">{formatINR(reqWeek)}</strong>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-[#18181b] p-2">
                    <span className="text-[10px] text-zinc-400 block">Daily Needed</span>
                    <strong className="text-xs font-bold">{formatINR(reqDay)}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-zinc-400 block">Feasibility Status</span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{fitVerdict ? fitVerdict.description : "Calculated without capacity baseline"}</p>
                  </div>
                  {fitVerdict ? (
                    <span className={`rounded-md px-2.5 py-1 text-xs font-extrabold uppercase ${
                      fitVerdict.verdict === "DOABLE" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                      fitVerdict.verdict === "TIGHT" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                      "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    }`}>
                      {fitVerdict.verdict}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-zinc-400">UNSPECIFIED</span>
                  )}
                </div>

                {projDate && (
                  <p className="text-[11px] text-zinc-400">
                    Projected Completion: <strong className="text-zinc-700 dark:text-zinc-200">{projDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>
                  </p>
                )}
              </div>

              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setStep(4)} className="btn-secondary flex-1">Back</button>
                <button type="button" onClick={handleFinish} className="btn-primary flex-1">Create Savings Plan</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// EDIT GOAL MODAL
// -------------------------------------------------------------
function EditGoalModal({
  goal, onClose, onSave
}: {
  goal: Goal; onClose: () => void; onSave: (updated: Goal) => Promise<void>;
}) {
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(String(goal.targetAmount));
  const [targetDate, setTargetDate] = useState(goal.targetDate);
  const [priority, setPriority] = useState<Priority>(goal.priority);
  const [category, setCategory] = useState(goal.category);
  const [productUrl, setProductUrl] = useState(goal.productUrl || "");
  const [note, setNote] = useState(goal.note || "");

  async function handleSave() {
    const targetN = Math.max(1, Number(targetAmount) || goal.targetAmount);
    await onSave({
      ...goal,
      name: name.trim() || goal.name,
      targetAmount: targetN,
      targetDate,
      priority,
      category,
      productUrl: productUrl.trim() || undefined,
      note: note.trim() || undefined,
      status: goal.currentAmount >= targetN ? "completed" : goal.status
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="finance-card w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-sm">Edit Savings Goal</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X size={18} /></button>
        </div>

        <div>
          <label className="label">Goal Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Target Amount (₹)</label>
            <input className="input" type="number" min="1" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
          </div>
          <div>
            <label className="label">Deadline</label>
            <input className="input" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="input text-xs cursor-pointer capitalize">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input text-xs cursor-pointer">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Product / Goal Link</label>
          <input className="input text-xs" type="url" value={productUrl} onChange={e => setProductUrl(e.target.value)} />
        </div>

        <div>
          <label className="label">Note</label>
          <textarea className="input min-h-16 resize-none text-xs" value={note} onChange={e => setNote(e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="button" onClick={handleSave} className="btn-primary flex-1">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SETTINGS & PRIVACY VIEW
// -------------------------------------------------------------
function SettingsView({
  settings, onSaveSettings, onBack, onExportJSON, onExportCSV, onImportJSON, onResetAll,
  isStandalone, onTriggerInstall, onEnableNotifications,
  onSetPin, onRemovePin, onExportEncrypted, onImportEncrypted
}: {
  settings: AppSettings;
  onSaveSettings: (s: AppSettings) => Promise<void>;
  onBack: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onImportJSON: (f: File) => void;
  onResetAll: () => void;
  isStandalone?: boolean;
  onTriggerInstall?: () => void;
  onEnableNotifications?: () => void;
  onSetPin?: (pin: string) => Promise<void>;
  onRemovePin?: () => Promise<void>;
  onExportEncrypted?: () => void;
  onImportEncrypted?: () => void;
}) {
  const [theme, setTheme] = useState(settings.theme);
  const [income, setIncome] = useState(settings.monthlyIncome ? String(settings.monthlyIncome) : "");
  const [expenses, setExpenses] = useState(settings.fixedMonthlyExpenses ? String(settings.fixedMonthlyExpenses) : "");
  const [otherSavings, setOtherSavings] = useState(settings.otherMonthlySavings ? String(settings.otherMonthlySavings) : "");
  const [safetyBuffer, setSafetyBuffer] = useState(settings.safetyBuffer ? String(settings.safetyBuffer) : "");

  const [pinInput, setPinInput] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  async function handleSavePin() {
    if (!pinInput || pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setPinError("PIN must be exactly 4 numeric digits.");
      return;
    }
    if (pinInput !== pinConfirm) {
      setPinError("PINs do not match. Please re-enter.");
      return;
    }
    setPinError("");
    setSavingPin(true);
    try {
      if (onSetPin) await onSetPin(pinInput);
      setPinInput("");
      setPinConfirm("");
      setPinSuccess("PIN lock successfully activated!");
      setTimeout(() => setPinSuccess(""), 4000);
    } catch {
      setPinError("Failed to set PIN lock.");
    } finally {
      setSavingPin(false);
    }
  }

  async function handleSaveCapacity() {
    await onSaveSettings({
      ...settings,
      theme,
      monthlyIncome: Number(income) || undefined,
      fixedMonthlyExpenses: Number(expenses) || undefined,
      otherMonthlySavings: Number(otherSavings) || undefined,
      safetyBuffer: Number(safetyBuffer) || undefined
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Preferences & Data Vault</h1>
        <p className="mt-1 text-xs text-zinc-500">Configure financial capacity parameters, theme, and data portability.</p>
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <div className="finance-card p-5 space-y-3">
          <h3 className="font-bold text-sm">Appearance</h3>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  const isDark =
                    t === "dark" ||
                    (t === "system" &&
                      typeof window !== "undefined" &&
                      window.matchMedia("(prefers-color-scheme: dark)").matches);
                  if (isDark) {
                    document.documentElement.classList.add("dark");
                    document.body.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                    document.body.classList.remove("dark");
                  }
                  onSaveSettings({ ...settings, theme: t });
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition ${
                  theme === t
                    ? "bg-[#0d684c] text-white shadow-sm ring-1 ring-[#0d684c]"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Local App Lock Security */}
        <div className="finance-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-[#0d684c] dark:text-emerald-400" />
              <h3 className="font-bold text-sm">Local App Lock (4-Digit PIN)</h3>
            </div>
            {settings.appLockEnabled ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                <ShieldCheck size={13} /> Active PIN Protection
              </span>
            ) : (
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                Disabled
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Require a 4-digit security PIN before revealing your local vault balances whenever NestSave is opened. All hashing runs on-device using Web Crypto SHA-256 with cryptographic salt.
          </p>

          {settings.appLockEnabled ? (
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onRemovePin}
                className="btn-secondary !text-rose-600 hover:!bg-rose-50 dark:hover:!bg-rose-950/30 text-xs font-bold"
              >
                <Unlock size={14} /> Remove PIN Lock
              </button>
            </div>
          ) : (
            <div className="pt-2 space-y-3">
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <div>
                  <label className="label">New 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value.replace(/\D/g, ""))}
                    className="input text-center font-bold tracking-widest text-base"
                  />
                </div>
                <div>
                  <label className="label">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={pinConfirm}
                    onChange={e => setPinConfirm(e.target.value.replace(/\D/g, ""))}
                    className="input text-center font-bold tracking-widest text-base"
                  />
                </div>
              </div>

              {pinError && <p className="text-xs font-semibold text-rose-500">{pinError}</p>}
              {pinSuccess && <p className="text-xs font-semibold text-emerald-600">{pinSuccess}</p>}

              <button
                type="button"
                disabled={pinInput.length !== 4 || pinConfirm.length !== 4 || savingPin}
                onClick={handleSavePin}
                className="btn-primary text-xs !py-2"
              >
                <KeyRound size={14} /> Set 4-Digit PIN Lock
              </button>
            </div>
          )}
        </div>

        {/* Mobile & Offline App (PWA) */}
        <div className="finance-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone size={18} className="text-[#0d684c] dark:text-emerald-400" />
              <h3 className="font-bold text-sm">Download to Phone (PWA App)</h3>
            </div>
            {isStandalone ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Installed as App
              </span>
            ) : (
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                Web Browser
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Install NestSave directly to your iPhone or Android home screen for an app-like experience with fullscreen display and 100% offline capability.
          </p>

          <div className="pt-1">
            <button
              type="button"
              onClick={onTriggerInstall}
              className="btn-primary text-xs !py-2"
            >
              <Smartphone size={14} /> Install to Phone / Desktop
            </button>
          </div>
        </div>

        {/* Savings Reminders & Notifications */}
        <div className="finance-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-[#0d684c] dark:text-emerald-400" />
              <h3 className="font-bold text-sm">Savings Reminders & Notifications</h3>
            </div>
            {settings.pushNotificationsEnabled ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Enabled
              </span>
            ) : (
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                Disabled
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Get private on-device reminders to log contributions, stay accountable, and check if you are on track with your goals.
          </p>

          <div className="pt-1">
            <button
              type="button"
              onClick={onEnableNotifications}
              className="btn-secondary text-xs !py-2 inline-flex items-center gap-1.5"
            >
              <Bell size={14} />
              <span>{settings.pushNotificationsEnabled ? "Test Reminder Notification" : "Enable Browser Notifications"}</span>
            </button>
          </div>
        </div>

        {/* Financial Capacity Calibration */}
        <div className="finance-card p-5 space-y-4">
          <div>
            <h3 className="font-bold text-sm">Monthly Cash Flow Calibration</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Used by the calculation engine for multi-goal conflict detection and feasibility.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Monthly Take-Home Income (₹)</label>
              <input
                type="number"
                placeholder="e.g. 70000"
                value={income}
                onChange={e => setIncome(e.target.value)}
                className="input text-xs font-semibold"
              />
            </div>
            <div>
              <label className="label">Fixed Monthly Expenses (₹)</label>
              <input
                type="number"
                placeholder="Rent, utilities, EMIs"
                value={expenses}
                onChange={e => setExpenses(e.target.value)}
                className="input text-xs font-semibold"
              />
            </div>
            <div>
              <label className="label">Other Committed Monthly Savings (₹)</label>
              <input
                type="number"
                placeholder="Existing investments"
                value={otherSavings}
                onChange={e => setOtherSavings(e.target.value)}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="label">Safety Buffer (₹)</label>
              <input
                type="number"
                placeholder="Emergency cushion"
                value={safetyBuffer}
                onChange={e => setSafetyBuffer(e.target.value)}
                className="input text-xs"
              />
            </div>
          </div>

          <button onClick={handleSaveCapacity} className="btn-primary text-xs">
            Save Financial Capacity
          </button>
        </div>

        {/* Data Portability */}
        <div className="finance-card p-5 space-y-3">
          <h3 className="font-bold text-sm">Data Portability (Local Exports)</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            NestSave stores everything in IndexedDB inside this browser sandbox. Download copies to your files anytime.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={onExportJSON} className="btn-secondary text-xs">
              <Download size={14} /> Export Plain JSON
            </button>
            <button onClick={onExportCSV} className="btn-secondary text-xs">
              <FileSpreadsheet size={14} /> Export Goals CSV
            </button>
            {onExportEncrypted && (
              <button
                type="button"
                onClick={onExportEncrypted}
                className="btn-secondary !border-emerald-600/40 !bg-emerald-50 text-[#0d684c] dark:!bg-emerald-950/40 dark:text-emerald-300 dark:!border-emerald-700/50 text-xs font-bold"
              >
                <Lock size={14} /> Export Encrypted Vault (AES-GCM)
              </button>
            )}
            <label className="btn-secondary text-xs cursor-pointer">
              <Upload size={14} /> Restore Plain JSON
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={e => e.target.files?.[0] && onImportJSON(e.target.files[0])}
              />
            </label>
            {onImportEncrypted && (
              <button
                type="button"
                onClick={onImportEncrypted}
                className="btn-secondary text-xs font-bold"
              >
                <KeyRound size={14} /> Restore Encrypted Vault
              </button>
            )}
          </div>
        </div>

        {/* Privacy Guarantees */}
        <div className="finance-card p-5 space-y-2 border-emerald-200 dark:border-emerald-900/40">
          <div className="flex items-center gap-2 text-[#0d684c] dark:text-emerald-400 font-bold text-sm">
            <ShieldCheck size={18} />
            <span>Local-First Privacy Architecture</span>
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
            <li>• <strong>No server database:</strong> Your financial data never leaves your device.</li>
            <li>• <strong>No accounts or signups:</strong> There are no user profiles or telemetry databases.</li>
            <li>• <strong>Offline operation:</strong> NestSave runs completely without network dependencies.</li>
            <li>• <strong>Local AI processing:</strong> On-device queries are processed locally without cloud LLM APIs.</li>
          </ul>
        </div>

        {/* Danger Zone */}
        <div className="finance-card p-5 space-y-2 border-rose-200 dark:border-rose-900/40">
          <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400">Reset Local Vault</h3>
          <p className="text-xs text-zinc-500">
            Permanently delete all goals, transactions, and custom settings from this browser's IndexedDB.
          </p>
          <div className="pt-2">
            <button onClick={onResetAll} className="btn-secondary !text-rose-600 hover:!bg-rose-50 dark:hover:!bg-rose-950/30 text-xs font-bold">
              <RotateCcw size={14} /> Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// LOCAL AI ASSISTANT VIEW (ON-DEVICE ARCHITECTURE)
// -------------------------------------------------------------
function LocalAIAssistantView({
  goals, settings, onBack, onSaveSettings
}: {
  goals: Goal[];
  settings: AppSettings;
  onBack: () => void;
  onSaveSettings: (s: AppSettings) => Promise<void>;
}) {
  const [deviceInfo, setDeviceInfo] = useState(detectDeviceCapability());
  const [userQuery, setUserQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string; details?: any }>>([
    {
      role: "assistant",
      text: "Hello! I am your private, on-device NestSave assistant. I answer financial questions by calling deterministic calculation functions against your local IndexedDB vault. What would you like to review?"
    }
  ]);

  useEffect(() => {
    setDeviceInfo(detectDeviceCapability());
  }, []);

  function handleSendQuery() {
    if (!userQuery.trim() || isThinking) return;
    const query = userQuery.trim();
    setUserQuery("");

    setMessages(prev => [...prev, { role: "user", text: query }]);
    setIsThinking(true);

    // Call deterministic tool pipeline
    setTimeout(() => {
      const result = answerFinancialQueryLocally(query, { goals, settings });
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: result.answer,
          details: result.toolParameters
        }
      ]);
      setIsThinking(false);
    }, 200);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div>
        <div className="flex items-center gap-2">
          <Bot size={22} className="text-[#0d684c] dark:text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight">NestSave On-Device AI</h1>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-[#18181b] px-2 py-0.5 rounded-md border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Running locally • On-device
          </span>
          <span className="text-xs text-zinc-500">Deterministic math engine</span>
        </div>
      </div>

      {/* Model Spec Card */}
      <div className="finance-card p-4 sm:p-5 border-emerald-100 dark:border-emerald-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-900 dark:text-white">Recommended: {deviceInfo.recommendedModel.name}</span>
              <span className="rounded bg-emerald-50 text-[#0d684c] dark:bg-[#18181b] dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                {deviceInfo.recommendedModel.tag}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Detected Hardware: ~{deviceInfo.deviceMemoryGB} GB RAM • Model Size: {deviceInfo.recommendedModel.sizeMB} MB
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#0d684c] dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={13} /> Stored on device
            </span>
          </div>
        </div>

        <p className="mt-2 text-[11px] text-zinc-400 leading-relaxed">
          The LLM extracts user parameters and delegates calculations to the NestSave deterministic TypeScript engine. Financial arithmetic is never hallucinated.
        </p>
      </div>

      {/* Chat Messages */}
      <div className="finance-card flex flex-col h-[420px] overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#0d684c] text-white font-medium"
                    : "bg-zinc-100 dark:bg-[#18181b] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl p-3 bg-zinc-100 dark:bg-[#18181b] text-zinc-500 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border border-zinc-400 border-t-transparent" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#121212] flex gap-2">
          <input
            type="text"
            placeholder="e.g. Can I afford ₹80,000 laptop by December? or Am I on track?"
            value={userQuery}
            onChange={e => setUserQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendQuery()}
            className="input !text-xs"
          />
          <button
            onClick={handleSendQuery}
            disabled={isThinking || !userQuery.trim()}
            className="btn-primary !py-2 text-xs font-bold"
          >
            Ask AI
          </button>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          "How much should I save every month?",
          "Am I on track?",
          "Which goal should I prioritize?",
          "Can I afford ₹80,000 laptop?"
        ].map(p => (
          <button
            key={p}
            onClick={() => setUserQuery(p)}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#121212] dark:text-zinc-400 dark:hover:bg-[#18181b]"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}