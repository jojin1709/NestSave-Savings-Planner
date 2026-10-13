import { Goal, Transaction, AppSettings, BackupData, Expense, Budget, SavingsStreak, Badge, BadgeId } from "./types";

const DB_NAME = "nest_save_vault";
const DB_VERSION = 4;

const STORE_GOALS = "goals";
const STORE_TRANSACTIONS = "transactions";
const STORE_SETTINGS = "settings";
const STORE_EXPENSES = "expenses";
const STORE_BUDGETS = "budgets";

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  currency: "INR",
  notificationsEnabled: true,
  aiEnabled: false,
  pushNotificationsEnabled: false,
  reminderDayOfWeek: 1,
  reminderHour: 20,
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(new Error("IndexedDB is not supported in this environment"));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_GOALS)) {
        const goalStore = db.createObjectStore(STORE_GOALS, { keyPath: "id" });
        goalStore.createIndex("status", "status", { unique: false });
        goalStore.createIndex("targetDate", "targetDate", { unique: false });
        goalStore.createIndex("priority", "priority", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
        const txStore = db.createObjectStore(STORE_TRANSACTIONS, { keyPath: "id" });
        txStore.createIndex("goalId", "goalId", { unique: false });
        txStore.createIndex("date", "date", { unique: false });
        txStore.createIndex("type", "type", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains(STORE_EXPENSES)) {
        const expStore = db.createObjectStore(STORE_EXPENSES, { keyPath: "id" });
        expStore.createIndex("date", "date", { unique: false });
        expStore.createIndex("category", "category", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_BUDGETS)) {
        const budStore = db.createObjectStore(STORE_BUDGETS, { keyPath: "id" });
        budStore.createIndex("month", "month", { unique: false });
        budStore.createIndex("category", "category", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
  });
}

export async function getAllGoals(): Promise<Goal[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_GOALS, "readonly");
      const store = tx.objectStore(STORE_GOALS);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result as Goal[]) || [];
        resolve(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function getGoal(id: string): Promise<Goal | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_GOALS, "readonly");
      const store = tx.objectStore(STORE_GOALS);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as Goal) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveGoal(goal: Goal): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_GOALS, "readwrite");
    const store = tx.objectStore(STORE_GOALS);
    const updatedGoal: Goal = { ...goal, updatedAt: new Date().toISOString() };
    store.put(updatedGoal);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_GOALS, STORE_TRANSACTIONS], "readwrite");
    const goalStore = tx.objectStore(STORE_GOALS);
    const txStore = tx.objectStore(STORE_TRANSACTIONS);
    goalStore.delete(id);
    const index = txStore.index("goalId");
    const req = index.openCursor(IDBKeyRange.only(id));
    req.onsuccess = (e: any) => {
      const cursor = e.target.result;
      if (cursor) { cursor.delete(); cursor.continue(); }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllTransactions(goalId?: string): Promise<Transaction[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_TRANSACTIONS, "readonly");
      const store = tx.objectStore(STORE_TRANSACTIONS);
      if (goalId) {
        const index = store.index("goalId");
        const req = index.getAll(IDBKeyRange.only(goalId));
        req.onsuccess = () => {
          const list = (req.result as Transaction[]) || [];
          resolve(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        };
        req.onerror = () => resolve([]);
      } else {
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as Transaction[]) || [];
          resolve(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        };
        req.onerror = () => resolve([]);
      }
    });
  } catch {
    return [];
  }
}

export async function addTransactionAndUpdateGoal(txData: {
  goalId: string;
  type: "deposit" | "withdrawal";
  amount: number;
  date?: string;
  note?: string;
}): Promise<{ transaction: Transaction; updatedGoal: Goal }> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_GOALS, STORE_TRANSACTIONS], "readwrite");
    const goalStore = tx.objectStore(STORE_GOALS);
    const txStore = tx.objectStore(STORE_TRANSACTIONS);
    const goalReq = goalStore.get(txData.goalId);
    goalReq.onsuccess = () => {
      const goal = goalReq.result as Goal | undefined;
      if (!goal) return reject(new Error("Goal not found"));
      if (txData.type === "withdrawal" && txData.amount > goal.currentAmount) {
        return reject(new Error("Withdrawal amount cannot exceed available goal balance"));
      }
      const newCurrentAmount = Math.max(0,
        txData.type === "deposit" ? goal.currentAmount + txData.amount : goal.currentAmount - txData.amount
      );
      const isCompleted = newCurrentAmount >= goal.targetAmount;
      const updatedGoal: Goal = {
        ...goal, currentAmount: newCurrentAmount,
        status: isCompleted ? "completed" : goal.status === "completed" ? "active" : goal.status,
        updatedAt: new Date().toISOString()
      };
      const newTx: Transaction = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
        goalId: goal.id, type: txData.type,
        amount: Math.round(txData.amount),
        date: txData.date || new Date().toISOString().slice(0, 10),
        note: (txData.note || "").trim(),
        createdAt: new Date().toISOString()
      };
      goalStore.put(updatedGoal);
      txStore.put(newTx);
      tx.oncomplete = () => resolve({ transaction: newTx, updatedGoal });
      tx.onerror = () => reject(tx.error);
    };
    goalReq.onerror = () => reject(goalReq.error);
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRANSACTIONS, "readwrite");
    tx.objectStore(STORE_TRANSACTIONS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllExpenses(): Promise<Expense[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_EXPENSES, "readonly");
      const store = tx.objectStore(STORE_EXPENSES);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result as Expense[]) || [];
        resolve(list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      };
      req.onerror = () => resolve([]);
    });
  } catch { return []; }
}

export async function saveExpense(expense: Expense): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_EXPENSES, "readwrite");
    tx.objectStore(STORE_EXPENSES).put(expense);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_EXPENSES, "readwrite");
    tx.objectStore(STORE_EXPENSES).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllBudgets(): Promise<Budget[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_BUDGETS, "readonly");
      const store = tx.objectStore(STORE_BUDGETS);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as Budget[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch { return []; }
}

export async function saveBudget(budget: Budget): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BUDGETS, "readwrite");
    tx.objectStore(STORE_BUDGETS).put(budget);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteBudget(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BUDGETS, "readwrite");
    tx.objectStore(STORE_BUDGETS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSettings(): Promise<AppSettings> {
  let fallback: AppSettings = DEFAULT_SETTINGS;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("nest_save_settings");
      if (raw) fallback = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {}
  }
  try {
    const db = await openDB();
    if (!db.objectStoreNames.contains(STORE_SETTINGS)) return fallback;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, "readonly");
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.get("app_settings");
      req.onsuccess = () => {
        if (req.result && req.result.value) resolve({ ...DEFAULT_SETTINGS, ...fallback, ...req.result.value });
        else resolve(fallback);
      };
      req.onerror = () => resolve(fallback);
    });
  } catch { return fallback; }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (typeof window !== "undefined") {
    try { localStorage.setItem("nest_save_settings", JSON.stringify(settings)); } catch {}
  }
  try {
    const db = await openDB();
    if (!db.objectStoreNames.contains(STORE_SETTINGS)) return;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, "readwrite");
      const store = tx.objectStore(STORE_SETTINGS);
      store.put({ key: "app_settings", value: settings });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) { console.warn("saveSettings error:", err); }
}

// STREAK & BADGES
const STREAK_KEY = "nest_save_streak";
const BADGES_KEY = "nest_save_badges";

export function getStreak(): SavingsStreak {
  if (typeof window === "undefined") return { currentStreak: 0, longestStreak: 0, lastDepositDate: null, totalDepositDays: 0 };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw) as SavingsStreak;
  } catch {}
  return { currentStreak: 0, longestStreak: 0, lastDepositDate: null, totalDepositDays: 0 };
}

export function updateStreak(depositDate: string): SavingsStreak {
  const current = getStreak();
  const today = depositDate;
  const yesterday = (() => {
    const d = new Date(depositDate);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  if (current.lastDepositDate === today) return current;
  const newStreak = current.lastDepositDate === yesterday ? current.currentStreak + 1 : 1;
  const updated: SavingsStreak = {
    currentStreak: newStreak,
    longestStreak: Math.max(current.longestStreak, newStreak),
    lastDepositDate: today,
    totalDepositDays: current.totalDepositDays + 1
  };
  if (typeof window !== "undefined") {
    try { localStorage.setItem(STREAK_KEY, JSON.stringify(updated)); } catch {}
  }
  return updated;
}

const ALL_BADGE_DEFS: Omit<Badge, "earnedAt">[] = [
  { id: "first_goal", name: "First Goal", description: "Created your first savings goal", icon: "🎯" },
  { id: "first_deposit", name: "First Deposit", description: "Made your first savings deposit", icon: "💰" },
  { id: "five_goals", name: "Goal Collector", description: "Created 5 or more savings goals", icon: "📋" },
  { id: "streak_7", name: "7-Day Streak", description: "Saved consistently for 7 days in a row", icon: "🔥" },
  { id: "streak_30", name: "30-Day Streak", description: "Saved consistently for 30 days in a row", icon: "⚡" },
  { id: "goal_completed", name: "Goal Crusher", description: "Completed your first savings goal", icon: "✅" },
  { id: "three_completed", name: "Triple Winner", description: "Completed 3 savings goals", icon: "🏆" },
  { id: "halfway_hero", name: "Halfway Hero", description: "Reached 50% on any goal", icon: "🌗" },
  { id: "consistent_saver", name: "Consistent Saver", description: "Made deposits on 10 different days", icon: "📅" },
  { id: "perfect_month", name: "Perfect Month", description: "Deposited at least once every week for a month", icon: "🌟" },
  { id: "savings_champion", name: "Savings Champion", description: "Reached 75% on any goal", icon: "🥇" },
];

export function getBadges(): Badge[] {
  if (typeof window === "undefined") return ALL_BADGE_DEFS.map(b => ({ ...b }));
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    const earned: Record<string, string> = raw ? JSON.parse(raw) : {};
    return ALL_BADGE_DEFS.map(b => ({ ...b, earnedAt: earned[b.id] ?? undefined }));
  } catch {
    return ALL_BADGE_DEFS.map(b => ({ ...b }));
  }
}

export function awardBadge(badgeId: BadgeId): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    const earned: Record<string, string> = raw ? JSON.parse(raw) : {};
    if (earned[badgeId]) return false;
    earned[badgeId] = new Date().toISOString();
    localStorage.setItem(BADGES_KEY, JSON.stringify(earned));
    return true;
  } catch { return false; }
}

export async function exportFullBackup(): Promise<BackupData> {
  const [goals, transactions, expenses, budgets, settings] = await Promise.all([
    getAllGoals(), getAllTransactions(), getAllExpenses(), getAllBudgets(), getSettings()
  ]);
  return { version: 3, exportedAt: new Date().toISOString(), goals, transactions, expenses, budgets, settings };
}

export async function importFullBackup(rawJson: string | object): Promise<{ success: boolean; error?: string }> {
  try {
    let parsed: any = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
    if (!parsed || typeof parsed !== "object") return { success: false, error: "Invalid backup format" };
    if (!Array.isArray(parsed.goals)) return { success: false, error: "Invalid backup: goals must be an array" };
    for (const g of parsed.goals) {
      if (!g.id || typeof g.name !== "string" || typeof g.targetAmount !== "number" || isNaN(g.targetAmount)) {
        return { success: false, error: `Invalid goal format: ${g.name || g.id}` };
      }
    }
    const transactions: Transaction[] = Array.isArray(parsed.transactions) ? parsed.transactions : [];
    const expenses: Expense[] = Array.isArray(parsed.expenses) ? parsed.expenses : [];
    const budgets: Budget[] = Array.isArray(parsed.budgets) ? parsed.budgets : [];
    const settings: AppSettings = parsed.settings && typeof parsed.settings === "object"
      ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS;

    const db = await openDB();
    const storeNames = [STORE_GOALS, STORE_TRANSACTIONS, STORE_SETTINGS];
    if (db.objectStoreNames.contains(STORE_EXPENSES)) storeNames.push(STORE_EXPENSES);
    if (db.objectStoreNames.contains(STORE_BUDGETS)) storeNames.push(STORE_BUDGETS);

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeNames, "readwrite");
      tx.objectStore(STORE_GOALS).clear();
      tx.objectStore(STORE_TRANSACTIONS).clear();
      if (db.objectStoreNames.contains(STORE_EXPENSES)) tx.objectStore(STORE_EXPENSES).clear();
      if (db.objectStoreNames.contains(STORE_BUDGETS)) tx.objectStore(STORE_BUDGETS).clear();
      for (const g of parsed.goals) tx.objectStore(STORE_GOALS).put(g);
      for (const t of transactions) tx.objectStore(STORE_TRANSACTIONS).put(t);
      if (db.objectStoreNames.contains(STORE_EXPENSES)) for (const e of expenses) tx.objectStore(STORE_EXPENSES).put(e);
      if (db.objectStoreNames.contains(STORE_BUDGETS)) for (const b of budgets) tx.objectStore(STORE_BUDGETS).put(b);
      tx.objectStore(STORE_SETTINGS).put({ key: "app_settings", value: settings });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to parse backup data" };
  }
}

export async function resetDatabase(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const storeNames = [STORE_GOALS, STORE_TRANSACTIONS, STORE_SETTINGS];
    if (db.objectStoreNames.contains(STORE_EXPENSES)) storeNames.push(STORE_EXPENSES);
    if (db.objectStoreNames.contains(STORE_BUDGETS)) storeNames.push(STORE_BUDGETS);
    const tx = db.transaction(storeNames, "readwrite");
    storeNames.forEach(s => tx.objectStore(s).clear());
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("nest_save_streak");
        localStorage.removeItem("nest_save_badges");
      } catch {}
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}