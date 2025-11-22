import { ExpenseManager } from "@/components/expense-manager";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-neutral-400">Manage expense tracking and property filters</p>
      </div>

      <ExpenseManager />

      {/* TODO: Add Hostaway property filter management here */}
    </div>
  );
}
