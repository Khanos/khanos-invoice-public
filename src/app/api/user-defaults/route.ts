import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserDefaultsFromDb, saveUserDefaults } from "@/lib/db";
import { mergeWithPlaceholderDefaults } from "@/lib/userDefaults";
import { parseInvoiceData } from "@/lib/invoiceValidation";
import { logServerError } from "@/lib/serverErrors";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const defaults = await getUserDefaultsFromDb(user.id);
    return NextResponse.json(mergeWithPlaceholderDefaults(defaults), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    logServerError("Error fetching user defaults", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const data = parseInvoiceData(body);
    if (!data) {
      return NextResponse.json({ error: "Invalid invoice defaults" }, { status: 400 });
    }
    if (!(await saveUserDefaults(user.id, data))) {
      return NextResponse.json({ error: "Failed to save defaults" }, { status: 500 });
    }
    return NextResponse.json(mergeWithPlaceholderDefaults(data), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    logServerError("Error saving user defaults", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
