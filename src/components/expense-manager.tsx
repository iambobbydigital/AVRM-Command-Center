"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ExpenseSource {
  id: number;
  name: string;
  description: string;
}

interface ExpenseEntry {
  source_id: number;
  month: string;
  amount: number;
}

export function ExpenseManager() {
  const [sources, setSources] = useState<ExpenseSource[]>([]);
  const [expenses, setExpenses] = useState<Record<string, Record<number, number>>>({});
  const [loading, setLoading] = useState(true);

  // Generate last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7) + "-01";
  }).reverse();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch sources
      const sourcesRes = await fetch("/api/finance/sources");
      const sourcesData = await sourcesRes.json();
      if (sourcesData.success) {
        setSources(sourcesData.data);
      }

      // Fetch expenses
      const expensesRes = await fetch("/api/finance/expenses");
      const expensesData = await expensesRes.json();
      if (expensesData.success) {
        // Transform to nested map: month -> sourceId -> amount
        const expenseMap: Record<string, Record<number, number>> = {};
        expensesData.data.entries.forEach((e: any) => {
          if (!expenseMap[e.month]) expenseMap[e.month] = {};
          expenseMap[e.month][e.source_id] = e.amount;
        });
        setExpenses(expenseMap);
      }
    } catch (error) {
      console.error("Error fetching expense data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveExpense(sourceId: number, month: string, amount: number) {
    try {
      const response = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, month, amount }),
      });

      if (response.ok) {
        // Update local state
        setExpenses((prev) => ({
          ...prev,
          [month]: { ...prev[month], [sourceId]: amount },
        }));
      }
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  }

  if (loading) {
    return <div className="text-neutral-400">Loading expenses...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Monthly Expense Tracking</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="text-left p-2 text-neutral-400">Expense Source</th>
              {months.map((month) => (
                <th key={month} className="text-right p-2 text-neutral-400">
                  {new Date(month).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-b border-neutral-800">
                <td className="p-2 text-white">{source.name}</td>
                {months.map((month) => (
                  <td key={month} className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-20 text-right bg-neutral-900 border-neutral-700 text-white"
                      value={expenses[month]?.[source.id] || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = parseFloat(e.target.value) || 0;
                        saveExpense(source.id, month, value);
                      }}
                      placeholder="0"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        onClick={() => {
          const name = prompt("New expense source name:");
          if (name) {
            fetch("/api/finance/sources", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, isRecurring: true }),
            }).then(() => fetchData());
          }
        }}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Add Expense Source
      </Button>
    </div>
  );
}
