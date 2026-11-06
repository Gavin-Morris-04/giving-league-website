import { NextResponse } from "next/server";
import { charities } from "@/data/verified/charities";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Privacy-conscious outbound-link analytics for the Donations page.
 *
 * Stores ONLY an aggregate counter per (day, charity, event type) — no cookies, IP addresses, user agents,
 * referrers or identifiers — because high school students use this site. These counts are internal analytics:
 * they are never shown or labeled as donations. Without Supabase this endpoint accepts and discards events.
 */
const EVENTS = new Set(["donate_click", "learn_more_click", "campaign_click", "corporate_click"]);
const IDS = new Set(charities.map((c) => c.id));

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const { event, charity } = (body ?? {}) as { event?: string; charity?: string };
  if (!event || !charity || !EVENTS.has(event) || !IDS.has(charity)) return new NextResponse(null, { status: 400 });

  if (isSupabaseConfigured()) {
    const db = getSupabaseAdmin();
    const { error } = (await db?.rpc("increment_link_metric", { p_charity_id: charity, p_event: event })) ?? { error: null };
    if (error) console.error("[track] metric not recorded:", error.message);
  }
  return new NextResponse(null, { status: 204 });
}
