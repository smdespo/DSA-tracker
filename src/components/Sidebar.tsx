import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Code2, LayoutDashboard, ListChecks, LogOut, Plus, Search } from "lucide-react";
import { useAuth } from "../auth";
import { getConcepts } from "../lib/data";
import { getSupabase } from "../lib/supabase";
import type { Concept } from "../lib/types";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-2 py-1.5 text-sm hover:bg-white/5 hover:text-white ${
    isActive ? "text-white" : "text-slate-400"
  }`;

export default function Sidebar() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getConcepts()
      .then((data) => {
        if (active) setConcepts(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load concepts.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function signOut() {
    try {
      const { error: signOutError } = await getSupabase().auth.signOut();
      if (signOutError) throw signOutError;
      navigate("/login", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign out.");
    }
  }

  const tops = concepts.filter((concept) => !concept.parent_id);
  return (
    <aside className="hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-white/10 bg-[#0d1016] p-4 md:block">
      <Link to="/" className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
        <Code2 className="h-5 w-5 text-indigo-400" /> DSA
      </Link>
      <nav className="space-y-0.5">
        <NavLink to="/" end className={linkClass}><span className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />Dashboard</span></NavLink>
        <NavLink to="/problems" className={linkClass}><span className="flex items-center gap-2"><ListChecks className="h-4 w-4" />Problems</span></NavLink>
        <NavLink to="/search" className={linkClass}><span className="flex items-center gap-2"><Search className="h-4 w-4" />Search</span></NavLink>
      </nav>
      <Link to="/problems/new" className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500">
        <Plus className="h-4 w-4" /> Add problem
      </Link>
      <div className="mb-1 mt-6 px-2 text-xs text-slate-500">Concepts</div>
      {error && <p role="alert" className="px-2 py-1 text-xs text-rose-400">{error}</p>}
      {tops.map((concept) => {
        const children = concepts.filter((item) => item.parent_id === concept.id);
        return children.length ? (
          <details key={concept.id}>
            <summary className="block cursor-pointer list-none rounded-md px-2 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
              <Link to={`/concepts/${concept.slug}`}>{concept.name}</Link>
            </summary>
            <div className="ml-3 border-l border-white/10 pl-2">
              {children.map((child) => <Link key={child.id} to={`/concepts/${child.slug}`} className="block rounded-md px-2 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white">{child.name}</Link>)}
            </div>
          </details>
        ) : <Link key={concept.id} to={`/concepts/${concept.slug}`} className="block rounded-md px-2 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white">{concept.name}</Link>;
      })}
      <div className="mt-6 truncate px-2 text-xs text-slate-500" title={session?.user.email ?? ""}>{session?.user.email}</div>
      <button type="button" onClick={signOut} className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </aside>
  );
}
