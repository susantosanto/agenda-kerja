# Graph Report - .  (2026-05-05)

## Corpus Check
- 45 files · ~11,632 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 86 nodes · 87 edges · 24 communities (19 shown, 5 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Project Planning & Features|Project Planning & Features]]
- [[_COMMUNITY_UI Component Library|UI Component Library]]
- [[_COMMUNITY_Dashboard & Task Display|Dashboard & Task Display]]
- [[_COMMUNITY_App Layout & Providers|App Layout & Providers]]
- [[_COMMUNITY_Task API Routes|Task API Routes]]
- [[_COMMUNITY_Auth Utilities|Auth Utilities]]
- [[_COMMUNITY_Design System|Design System]]
- [[_COMMUNITY_Project Documentation|Project Documentation]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 13 edges
2. `Database Schema Design` - 7 edges
3. `Authentication Phase (Phase 1)` - 6 edges
4. `Task Management Core (Phase 3)` - 6 edges
5. `MVP Feature Specification` - 5 edges
6. `Community & List Management (Phase 2)` - 5 edges
7. `API Endpoint Specification` - 5 edges
8. `Views & Visualization (Phase 4)` - 4 edges
9. `Development Phases (5 weeks)` - 4 edges
10. `Collaboration Features (Comments, Activity, Real-time)` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Project Findings` --conceptually_related_to--> `Project Progress Tracker`  [INFERRED]
  findings.md → progress.md
- `AGENDA KERJA OPS - Project Overview` --conceptually_related_to--> `Technology Stack`  [EXTRACTED]
  README.md → plan.md
- `AGENDA KERJA OPS - Project Overview` --conceptually_related_to--> `Authentication Phase (Phase 1)`  [EXTRACTED]
  README.md → plan.md
- `Setup Documentation (OAuth, DB, Env, GitHub)` --conceptually_related_to--> `AGENDA KERJA OPS - Project Overview`  [EXTRACTED]
  SETUP-STEP1.md, SETUP-STEP2.md, SETUP-STEP3.md, SETUP-GITHUB.md → README.md
- `Setup Documentation (OAuth, DB, Env, GitHub)` --conceptually_related_to--> `Authentication Phase (Phase 1)`  [EXTRACTED]
  SETUP-STEP1.md, SETUP-STEP2.md, SETUP-STEP3.md, SETUP-GITHUB.md → plan.md

## Hyperedges (group relationships)
- **MVP Core Features** — plan_auth_phase, plan_community_phase, plan_task_phase, collaboration_features [EXTRACTED 1.00]
- **Design System Components** — plan_design_philosophy, design_glassmorphism, design_color_palette [EXTRACTED 1.00]
- **5-Week Development Timeline** — plan_dev_phases, plan_auth_phase, plan_community_phase, plan_task_phase, plan_views_phase [EXTRACTED 1.00]

## Communities (24 total, 5 thin omitted)

### Community 0 - "Project Planning & Features"
Cohesion: 0.28
Nodes (15): Collaboration Features (Comments, Activity, Real-time), Community Workflow (Invite, Join, Roles), Filters & Smart Views, Notifications & Reminders System, API Endpoint Specification, Authentication Phase (Phase 1), Community & List Management (Phase 2), Database Schema Design (+7 more)

### Community 2 - "Dashboard & Task Display"
Cohesion: 0.36
Nodes (3): Avatar(), AvatarFallback(), Badge()

### Community 9 - "Design System"
Cohesion: 0.67
Nodes (3): Color Palette (Indigo/Slate/Emerald), Glassmorphism Design System, UI/UX Design Philosophy

## Knowledge Gaps
- **6 isolated node(s):** `Technology Stack`, `Project Findings`, `Project Progress Tracker`, `Glassmorphism Design System`, `Color Palette (Indigo/Slate/Emerald)` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Component Library` to `Dashboard & Task Display`, `Tooltip Components`, `Utility Functions`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `MVP Feature Specification` (e.g. with `Views & Visualization (Phase 4)` and `Collaboration Features (Comments, Activity, Real-time)`) actually correct?**
  _`MVP Feature Specification` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Technology Stack`, `Project Findings`, `Project Progress Tracker` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._