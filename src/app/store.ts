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

export function loadData(): MoneyFlowData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw) as MoneyFlowData;
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

  // The maxBalance is the total planned expenses — 100% = "enough to cover all planned expenses"
  const maxRef = totalPlanned > 0 ? totalPlanned : (data.startingBalance + data.incomes
    .filter((i) => {
      if (i.type === "recurring") return true;
      if (i.date) return i.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`);
      return false;
    })
    .reduce((sum, i) => sum + i.amount, 0)) || 1;

  let runningBalance = data.startingBalance;

  const monthIncome = data.incomes
    .filter((i) => {
      if (i.type === "recurring") return true;
      if (i.date) return i.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`);
      return false;
    })
    .reduce((sum, i) => sum + i.amount, 0);

  const monthPlannedExpenses = totalPlanned;

  let totalUnplanned = 0;

  for (const date of days) {
    const dayNum = parseInt(date.split("-")[2]);

    // Income for this day
    const dayIncome = data.incomes
      .filter((i) => {
        if (i.type === "recurring" && i.day === dayNum) return true;
        if (i.type === "one-time" && i.date === date) return true;
        return false;
      })
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

    // fillPct: 100% = planned expenses covered. Above 100% means surplus.
    // Below 100% = balance can't cover all planned expenses.
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