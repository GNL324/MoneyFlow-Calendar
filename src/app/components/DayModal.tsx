"use client";

import { useState } from "react";
import { MoneyFlowData } from "../types";
import { uid } from "../store";

interface Props {
  date: string;
  data: MoneyFlowData;
  onChange: (data: MoneyFlowData) => void;
  onClose: () => void;
}

export default function DayModal({ date, data, onChange, onClose }: Props) {
  const entry = data.dayEntries[date];
  const [expenses, setExpenses] = useState(entry?.expenses ?? []);
  const [income, setIncome] = useState(entry?.income ?? 0);
  const [newLabel, setNewLabel] = useState("");
  const [newAmount, setNewAmount] = useState("");

  function addExpense() {
    if (!newLabel || !newAmount) return;
    setExpenses([...expenses, { label: newLabel, amount: parseFloat(newAmount) }]);
    setNewLabel("");
    setNewAmount("");
  }

  function removeExpense(idx: number) {
    setExpenses(expenses.filter((_, i) => i !== idx));
  }

  function save() {
    const updated = { ...data };
    if (expenses.length > 0 || income > 0) {
      updated.dayEntries = {
        ...updated.dayEntries,
        [date]: { date, income, expenses },
      };
    } else {
      delete updated.dayEntries[date];
    }
    onChange(updated);
    onClose();
  }

  const dateObj = new Date(date + "T12:00:00");
  const formatted = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">{formatted}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Income */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Income for this day</label>
            <input
              type="number"
              value={income || ""}
              onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
              placeholder="0.00"
            />
          </div>

          {/* Expenses */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Expenses</label>
            <div className="space-y-2 mb-2">
              {expenses.map((exp, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                  <span className="text-white">{exp.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400">-${exp.amount.toFixed(2)}</span>
                    <button onClick={() => removeExpense(i)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                placeholder="What did you buy?"
              />
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-24 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                placeholder="$"
              />
              <button onClick={addExpense} className="bg-rose-600 hover:bg-rose-500 px-3 py-2 rounded-lg text-sm font-medium">
                +
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-800 rounded-lg p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Day total:</span>
              <span className={income - expenses.reduce((s, e) => s + e.amount, 0) >= 0 ? "text-emerald-400" : "text-rose-400"}>
                ${(income - expenses.reduce((s, e) => s + e.amount, 0)).toFixed(2)}
              </span>
            </div>
          </div>

          <button onClick={save} className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-bold text-lg">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
