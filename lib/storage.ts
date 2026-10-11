import { Goal, Transaction, AppSettings, BackupData } from "./types";

const DB_NAME = "nest_save_vault";
const DB_VERSION = 3;

const STORE_GOALS = "goals";
const STORE_TRANSACTIONS = "transactions";
const STORE_SETTINGS = "settings";

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  currency: "INR",
  notificationsEnabled: true,
  aiEnabled: false,
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(new Error("IndexedDB is not supported in this environment"));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      // Create object stores if not present
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
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
  });
}

// -------------------------------------------------------------
// GOAL CRUD OPERATIONS
// -------------------------------------------------------------
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
    const updatedGoal: Goal = {
      ...goal,
      updatedAt: new Date().toISOString()
    };
    store.put(updatedGoal);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    // Delete goal and all associated transactions
    const tx = db.transaction([STORE_GOALS, STORE_TRANSACTIONS], "readwrite");
    const goalStore = tx.objectStore(STORE_GOALS);
    const txStore = tx.objectStore(STORE_TRANSACTIONS);

    goalStore.delete(id);

    // Delete associated transactions
    const index = txStore.index("goalId");
    const req = index.openCursor(IDBKeyRange.only(id));
    req.onsuccess = (e: any) => {
      const cursor = e.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// -------------------------------------------------------------
// TRANSACTION CRUD OPERATIONS
// -------------------------------------------------------------
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
      if (!goal) {
        return reject(new Error("Goal not found"));
      }

      if (txData.type === "withdrawal" && txData.amount > goal.currentAmount) {
        return reject(new Error("Withdrawal amount cannot exceed available goal balance"));
      }

      const newCurrentAmount = Math.max(
        0,
        txData.type === "deposit"
          ? goal.currentAmount + txData.amount
          : goal.currentAmount - txData.amount
      );

      const isCompleted = newCurrentAmount >= goal.targetAmount;
      const updatedGoal: Goal = {
        ...goal,
        currentAmount: newCurrentAmount,
        status: isCompleted ? "completed" : goal.status === "completed" ? "active" : goal.status,
        updatedAt: new Date().toISOString()
      };

      const newTx: Transaction = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
        goalId: goal.id,
        type: txData.type,
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

// -------------------------------------------------------------
// SETTINGS
// -------------------------------------------------------------
export async function getSettings(): Promise<AppSettings> {
  let fallback: AppSettings = DEFAULT_SETTINGS;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("nest_save_settings");
      if (raw) {
        fallback = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch {
      // ignore
    }
  }

  try {
    const db = await openDB();
    if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
      return fallback;
    }
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, "readonly");
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.get("app_settings");
      req.onsuccess = () => {
        if (req.result && req.result.value) {
          resolve({ ...DEFAULT_SETTINGS, ...fallback, ...req.result.value });
        } else {
          resolve(fallback);
        }
      };
      req.onerror = () => resolve(fallback);
    });
  } catch {
    return fallback;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("nest_save_settings", JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  try {
    const db = await openDB();
    if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
      return;
    }
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, "readwrite");
      const store = tx.objectStore(STORE_SETTINGS);
      store.put({ key: "app_settings", value: settings });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve(); // Graceful resolve
    });
  } catch (err) {
    console.warn("IndexedDB saveSettings fallback to localStorage:", err);
  }
}

// -------------------------------------------------------------
// BACKUP & RESTORE
// -------------------------------------------------------------
export async function exportFullBackup(): Promise<BackupData> {
  const [goals, transactions, settings] = await Promise.all([
    getAllGoals(),
    getAllTransactions(),
    getSettings()
  ]);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    goals,
    transactions,
    settings
  };
}

export async function importFullBackup(rawJson: string | object): Promise<{ success: boolean; error?: string }> {
  try {
    let parsed: any;
    if (typeof rawJson === "string") {
      parsed = JSON.parse(rawJson);
    } else {
      parsed = rawJson;
    }

    if (!parsed || typeof parsed !== "object") {
      return { success: false, error: "Invalid backup format: Not a JSON object" };
    }

    if (!Array.isArray(parsed.goals)) {
      return { success: false, error: "Invalid backup format: 'goals' must be an array" };
    }

    // Validate goals schema
    for (const g of parsed.goals) {
      if (!g.id || typeof g.name !== "string" || typeof g.targetAmount !== "number" || isNaN(g.targetAmount)) {
        return { success: false, error: `Invalid goal format detected: ${g.name || g.id}` };
      }
    }

    // Validate transactions schema if present
    const transactions: Transaction[] = Array.isArray(parsed.transactions) ? parsed.transactions : [];
    for (const t of transactions) {
      if (!t.id || !t.goalId || typeof t.amount !== "number" || isNaN(t.amount)) {
        return { success: false, error: "Invalid transaction format detected in backup" };
      }
    }

    const settings: AppSettings = parsed.settings && typeof parsed.settings === "object"
      ? { ...DEFAULT_SETTINGS, ...parsed.settings }
      : DEFAULT_SETTINGS;

    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_GOALS, STORE_TRANSACTIONS, STORE_SETTINGS], "readwrite");
      const goalStore = tx.objectStore(STORE_GOALS);
      const txStore = tx.objectStore(STORE_TRANSACTIONS);
      const settingsStore = tx.objectStore(STORE_SETTINGS);

      // Clear existing
      goalStore.clear();
      txStore.clear();

      for (const g of parsed.goals) {
        goalStore.put(g);
      }
      for (const t of transactions) {
        txStore.put(t);
      }
      settingsStore.put({ key: "app_settings", value: settings });

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
    const tx = db.transaction([STORE_GOALS, STORE_TRANSACTIONS, STORE_SETTINGS], "readwrite");
    tx.objectStore(STORE_GOALS).clear();
    tx.objectStore(STORE_TRANSACTIONS).clear();
    tx.objectStore(STORE_SETTINGS).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}