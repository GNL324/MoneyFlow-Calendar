export interface Income {
  id: string;
  label: string;
  amount: number;
  type: "recurring" | "one-time";
  /** Day of month for recurring, specific date for one-time (YYYY-MM-DD) */
  day?: number;
  date?: string;
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
