export type Priority = "low" | "medium" | "high" | "critical";

export type GoalType = "purchase" | "general" | "emergency" | "other";

export type GoalStatus = "active" | "paused" | "completed" | "archived";

export type SavingsFrequency = "daily" | "weekly" | "monthly";

export type TransactionType = "deposit" | "withdrawal";

export interface Transaction {
  id: string;
  goalId: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO date (YYYY-MM-DD or ISO timestamp)
  note: string;
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
}

export interface BackupData {
  version: number;
  exportedAt: string;
  goals: Goal[];
  transactions: Transaction[];
  settings: AppSettings;
}