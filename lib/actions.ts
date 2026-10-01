"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function saveProblem(fd: FormData) {
  const g = (k: string) => String(fd.get(k) ?? "").trim();
  const row = {
    number: g("number") || null,
    title: g("title"),
    platform: g("platform"),
    url: g("url") || null,
    difficulty: g("difficulty"),
    concept_id: Number(g("concept_id")),
    code: String(fd.get("code") ?? ""),
    time_complexity: g("time_complexity"),
    space_complexity: g("space_complexity"),
  };
  const id = g("id");
  const { data, error } = id
    ? await db.from("problems").update(row).eq("id", id).select("id").single()
    : await db.from("problems").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect(`/problems/${data.id}`);
}

export async function deleteProblem(fd: FormData) {
  await db.from("problems").delete().eq("id", String(fd.get("id")));
  revalidatePath("/", "layout");
  redirect("/problems");
}
