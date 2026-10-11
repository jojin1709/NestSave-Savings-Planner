import { Goal, AppSettings } from "./types";
import {
  formatINR,
  requiredMonthly,
  requiredWeekly,
  requiredDaily,
  savingsCapacity,
  feasibility,
  suggestedDeadline,
  aheadBehindSchedule,
  conflictDetection,
  multiGoalAllocation
} from "./calculations";

export interface AIModelSpec {
  id: string;
  name: string;
  tag: string;
  sizeMB: number;
  requiredStorageMB: number;
  recommendedRAM: string;
  tier: "low" | "medium" | "high" | "pro";
}

export const AI_MODELS: AIModelSpec[] = [
  {
    id: "qwen3-0.6b",
    name: "Qwen3 0.6B Quantized",
    tag: "Ultra-Lightweight",
    sizeMB: 395,
    requiredStorageMB: 500,
    recommendedRAM: "< 4 GB",
    tier: "low"
  },
  {
    id: "gemma3-1b",
    name: "Gemma 3 1B Quantized",
    tag: "Balanced",
    sizeMB: 780,
    requiredStorageMB: 950,
    recommendedRAM: "4 GB",
    tier: "medium"
  },
  {
    id: "qwen3-1.7b-q4",
    name: "Qwen3 1.7B Q4",
    tag: "Recommended",
    sizeMB: 1120,
    requiredStorageMB: 1400,
    recommendedRAM: "6–8 GB",
    tier: "high"
  },
  {
    id: "qwen3-1.7b-q5",
    name: "Qwen3 1.7B Q5 Precision",
    tag: "High Accuracy",
    sizeMB: 1420,
    requiredStorageMB: 1800,
    recommendedRAM: "8+ GB",
    tier: "pro"
  }
];

export function detectDeviceCapability(): {
  deviceMemoryGB: number;
  hardwareConcurrency: number;
  recommendedModel: AIModelSpec;
} {
  let memoryGB = 4; // safe default fallback
  if (typeof navigator !== "undefined" && "deviceMemory" in navigator) {
    memoryGB = (navigator as any).deviceMemory || 4;
  }
  const concurrency = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;

  let recommended = AI_MODELS[1]; // default 4GB Gemma 3 1B
  if (memoryGB < 4) {
    recommended = AI_MODELS[0];
  } else if (memoryGB >= 4 && memoryGB < 8) {
    recommended = AI_MODELS[2];
  } else if (memoryGB >= 8) {
    recommended = AI_MODELS[3];
  }

  return {
    deviceMemoryGB: memoryGB,
    hardwareConcurrency: concurrency,
    recommendedModel: recommended
  };
}

// -------------------------------------------------------------
// DETERMINISTIC INTENT ROUTER & ASSISTANT EXPLANATION ENGINE
// -------------------------------------------------------------
// The LLM NEVER calculates finances.
// It extracts parameters -> calls deterministic TypeScript engine -> returns calculation.
export function answerFinancialQueryLocally(
  query: string,
  context: {
    goals: Goal[];
    settings: AppSettings;
  }
): {
  answer: string;
  sourceFunction: string;
  toolParameters?: Record<string, any>;
  hasSufficientData: boolean;
} {
  const q = query.trim().toLowerCase();
  const { goals, settings } = context;
  const activeGoals = goals.filter(g => g.status === "active");

  const monthlyCapacity = savingsCapacity(
    settings.monthlyIncome || 0,
    settings.fixedMonthlyExpenses || 0,
    settings.otherMonthlySavings || 0,
    settings.safetyBuffer || 0
  );

  // 1. "Can I afford / afford this X by Y?"
  const affordRegex = /afford\s*(?:a|an)?\s*([a-zA-Z0-9\s]+)?(?:for|of)?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i;
  const affordMatch = q.match(affordRegex);
  if (affordMatch || q.includes("afford") || q.includes("can i buy")) {
    const rawAmt = affordMatch ? affordMatch[2]?.replace(/,/g, "") : null;
    const targetAmt = rawAmt ? Number(rawAmt) : null;

    if (!targetAmt) {
      return {
        answer: "I don't have enough information to calculate that. Please specify the target amount (e.g., 'Can I afford ₹80,000 laptop by December?').",
        sourceFunction: "feasibility",
        hasSufficientData: false
      };
    }

    if (monthlyCapacity <= 0) {
      return {
        answer: `I don't have enough financial capacity information to calculate that. Please set your monthly income and fixed expenses in Settings so I can evaluate your real savings capacity against ${formatINR(targetAmt)}.`,
        sourceFunction: "savingsCapacity",
        hasSufficientData: false
      };
    }

    // Default to 6 months horizon if month is not extracted
    const horizonMonths = 6;
    const reqMonthly = Math.ceil(targetAmt / horizonMonths);
    const fit = feasibility(reqMonthly, monthlyCapacity);

    return {
      answer: `To afford ${formatINR(targetAmt)} over ${horizonMonths} months, you would need to save ${formatINR(reqMonthly)}/month. Based on your current monthly capacity of ${formatINR(monthlyCapacity)}/month, this plan is **${fit.verdict}**. ${fit.description}`,
      sourceFunction: "feasibility",
      toolParameters: { targetAmt, horizonMonths, reqMonthly, monthlyCapacity, verdict: fit.verdict },
      hasSufficientData: true
    };
  }

  // 2. "Am I on track?" or "Why am I behind?"
  if (q.includes("on track") || q.includes("behind") || q.includes("pace")) {
    if (activeGoals.length === 0) {
      return {
        answer: "You currently have no active goals in your vault. Create a goal first to evaluate your savings pace.",
        sourceFunction: "aheadBehindSchedule",
        hasSufficientData: false
      };
    }

    const analyses = activeGoals.map(g => ({
      goal: g,
      pace: aheadBehindSchedule(g.targetAmount, g.currentAmount, g.startDate, g.targetDate)
    }));

    const behindGoals = analyses.filter(a => a.pace.status === "behind");
    const aheadGoals = analyses.filter(a => a.pace.status === "ahead");

    if (behindGoals.length > 0) {
      const names = behindGoals.map(b => `"${b.goal.name}" (behind by ${formatINR(Math.abs(b.pace.diffAmount))})`).join(", ");
      return {
        answer: `You are currently behind schedule on: ${names}. To catch up before deadline, consider increasing your weekly contribution or extending the target date.`,
        sourceFunction: "aheadBehindSchedule",
        hasSufficientData: true
      };
    }

    if (aheadGoals.length > 0) {
      return {
        answer: `Great job! You are ahead of schedule on ${aheadGoals.map(a => `"${a.goal.name}"`).join(", ")} by ${formatINR(aheadGoals[0].pace.diffAmount)}. All other active goals are on track.`,
        sourceFunction: "aheadBehindSchedule",
        hasSufficientData: true
      };
    }

    return {
      answer: "All your active goals are currently on track based on elapsed calendar time versus saved amounts.",
      sourceFunction: "aheadBehindSchedule",
      hasSufficientData: true
    };
  }

  // 3. "How much should I save every month?" / "Monthly requirement"
  if (q.includes("how much") && (q.includes("month") || q.includes("monthly") || q.includes("save"))) {
    if (activeGoals.length === 0) {
      return {
        answer: "You have no active goals configured. Once you add goals with target dates, I can calculate your exact monthly requirement.",
        sourceFunction: "requiredMonthly",
        hasSufficientData: false
      };
    }

    const totalRequired = activeGoals.reduce((s, g) => s + requiredMonthly(g.targetAmount, g.currentAmount, g.targetDate), 0);
    const breakdown = activeGoals.map(g => `${g.name}: ${formatINR(requiredMonthly(g.targetAmount, g.currentAmount, g.targetDate))}/mo`).join("; ");

    let response = `Your active goals require a total of **${formatINR(totalRequired)}/month**. (${breakdown}).`;
    if (monthlyCapacity > 0) {
      response += ` Your available capacity is ${formatINR(monthlyCapacity)}/month.`;
      if (totalRequired > monthlyCapacity) {
        response += ` Warning: Requirements exceed capacity by ${formatINR(totalRequired - monthlyCapacity)}/month.`;
      }
    }

    return {
      answer: response,
      sourceFunction: "requiredMonthly",
      hasSufficientData: true
    };
  }

  // 4. "Which goal should I prioritize?" / "Priority"
  if (q.includes("prioritize") || q.includes("priority") || q.includes("allocation")) {
    if (activeGoals.length === 0) {
      return {
        answer: "There are no active goals to prioritize. Add your goals and set priority tiers (Critical, High, Medium, Low).",
        sourceFunction: "multiGoalAllocation",
        hasSufficientData: false
      };
    }

    if (monthlyCapacity <= 0) {
      return {
        answer: "I don't have enough capacity data to calculate exact priority splits. Please enter your monthly income and fixed expenses in Settings.",
        sourceFunction: "multiGoalAllocation",
        hasSufficientData: false
      };
    }

    const allocations = multiGoalAllocation(activeGoals, monthlyCapacity);
    const text = allocations.map(a => `• **${a.goalName}** (${a.priority}): ${formatINR(a.suggestedMonthlyAllocation)}/mo (${a.sharePercent}%)`).join("\n");

    return {
      answer: `Based on your ${formatINR(monthlyCapacity)}/month available surplus, here is the weighted priority allocation:\n\n${text}`,
      sourceFunction: "multiGoalAllocation",
      hasSufficientData: true
    };
  }

  // 5. Default Fallback
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return {
    answer: `You have saved **${formatINR(totalSaved)}** towards a total target of **${formatINR(totalTarget)}** across ${goals.length} goal${goals.length === 1 ? "" : "s"}. You can ask me questions like:\n• "How much should I save every month?"\n• "Am I on track?"\n• "Which goal should I prioritize?"\n• "Can I afford ₹50,000 by December?"`,
    sourceFunction: "summary",
    hasSufficientData: true
  };
}
