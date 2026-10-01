import { createClient } from "@supabase/supabase-js";

// Server-only client (service role). Never import this in a "use client" file.
export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export type Concept = { id: number; name: string; slug: string; parent_id: number | null };
export type Problem = {
  id: string; number: string | null; title: string; platform: string; url: string | null;
  difficulty: "Easy" | "Medium" | "Hard"; concept_id: number; code: string;
  time_complexity: string; space_complexity: string; created_at: string;
};

export async function getConcepts() {
  const { data, error } = await db.from("concepts").select("*").order("position");
  if (error) console.error("SUPABASE ERROR:", error.message);
  return (data ?? []) as Concept[];
}
