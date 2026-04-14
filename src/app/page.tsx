"use client";

import { useState, useEffect, useCallback } from "react";
import { MoneyFlowData } from "./types";
import { loadData, saveData, calculateMonthFlow } from "./store";
import CalendarGrid from "./components/CalendarGrid";
import SettingsPanel from "./components/SettingsPanel";
import DayModal from "./components/DayModal";

export default function Home() {
  const [data, setData] = useState<MoneyFlowData | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    setData(loadData());
  }, []);

  const handleChange = useCallback((newData: MoneyFlowData) => {
    setData(newData);
    saveData(newData);
  }, []);

  if (!data) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </main>
    );
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const { days, totalAvailable, monthIncome, monthExpenses } = calculateMonthFlow(data, currentMonth.year, currentMonth.month);

  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function prevMonth() {
    setCurrentMonth((prev) => {
      const m = prev.month === 0 ? 11 : prev.month - 1;
      const y = prev.month === 0 ? prev.year - 1 : prev.year;
      return { year: y, month: m };
    });
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      const m = prev.month === 11 ? 0 : prev.month + 1;
      const y = prev.month === 11 ? prev.year + 1 : prev.year;
      return { year: y, month: m };
    });
  }

  const endBalance = days.length > 0 ? days[days.length - 1].balance : data.startingBalance;
  const totalSpent = days.reduce((s, d) => s + d.expenses, 0);

  return (
    <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          💰 MoneyFlow
        </h1>
        <button
          onClick={() => setShowSettings(true)}
          className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors"
        >
          ⚙️ Setup
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="text-gray-400 hover:text-gray-600 px-3 py-1 text-xl">
          ‹
        </button>
        <h2 className="text-lg font-semibold text-gray-700">{monthName}</h2>
        <button onClick={nextMonth} className="text-gray-400 hover:text-gray-600 px-3 py-1 text-xl">
          ›
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <div className="text-xs text-gray-400">Available</div>
          <div className="text-lg font-bold text-teal-600">${totalAvailable.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <div className="text-xs text-gray-400">Income</div>
          <div className="text-lg font-bold text-emerald-500">+${monthIncome.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <div className="text-xs text-gray-400">Expenses</div>
          <div className="text-lg font-bold text-rose-400">-${monthExpenses.toLocaleString()}</div>
        </div>
      </div>

      {/* Calendar */}
      <CalendarGrid days={days} today={today} onDayClick={setSelectedDate} />

      {/* Footer Balance */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400">End of month balance</div>
            <div className={`text-2xl font-bold ${endBalance >= 0 ? "text-teal-600" : "text-rose-500"}`}>
              ${endBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Spent this month</div>
            <div className="text-lg font-semibold text-rose-400">
              ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400 pb-4">
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-green-600" /> Flush</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-emerald-500" /> Good</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-amber-500" /> Low</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-rose-500" /> Empty</span>
        <span className="mx-1 text-gray-300">|</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Income</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Expense</span>
      </div>

      {/* Modals */}
      {showSettings && <SettingsPanel data={data} onChange={handleChange} onClose={() => setShowSettings(false)} />}
      {selectedDate && <DayModal date={selectedDate} data={data} onChange={handleChange} onClose={() => setSelectedDate(null)} />}
    </main>
  );
}
