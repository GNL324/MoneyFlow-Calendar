export interface Income {
  id: string;
  label: string;
  amount: number;
  /** Frequency of income */
  frequency: "weekly" | "biweekly" | "monthly" | "one-time";
  /** Day of month for monthly (1-31) */
  day?: number;
  /** Day of week for weekly/biweekly (0=Sun, 1=Mon, ..., 6=Sat) */
  weekday?: number;
  /** Specific date for one-time (YYYY-MM-DD) */
  date?: string;
  /** @deprecated Legacy field for migration from old "recurring" type */
  type?: string;
}

export interface Expense {
  id: string;
  label: string;
  amount: number;
  type: "recurring" | "one-time";
  /** Day of month for recurring */
  day?: number;
  date?: string;
}

export interface DayEntry {
  date: string; // YYYY-MM-DD
  income: number;
  expenses: { label: string; amount: number }[];
}

export interface MoneyFlowData {
  incomes: Income[];
  recurringExpenses: Expense[];
  dayEntries: Record<string, DayEntry>; // keyed by YYYY-MM-DD
  startingBalance: number;
}