create table if not exists concepts (
  id serial primary key,
  name text not null,
  slug text not null unique,
  parent_id int references concepts(id) on delete cascade,
  position int not null default 0
);

create table if not exists problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  number text,
  title text not null,
  platform text not null default 'LeetCode',
  url text,
  difficulty text not null default 'Medium' check (difficulty in ('Easy','Medium','Hard')),
  concept_id int not null references concepts(id),
  code text not null default '',
  time_complexity text not null default '',
  space_complexity text not null default '',
  created_at timestamptz not null default now()
);
alter table public.problems
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists problems_concept_idx on problems(concept_id);

alter table concepts enable row level security;
alter table problems enable row level security;

drop policy if exists concepts_authenticated_select on public.concepts;
create policy concepts_authenticated_select
  on public.concepts for select to authenticated
  using (true);

drop policy if exists problems_owner_select on public.problems;
create policy problems_owner_select
  on public.problems for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists problems_owner_insert on public.problems;
create policy problems_owner_insert
  on public.problems for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists problems_owner_update on public.problems;
create policy problems_owner_update
  on public.problems for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists problems_owner_delete on public.problems;
create policy problems_owner_delete
  on public.problems for delete to authenticated
  using (user_id = (select auth.uid()));

grant select on public.concepts to authenticated;
grant select, insert, update, delete on public.problems to authenticated;
grant usage, select on sequence public.concepts_id_seq to authenticated;

-- Seed concepts: first item = parent, rest = subtopics
do $$
declare grp jsonb; pid int; pos int := 0; sub text;
  data jsonb := '[
    ["Arrays"],["Strings"],["Hashing"],["Two Pointers"],["Sliding Window"],["Stack"],
    ["Queue","Normal Queue","Priority Queue","Deque"],
    ["Linked List"],["Binary Search"],["Recursion"],["Backtracking"],
    ["Trees","Binary Tree","BST","Traversals"],
    ["Graphs","BFS","DFS","Cycle Detection","Topological Sort","Dijkstra","MST","DSU"],
    ["Greedy"],["Heap"],["Trie"],["Bit Manipulation"],
    ["Dynamic Programming","1D DP","2D DP","Grid DP","Knapsack","LIS","LCS","Partition DP","DP on Trees"],
    ["Segment Tree"],["Fenwick Tree"]
  ]';
begin
  for grp in select * from jsonb_array_elements(data) loop
    pos := pos + 1;
    insert into concepts(name, slug, position)
      values (grp->>0, trim(both '-' from regexp_replace(lower(grp->>0), '[^a-z0-9]+', '-', 'g')), pos)
      on conflict (slug) do nothing
      returning id into pid;
    if pid is null then continue; end if;
    for sub in select jsonb_array_elements_text(grp) offset 1 loop
      pos := pos + 1;
      insert into concepts(name, slug, parent_id, position)
        values (sub, trim(both '-' from regexp_replace(lower(sub), '[^a-z0-9]+', '-', 'g')), pid, pos)
        on conflict (slug) do nothing;
    end loop;
  end loop;
end $$;
