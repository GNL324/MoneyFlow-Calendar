"use client";

import { MoneyFlowData, Income, Expense, DayEntry } from "./types";

const STORAGE_KEY = "moneyflow-data";

export function getDefaultData(): MoneyFlowData {
  return {
    incomes: [],
    recurringExpenses: [],
    dayEntries: {},
    startingBalance: 0,
  };
}

/** Migrate old income format (type: "recurring" | "one-time") to new frequency field */
function migrateIncomes(incomes: Income[]): Income[] {
  return incomes.map((inc) => {
    if (!inc.frequency && inc.type) {
      // Old format: migrate
      const migrated: Income = {
        id: inc.id,
        label: inc.label,
        amount: inc.amount,
        frequency: inc.type === "recurring" ? "monthly" : "one-time",
        day: inc.day,
        date: inc.date,
      };
      return migrated;
    }
    return inc;
  });
}

export function loadData(): MoneyFlowData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const data = JSON.parse(raw) as MoneyFlowData;
    // Auto-migrate old income format
    data.incomes = migrateIncomes(data.incomes);
    return data;
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: MoneyFlowData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Get all days in a month as YYYY-MM-DD strings */
export function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const count = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= count; d++) {
    days.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  return days;
}

/** Check if a specific date is a payday for a given income frequency */
function isPayday(income: Income, dateStr: string, year: number, month: number, dayNum: number): boolean {
  if (income.frequency === "monthly") {
    return income.day === dayNum;
  }

  if (income.frequency === "one-time") {
    return income.date === dateStr;
  }

  // Weekly or biweekly — check day of week
  if (income.weekday === undefined) return false;
  const dateObj = new Date(dateStr + "T12:00:00");
  const dow = dateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (dow !== income.weekday) return false;

  if (income.frequency === "weekly") {
    return true;
  }

  // Biweekly: need a reference start date to determine which weeks are pay weeks
  // We'll use the first occurrence of that weekday in the month as the anchor
  // Count weeks from the start of the year using the income's day field as the start-of-month day
  // For biweekly, we use Jan 1 of the year as the reference point
  // If income.day is set, use that as the "first payday of the month" anchor (1-31)
  // Otherwise default to the 1st occurrence of the weekday

  // Calculate day-of-year for this date
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((dateObj.getTime() - startOfYear.getTime()) / 86400000);

  // Use the income's 'day' field as the first-payday-of-month offset if available
  // Otherwise just use week parity from start of year
  // Simple approach: even weeks = pay week. Use day field to shift parity if set.
  const weekNum = Math.floor(dayOfYear / 7);
  const parityOffset = income.day ? (income.day % 2) : 0;
  return (weekNum + parityOffset) % 2 === 0;
}

/** Calculate the cumulative balance for each day of the month */
export function calculateMonthFlow(data: MoneyFlowData, year: number, month: number) {
  const days = getDaysInMonth(year, month);
  const results: { date: string; day: number; income: number; plannedExpenses: number; unplannedExpenses: number; expenses: number; balance: number; fillPct: number }[] = [];

  // Total planned expenses for the month — this is our 100% reference
  const totalPlanned = data.recurringExpenses
    .filter((e) => {
      if (e.type === "recurring") return true;
      if (e.date) return e.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`);
      return false;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // Calculate total month income for summary (estimate weekly/biweekly occurrences)
  let monthIncome = 0;
  for (const date of days) {
    const dayNum = parseInt(date.split("-")[2]);
    for (const inc of data.incomes) {
      if (isPayday(inc, date, year, month, dayNum)) {
        monthIncome += inc.amount;
      }
    }
  }

  // maxRef: 100% = can cover all planned expenses
  const maxRef = totalPlanned > 0 ? totalPlanned : (data.startingBalance + monthIncome) || 1;

  let runningBalance = data.startingBalance;
  const monthPlannedExpenses = totalPlanned;
  let totalUnplanned = 0;

  for (const date of days) {
    const dayNum = parseInt(date.split("-")[2]);

    // Income for this day using frequency-aware check
    const dayIncome = data.incomes
      .filter((inc) => isPayday(inc, date, year, month, dayNum))
      .reduce((sum, i) => sum + i.amount, 0);

    // Planned (recurring) expenses for this day
    const dayPlannedExpenses = data.recurringExpenses
      .filter((e) => {
        if (e.type === "recurring" && e.day === dayNum) return true;
        if (e.type === "one-time" && e.date === date) return true;
        return false;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    // Unplanned expenses (manual day entries)
    const entry = data.dayEntries[date];
    const dayUnplannedExpenses = entry ? entry.expenses.reduce((s, e) => s + e.amount, 0) : 0;
    const manualIncome = entry ? entry.income : 0;

    totalUnplanned += dayUnplannedExpenses;

    const totalIncome = dayIncome + manualIncome;
    const totalExpenses = dayPlannedExpenses + dayUnplannedExpenses;

    runningBalance += totalIncome - totalExpenses;

    const fillPct = maxRef > 0 ? (runningBalance / maxRef) * 100 : 0;

    results.push({
      date,
      day: dayNum,
      income: totalIncome,
      plannedExpenses: dayPlannedExpenses,
      unplannedExpenses: dayUnplannedExpenses,
      expenses: totalExpenses,
      balance: runningBalance,
      fillPct,
    });
  }

  const totalAvailable = data.startingBalance + monthIncome;

  return {
    days: results,
    totalAvailable,
    monthIncome,
    monthPlannedExpenses,
    monthUnplannedExpenses: totalUnplanned,
    maxRef,
  };
}