import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import type { ApiResponse } from "@/types";

interface ExpenseEntry {
  id: number;
  month: string;
  amount: number;
  source_name: string;
  notes: string;
}

// GET: Fetch expenses for TTM or specific time range
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get("months") || "12");

    const supabase = createClient();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const startMonth = startDate.toISOString().slice(0, 7) + "-01";

    // Fetch expense entries with source names
    const { data: expenses, error } = await supabase
      .from("expense_entries")
      .select(`
        id,
        month,
        amount,
        notes,
        expense_sources (
          name
        )
      `)
      .gte("month", startMonth)
      .order("month", { ascending: false });

    if (error) throw error;

    // Transform data
    const entries: ExpenseEntry[] = (expenses || []).map((e: any) => ({
      id: e.id,
      month: e.month,
      amount: parseFloat(e.amount),
      source_name: e.expense_sources?.name || "Unknown",
      notes: e.notes || "",
    }));

    // Calculate TTM total
    const ttmTotal = entries.reduce((sum, e) => sum + e.amount, 0);

    // Group by month for charts
    const byMonth = entries.reduce((acc: Record<string, number>, e) => {
      acc[e.month] = (acc[e.month] || 0) + e.amount;
      return acc;
    }, {});

    // Group by source for breakdown
    const bySource = entries.reduce((acc: Record<string, number>, e) => {
      acc[e.source_name] = (acc[e.source_name] || 0) + e.amount;
      return acc;
    }, {});

    const result: ApiResponse<any> = {
      data: {
        ttmTotal,
        entries,
        byMonth,
        bySource,
      },
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching expenses:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to fetch expenses",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}

// POST: Add or update expense entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceId, month, amount, notes } = body;

    if (!sourceId || !month || amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("expense_entries")
      .upsert(
        {
          source_id: sourceId,
          month,
          amount: parseFloat(amount),
          notes,
        },
        { onConflict: "source_id,month" }
      )
      .select()
      .single();

    if (error) throw error;

    const result: ApiResponse<typeof data> = {
      data,
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error saving expense entry:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to save expense",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}
