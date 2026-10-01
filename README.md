# DSA Tracker

A React single-page app built with Vite, React Router, Tailwind CSS, and Supabase Auth/Database. No Next.js server or Supabase service-role key is used.

## Local development

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL Editor.
2. Copy `.env.example` to `.env.local` and set the Supabase project URL and **anon/publishable key**.
3. In Supabase **Authentication → URL Configuration**, set the local site URL to `http://localhost:5173` and allow that URL for redirects.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

Open `http://localhost:5173`, create an account, and sign in. If email confirmation is enabled, confirm the link before signing in.

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used by the browser app. The anon key is expected to be public; database access is restricted by Row Level Security (RLS). **Never put a Supabase service-role key in a `VITE_` variable or browser code.**

## Existing Supabase database and data

The schema is safe to run again against the existing tables: it adds `user_id` and installs authenticated-user policies. Concepts are readable to signed-in users; each user can only read, add, edit, or delete their own problems.

Existing problem rows have no owner after the migration and therefore remain inaccessible until assigned. Create/sign up for your account, find its UUID in Supabase **Authentication → Users**, then run this once in SQL Editor, replacing the placeholder with that UUID:

```sql
update public.problems
set user_id = 'AUTH_USER_UUID'
where user_id is null;
```

This assigns the existing problems to that account. Do not run this if you do not want to transfer those records to the account.

## Deploy on Vercel

1. Push the repository to GitHub and import it into Vercel. Vercel detects Vite; the build command is `npm run build` and the output directory is `dist`.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel project's environment variables for the environments you deploy.
3. In Supabase **Authentication → URL Configuration**, set the Site URL to your Vercel domain and add that domain to the allowed redirect URLs. Keep the localhost URL for local development.
4. Deploy and test sign-up/sign-in and problem CRUD. Re-deploy after changing Vercel environment variables.

The included [`vercel.json`](./vercel.json) rewrites client-side routes to `index.html`, so links such as `/problems/...` work on refresh.
