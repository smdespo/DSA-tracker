import Link from "next/link";
import { LayoutDashboard, ListChecks, Search, Plus, Code2 } from "lucide-react";
import { getConcepts } from "@/lib/db";

export default async function Sidebar() {
  const all = await getConcepts();
  const tops = all.filter((c) => !c.parent_id);
  const nav = [
    { href: "/", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/problems", label: "Problems", Icon: ListChecks },
    { href: "/search", label: "Search", Icon: Search },
  ];
  const link = "block rounded-md px-2 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white";
  return (
    <aside className="hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-white/10 bg-[#0d1016] p-4 md:block">
      <Link href="/" className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
        <Code2 className="h-5 w-5 text-indigo-400" /> DSA
      </Link>
      <nav className="space-y-0.5">
        {nav.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={`${link} flex items-center gap-2`}><Icon className="h-4 w-4" />{label}</Link>
        ))}
      </nav>
      <Link href="/problems/new" className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500">
        <Plus className="h-4 w-4" /> Add problem
      </Link>
      <div className="mb-1 mt-6 px-2 text-xs text-slate-500">Concepts</div>
      {tops.map((t) => {
        const kids = all.filter((c) => c.parent_id === t.id);
        return kids.length ? (
          <details key={t.id}>
            <summary className={`${link} cursor-pointer list-none`}>
              <Link href={`/concepts/${t.slug}`}>{t.name}</Link>
            </summary>
            <div className="ml-3 border-l border-white/10 pl-2">
              {kids.map((k) => <Link key={k.id} href={`/concepts/${k.slug}`} className={link}>{k.name}</Link>)}
            </div>
          </details>
        ) : <Link key={t.id} href={`/concepts/${t.slug}`} className={link}>{t.name}</Link>;
      })}
    </aside>
  );
}
