create table if not exists concepts (
  id serial primary key,
  name text not null,
  slug text not null unique,
  parent_id int references concepts(id) on delete cascade,
  position int not null default 0
);

create table if not exists problems (
  id uuid primary key default gen_random_uuid(),
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
create index if not exists problems_concept_idx on problems(concept_id);

-- Only the server (service role key) touches the data.
alter table concepts enable row level security;
alter table problems enable row level security;

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
