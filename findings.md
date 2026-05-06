# Findings - Collaborative Todo List App

## Implementation Notes

### Phase 1: Setup & Auth - COMPLETE (2026-05-05)

**Completed:**
1. **Project Initialization**
   - Next.js 15.1.0 with TypeScript
   - TailwindCSS 3.4.0 with custom config
   - shadcn/ui components installed
   - Prisma 6.2.1 with PostgreSQL (Neon)

2. **Authentication System**
   - NextAuth.js v5 beta configured
   - Google OAuth provider setup
   - Session management with JWT
   - Protected routes implemented
   - Sign in/out flows ready

3. **Database & API**
   - Prisma schema fully defined (11 models)
   - Database synchronized with Neon Postgres
   - API routes for Lists, Labels, Comments, Activity completed
   - Task API already existed from previous session
   - Community API already existed

4. **Layout & Styling**
   - Custom CSS variables for light/dark themes
   - Glassmorphism effects implemented
   - Custom animations (fade-in, slide-up, scale-in)
   - Responsive layout with desktop sidebar and mobile bottom nav
   - Header with user dropdown menu
   - Community selector component

**Components Built:**
- `Header` - Top navigation bar with user menu
- `Sidebar` - Desktop navigation (hidden on mobile)
- `MobileNav` - Bottom navigation for mobile devices
- `CommunitySelector` - Dropdown to switch/create communities

**Styling Decisions:**
- Primary color: Indigo (#6366f1)
- Dark mode as default (premium feel)
- Glassmorphism with backdrop-blur
- Custom scrollbar styling
- Smooth transitions (200-300ms)

**Challenges Resolved:**
- npm command whitelisting - added to shell whitelist
- PowerShell PATH issues - used direct PowerShell calls
- Prisma schema location - confirmed at prisma/schema.prisma

---

### Phase 2: Core Data - COMPLETE (Backend) / IN PROGRESS (UI)

**API Endpoints Summary:**

**Lists:**
- `GET /api/lists?communityId=` - Get all lists for community
- `POST /api/lists` - Create new list
- `PATCH /api/lists/[id]` - Update list (name, description, color, archived, pinned)
- `DELETE /api/lists/[id]` - Delete list (owner only)
- `POST /api/lists/[id]/reorder` - Reorder lists (owner only)

**Labels:**
- `GET /api/labels?communityId=` - Get all labels for community
- `POST /api/labels` - Create label
- `PATCH /api/labels/[id]` - Update label (name, color)
- `DELETE /api/labels/[id]` - Delete label

**Comments:**
- `POST /api/tasks/[taskId]/comments` - Add comment to task
- `PATCH /api/comments/[commentId]` - Edit comment (author only)
- `DELETE /api/comments/[commentId]` - Delete comment (author only)

**Activity:**
- `GET /api/tasks/[taskId]/activity` - Get activity log for task (last 50)

**Tasks:**
- `GET /api/tasks?communityId=|listId=` - Get tasks (with subtasks, labels, assignees)
- `POST /api/tasks` - Create task
- `GET/PATCH/DELETE /api/tasks/[taskId]` - Single task operations
- `POST /api/tasks/[taskId]/subtasks` - Create subtask
- `PATCH/DELETE /api/subtasks/[subtaskId]` - Update/delete subtask

**Members:**
- `GET /api/members?communityId=` - Get community members

**Authentication:**
- `POST /api/auth/signout` - Sign out endpoint

**Permission Model:**
- Community membership required for most operations
- List reorder & delete: owner only
- Comment edit/delete: author only
- Task operations: any community member
- Subtask operations: any community member

---

### Phase 2: Core Data UI - IN PROGRESS (2026-05-06)

**Components Built:**
1. **Community Page** (`/dashboard/communities/[communityId]`)
   - CommunityHeader with info, owner badge, invite code
   - CommunityMembers with avatar stack & role badges
   - ListCard grid with color coding, task count, pinned state
   - Create List button with modal (color picker, validation)

2. **List Management**
   - ListFormModal (create/edit with Zod validation)
   - ListActions dropdown (edit, pin, archive, delete with AlertDialog)
   - ListCard with context menu

3. **Task Management**
   - TaskItem (checkbox, star, priority badge, due date, assignees, labels, subtasks)
   - TaskList (sorting: due date/priority/title; grouping: status/priority/assignee)
   - TaskFormModal (full form: title, description, priority, start/due dates, duration, assignees multi-select via Command, labels multi-select, status)
   - SubtaskItem (toggle completion, inline edit, delete)
   - TaskDetail page (`/tasks/[taskId]`) with:
     * Task info header (priority, status, dates, assignees, labels)
     * Expandable subtasks with add new
     * Comments section (list, form with toast)
     * Activity log timeline

4. **UI Infrastructure Added:**
   - AlertDialog (Radix) for confirmations
   - Command (Radix) for searchable multi-select
   - Popover (Radix) for dropdowns
   - Form (react-hook-form integration)
   - Toast system (ToastProvider, useToast, Toaster)
   - Updated Providers to include ToastProvider

**State Management:**
- React Query configured in providers (staleTime 60s, refetchOnWindowFocus false)
- Optimistic updates pattern ready (callbacks passed to components)
- Error handling with toast notifications

**Files Created (Phase 2):**
- `src/app/dashboard/communities/[communityId]/page.tsx`
- `src/components/community/community-header.tsx`
- `src/components/community/community-members.tsx`
- `src/components/list/list-card.tsx`
- `src/components/list/list-form-modal.tsx`
- `src/components/list/list-actions.tsx`
- `src/components/task/task-item.tsx`
- `src/components/task/task-list.tsx`
- `src/components/task/task-form-modal.tsx`
- `src/components/task/subtask-item.tsx`
- `src/components/task/task-detail.tsx`
- `src/app/tasks/[taskId]/page.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/command.tsx`
- `src/components/ui/form.tsx`
- `src/components/ui/popover.tsx`
- `src/components/ui/toast.tsx`
- `src/components/ui/toaster.tsx`
- `src/components/ui/use-toast.ts`

**API Routes Created:**
- `src/app/api/members/route.ts`
- `src/app/api/tasks/[taskId]/route.ts` (GET single task, PATCH, DELETE)
- `src/app/api/tasks/[taskId]/subtasks/route.ts` (POST subtask)
- `src/app/api/subtasks/[subtaskId]/route.ts` (PATCH, DELETE subtask)

---

### Phase 4.5: Real-time Chat System - COMPLETE (2026-05-06)

**Database:**
- `ChatMessage` model: id, content, communityId, userId, createdAt, updatedAt
- Index on `[communityId, createdAt]` for efficient queries

**API Routes:**
- `GET /api/communities/[communityId]/messages?limit=50&before=<timestamp>`
  - Returns paginated messages (oldest first)
  - Includes user data
  - Membership verification
- `POST /api/communities/[communityId]/messages`
  - Creates new message
  - Validates content (required, max 2000 chars)
  - Returns created message with user

**UI Components:**
- `ChatBox` component:
  - Message list with ScrollArea
  - User avatars, names, timestamps (relative)
  - Optimistic message sending
  - Auto-scroll to bottom on new messages
  - Load more pagination (load older messages)
  - Real-time polling every 5 seconds
  - Textarea with Enter to send
  - Toast notifications

**Features:**
- ✅ All community members can send messages
- ✅ Real-time updates via polling (5s interval)
- ✅ Optimistic UI (message appears instantly)
- ✅ Message history with pagination (load more)
- ✅ User identification with avatars
- ✅ Timestamp formatting (relative: "2 hours ago")
- ✅ Error handling & toast feedback
- ✅ Max 2000 characters per message

**Integration:**
- ChatBox embedded in Community Detail page
- Below Lists section
- Responsive design

**Future Enhancements:**
- WebSocket for true real-time
- Message editing & deletion
- File attachments
- Emoji picker
- Message reactions
- Direct messaging (1-on-1)
- @mentions
- Message search

---

### Phase 3: Views - Pending

---

## Technology Decisions (Confirmed)

### Why This Stack?
1. **Next.js 15** - App Router, server components, great Vercel integration
2. **TypeScript** - Type safety across full stack
3. **TailwindCSS** - Utility-first, rapid UI development
4. **shadcn/ui** - Accessible, customizable components
5. **Prisma** - Type-safe ORM with excellent DX
6. **Neon Postgres** - Serverless, free tier, good for small apps
7. **NextAuth.js v5** - Modern auth with Google OAuth
8. **React Query** - Server state management, caching
9. **Zustand** - Client state (if needed)
10. **date-fns** - Lightweight date formatting
11. **framer-motion** - Animations (to be added in Phase 5)
12. **lucide-react** - Beautiful icons

### Architecture Patterns
- **Server Components by default** - Better performance
- **Client Components when needed** - Interactive parts only
- **API Routes** - RESTful endpoints with Next.js
- **Middleware** - Auth protection (if needed)
- **React Query** - Data fetching, caching, optimistic updates

---

## Database Schema (As Implemented)

### Models
- User (with NextAuth accounts & sessions)
- Community (with owner, inviteCode)
- CommunityMember (many-to-many with Role enum)
- List (with color, order, archived, pinned)
- Task (with status, priority, dates, duration, starred)
- Subtask (nested tasks)
- Label (custom colored labels)
- TaskLabel (many-to-many)
- TaskAssignee (many-to-many)
- Comment (rich text)
- Activity (audit log with ActivityType enum)

### Enums
- Role: OWNER, ADMIN, MEMBER
- TaskStatus: TODO, IN_PROGRESS, DONE
- Priority: P1, P2, P3, P4
- ActivityType: TASK_CREATED, TASK_UPDATED, TASK_DELETED, TASK_COMPLETED, TASK_UNCOMPLETED, TASK_ASSIGNED, TASK_UNASSIGNED, COMMENT_ADDED, COMMENT_DELETED, STATUS_CHANGED

---

## UI/UX Philosophy (As Implemented)

### Premium Design Elements
- ✅ Glassmorphism with backdrop-blur
- ✅ Dark mode CSS variables
- ✅ Custom animations (fade-in, slide-up, scale-in)
- ✅ Inter font family
- ✅ Indigo primary color (#6366f1)
- ✅ Rounded corners (0.75rem radius)
- ✅ Smooth transitions (200ms)

### Responsive Breakpoints
- Mobile: < 640px (bottom nav visible)
- Tablet: 640px - 1024px
- Desktop: > 1024px (sidebar visible)

### Components Status
- ✅ Button, Input, Card, Avatar, Badge
- ✅ DropdownMenu, Dialog, Select, Checkbox
- ✅ Header, Sidebar, MobileNav, CommunitySelector
- ⏳ TaskItem, TaskForm, TaskList, TaskBoard (pending)
- ⏳ Calendar, Timeline (pending)

---

## Next Steps (Immediate - Phase 2 & 3)

### Phase 2 UI Completion (Core Data UI)
1. Build community detail page (`/dashboard?community=[id]`)
2. Build list management UI (create, edit, delete, archive, pin)
3. Build task list view with all fields (priority, dates, assignees, labels)
4. Build task form modal/page with validation (React Hook Form + Zod)
5. Implement task CRUD operations in UI (fetch, mutate with React Query)
6. Build subtask component (nested checkboxes)
7. Build label selector component

### Phase 3 Views (UI Components)
1. **Task List View** - Sortable, groupable, with inline editing
2. **Kanban Board** - Columns (Todo, In Progress, Done), drag-drop reorder
3. **Calendar View** - Monthly/weekly display, click to add task
4. **Timeline View** - Gantt-style, date range visualization
5. **Task Detail Page** - All task info, subtasks, comments, activity side panel

### Phase 4 UI (Collaboration)
1. Comments section on task detail (rich text, markdown preview)
2. Activity log display (timeline of changes)
3. Filters sidebar/dropdown (by assignee, label, priority, date)
4. Smart views pages (My Tasks, Today, Starred, Overdue)

### Phase 5 Polish
1. Mobile responsiveness testing & fixes
2. Performance optimization (image optimization, code splitting)
3. Animations with framer-motion (page transitions, hover effects)
4. Real-time sync implementation (polling or WebSockets)
5. Optimistic UI updates for better UX
6. Bug fixes & accessibility audit

---

## Known Issues & Risks

1. **Google OAuth credentials** - Need to verify credentials in .env are valid
2. **Database connection** - Neon connection string appears valid, need to test
3. **Real-time** - Not implemented yet (polling acceptable for MVP)
4. **Mobile responsiveness** - Basic CSS done, need thorough testing
5. **Drag & drop** - Not implemented (will need @dnd-kit or similar)
6. **Date picker** - Need to add date picker component (shadcn has calendar)
7. **Rich text editor** - For task descriptions & comments (need to choose: TipTap, Slate, or simple markdown)
8. **File uploads** - Not in MVP scope but nice-to-have later

---

## Questions for Next Session

1. Should we implement real-time with Pusher, Supabase Realtime, or simple polling?
2. Do we need a separate "Invite" page with invite code display?
3. Should task reordering be drag-drop or up/down buttons?
4. What date picker component to use? (shadcn has calendar)
5. Need file attachments for tasks? (Phase 5 nice-to-have)
6. Should we implement optimistic updates now or later?
7. Which rich text editor? (TipTap recommended for best UX)
8. Should we add search functionality now or later?

---

## Appendix

### File Structure (Current)
```
src/
├── app/
│   ├── (auth)/
│   │   └── signin/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx (pending)
│   │   ├── page.tsx (dashboard home)
│   │   └── communities/
│   │       └── [communityId]/page.tsx (pending)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── signout/route.ts
│   │   ├── communities/route.ts
│   │   ├── lists/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── reorder/route.ts
│   │   ├── labels/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── tasks/
│   │   │   ├── route.ts
│   │   │   └── [taskId]/
│   │   │       ├── comments/route.ts
│   │   │       └── activity/route.ts
│   │   └── comments/
│   │       └── [commentId]/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── community-selector.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   └── tooltip.tsx
│   └── (pending: task, list, community, views, filters, comments, activity)
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── utils.ts
└── prisma/
    └── schema.prisma
```

### API Routes Summary
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/auth/[...nextauth] | GET/POST | No | NextAuth handlers |
| /api/auth/signout | POST | Yes | Sign out |
| /api/communities | GET, POST | Yes | List/create communities |
| /api/lists | GET, POST | Yes | List/create lists |
| /api/lists/[id] | PATCH, DELETE | Yes | Update/delete list |
| /api/lists/[id]/reorder | POST | Yes (owner) | Reorder lists |
| /api/labels | GET, POST | Yes | List/create labels |
| /api/labels/[id] | PATCH, DELETE | Yes | Update/delete label |
| /api/tasks | GET, POST | Yes | List/create tasks |
| /api/tasks/[id] | PATCH, DELETE | Yes | Update/delete task |
| /api/tasks/[taskId]/comments | POST | Yes | Add comment |
| /api/comments/[commentId] | PATCH, DELETE | Yes (author) | Edit/delete comment |
| /api/tasks/[taskId]/activity | GET | Yes | Get activity log |

---

**Last Updated:** 2026-05-05  
**Session:** Phase 1 Complete, Phase 2 & 3 pending  
**Status:** Ready for UI implementation
