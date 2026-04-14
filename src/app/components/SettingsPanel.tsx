"use client";

import { useState } from "react";
import { MoneyFlowData, Income, Expense } from "../types";
import { uid } from "../store";

interface Props {
  data: MoneyFlowData;
  onChange: (data: MoneyFlowData) => void;
  onClose: () => void;
}

type Tab = "income" | "expenses" | "settings";

export default function SettingsPanel({ data, onChange, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("settings");
  const [newIncome, setNewIncome] = useState({ label: "", amount: "", day: "1", type: "recurring" as "recurring" | "one-time" });
  const [newExpense, setNewExpense] = useState({ label: "", amount: "", day: "1", type: "recurring" as "recurring" | "one-time" });
  const [balance, setBalance] = useState(String(data.startingBalance));

  const tabs: { key: Tab; label: string }[] = [
    { key: "settings", label: "⚙️ Settings" },
    { key: "income", label: "💰 Income" },
    { key: "expenses", label: "💸 Expenses" },
  ];

  function addIncome() {
    if (!newIncome.label || !newIncome.amount) return;
    const income: Income = {
      id: uid(),
      label: newIncome.label,
      amount: parseFloat(newIncome.amount),
      type: newIncome.type,
      day: newIncome.type === "recurring" ? parseInt(newIncome.day) : undefined,
    };
    onChange({ ...data, incomes: [...data.incomes, income] });
    setNewIncome({ label: "", amount: "", day: "1", type: "recurring" });
  }

  function addExpense() {
    if (!newExpense.label || !newExpense.amount) return;
    const expense: Expense = {
      id: uid(),
      label: newExpense.label,
      amount: parseFloat(newExpense.amount),
      type: newExpense.type,
      day: newExpense.type === "recurring" ? parseInt(newExpense.day) : undefined,
    };
    onChange({ ...data, recurringExpenses: [...data.recurringExpenses, expense] });
    setNewExpense({ label: "", amount: "", day: "1", type: "recurring" });
  }

  function removeIncome(id: string) {
    onChange({ ...data, incomes: data.incomes.filter((i) => i.id !== id) });
  }

  function removeExpense(id: string) {
    onChange({ ...data, recurringExpenses: data.recurringExpenses.filter((e) => e.id !== id) });
  }

  function saveBalance() {
    onChange({ ...data, startingBalance: parseFloat(balance) || 0 });
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">MoneyFlow Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-sm font-medium ${tab === t.key ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {/* Settings Tab */}
          {tab === "settings" && (
            <div className="space-y-3">
              <label className="block text-sm text-gray-300">Starting Balance (current bank)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="0.00"
                />
                <button onClick={saveBalance} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-medium">
                  Save
                </button>
              </div>
              <p className="text-xs text-gray-500">This is your balance at the start of the month. The calendar fills based on this + income - expenses.</p>
            </div>
          )}

          {/* Income Tab */}
          {tab === "income" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newIncome.label}
                  onChange={(e) => setNewIncome({ ...newIncome, label: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="Income label (e.g. Paycheck)"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="Amount"
                  />
                  <select
                    value={newIncome.type}
                    onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value as "recurring" | "one-time" })}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="recurring">Monthly</option>
                    <option value="one-time">One-time</option>
                  </select>
                </div>
                {newIncome.type === "recurring" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Day of month:</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={newIncome.day}
                      onChange={(e) => setNewIncome({ ...newIncome, day: e.target.value })}
                      className="w-20 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                )}
                <button onClick={addIncome} className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded-lg font-medium">
                  + Add Income
                </button>
              </div>

              {data.incomes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Current Income</h3>
                  {data.incomes.map((inc) => (
                    <div key={inc.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-white">{inc.label}</span>
                        <span className="text-emerald-400 ml-2">${inc.amount.toLocaleString()}</span>
                        <span className="text-gray-500 ml-2 text-xs">
                          {inc.type === "recurring" ? `Day ${inc.day}` : "One-time"}
                        </span>
                      </div>
                      <button onClick={() => removeIncome(inc.id)} className="text-red-400 hover:text-red-300 text-sm">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Expenses Tab */}
          {tab === "expenses" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newExpense.label}
                  onChange={(e) => setNewExpense({ ...newExpense, label: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="Expense label (e.g. Rent)"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="Amount"
                  />
                  <select
                    value={newExpense.type}
                    onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value as "recurring" | "one-time" })}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="recurring">Monthly</option>
                    <option value="one-time">One-time</option>
                  </select>
                </div>
                {newExpense.type === "recurring" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Day of month:</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={newExpense.day}
                      onChange={(e) => setNewExpense({ ...newExpense, day: e.target.value })}
                      className="w-20 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                )}
                <button onClick={addExpense} className="w-full bg-rose-600 hover:bg-rose-500 py-2 rounded-lg font-medium">
                  + Add Expense
                </button>
              </div>

              {data.recurringExpenses.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Recurring Expenses</h3>
                  {data.recurringExpenses.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-white">{exp.label}</span>
                        <span className="text-rose-400 ml-2">-${exp.amount.toLocaleString()}</span>
                        <span className="text-gray-500 ml-2 text-xs">
                          {exp.type === "recurring" ? `Day ${exp.day}` : "One-time"}
                        </span>
                      </div>
                      <button onClick={() => removeExpense(exp.id)} className="text-red-400 hover:text-red-300 text-sm">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
