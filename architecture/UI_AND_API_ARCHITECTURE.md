# Personal Life OS - Architecture Overview

## 1. UI Component Architecture

The application UI is designed with a **Monolithic Single-Page Application (SPA)** architecture prioritizing snappy client-side responsiveness, optimized for Vercel deployment.

- `src/App.tsx`: The root React Router DOM injector. Routes divide the app into core modules (Dashboard, StudyHub, Tasks, etc.).
- `src/components/Layout.tsx`: Implements the cross-platform responsive frame.
  - **Desktop View**: Uses a fixed left-sidebar (`w-64`) with smooth scrolling panels.
  - **Mobile View**: Converts the navigation into a fixed bottom Tab-Bar for ergonomic reachability.
- `src/components/Dashboard.tsx`: Data aggregation layout. Heavily leans on Shadcn's `<Card>` to structure summary widgets.
- `src/components/StudyHub.tsx`: Contains the core **Admission Preparation Progress Engine**.

## 2. API Structure & Supabase Integration (Production Ready)

To maintain true production readiness, the API layer is decoupled from the UI. 

### Recommended Implementation (Next.js / Vite + React Query)
1. **Supabase Client**: Standardize the Supabase initialization in `src/lib/supabase.ts`.
2. **Authentication**: Use Supabase Auth with Google OAuth (`@supabase/auth-ui-react`).
3. **Data Fetching API**: 
   - Wrap data calls inside React hooks (e.g., `useQuery`, `useMutation`), making direct queries to Supabase using `supabase-js`.
   - Setup Row Level Security (RLS) as defined in `/supabase/schema.sql` to eliminate the need for a separate Node/Express backend for simple CRUD operations.

### Admission Progress Engine Logic
The progress calculation is computationally defined both client-side and inside PostgreSQL (`GENERATED ALWAYS AS` in `schema.sql`). 

1. **Chapter Progress**: Calculated by counting checking steps (Class Done, Reading, 2 Revisions, CQ, MCQ, etc.) divided by `9` (Total Checkpoints) × 100.
2. **Subject Progress**: Roll-up average of all underlying Chapters.
3. **Overall Prep %**: Global average of all Subject progress percentages.

## 3. ER Diagram Description

- **`profiles`**: 1-to-1 extension of Supabase Auth users. Holds global state (streaks, xp, name).
- **`subjects`** 1-to-many **`chapters`**: A user has many subjects. Each subject has many chapters.
- **`chapters`** 1-to-1 **`chapter_progress`**: Strict relationship maintaining the checklists.
- **Other Isolated Entities**: `notes`, `health_records`, `salah_records`, `transactions` all relate strictly to `profiles` as a central hub (Star Schema pattern centered on the User), governed entirely by UID-based RLS policies.

## 4. Frontend State Hand-off
Locally, the prototype relies on `src/store.ts` for immediate visual UI preview of the Admission Engine and Dashboard.
To launch:
1. Initialize Supabase project
2. Execute `supabase/schema.sql`
3. Swap `src/store.ts` for Supabase `@supabase/supabase-js` integrations.
