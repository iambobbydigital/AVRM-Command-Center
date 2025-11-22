import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import type { ApiResponse } from "@/types";

interface ExpenseSource {
  id: number;
  name: string;
  description: string;
  is_recurring: boolean;
  is_active: boolean;
}

// GET: Fetch all expense sources
export async function GET() {
  try {
    const supabase = createClient();

    const { data: sources, error } = await supabase
      .from("expense_sources")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;

    const result: ApiResponse<ExpenseSource[]> = {
      data: sources || [],
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching expense sources:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to fetch sources",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}

// POST: Create new expense source
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, isRecurring } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required", success: false },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("expense_sources")
      .insert({
        name,
        description: description || "",
        is_recurring: isRecurring ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    const result: ApiResponse<ExpenseSource> = {
      data,
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating expense source:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to create source",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}
