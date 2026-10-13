export type Priority = "low" | "medium" | "high" | "critical";

export type GoalType = "purchase" | "general" | "emergency" | "other";

export type GoalStatus = "active" | "paused" | "completed" | "archived";

export type SavingsFrequency = "daily" | "weekly" | "monthly";

export type TransactionType = "deposit" | "withdrawal";

export type ExpenseCategory =
  | "Food & Dining"
  | "Transport"
  | "Shopping"
  | "Bills & Utilities"
  | "Entertainment"
  | "Health"
  | "Education"
  | "Rent"
  | "Investments"
  | "Other";

export interface Transaction {
  id: string;
  goalId: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO date (YYYY-MM-DD or ISO timestamp)
  note: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  note: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  month: string; // "YYYY-MM"
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  category: string;
  productUrl?: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  priority: Priority;
  icon?: string;
  note?: string;
  recurringContribution?: number;
  recurringFrequency?: SavingsFrequency;
  status: GoalStatus;
  celebratedMilestones?: number[]; // e.g. [25, 50, 75, 100]
  createdAt: string;
  updatedAt: string;
}

export interface UserFinancialCapacity {
  monthlyIncome?: number;
  fixedMonthlyExpenses?: number;
  otherMonthlySavings?: number;
  safetyBuffer?: number;
}

export interface AppSettings extends UserFinancialCapacity {
  theme: "light" | "dark" | "system";
  currency: "INR";
  notificationsEnabled: boolean;
  aiModel?: string;
  aiEnabled: boolean;
  pushNotificationsEnabled?: boolean;
  reminderDayOfWeek?: number; // 0=Sun,6=Sat
  reminderHour?: number; // 0-23
  accentColor?: string;
}

// Gamification
export type BadgeId =
  | "first_goal"
  | "five_goals"
  | "first_deposit"
  | "streak_7"
  | "streak_30"
  | "goal_completed"
  | "three_completed"
  | "consistent_saver"
  | "halfway_hero"
  | "perfect_month"
  | "savings_champion";

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string; // emoji
  earnedAt?: string; // ISO timestamp — undefined means not yet earned
}

export interface SavingsStreak {
  currentStreak: number; // consecutive days with a deposit
  longestStreak: number;
  lastDepositDate: string | null; // YYYY-MM-DD
  totalDepositDays: number;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  goals: Goal[];
  transactions: Transaction[];
  expenses: Expense[];
  budgets: Budget[];
  settings: AppSettings;
}