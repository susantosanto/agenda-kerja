# Task Plan - Phase 2 & 3: Core Data & UI Components

## Goal
Implement task management UI components and views (list, kanban, calendar, timeline) to complete the MVP core functionality.

---

## Phase 2: Core Data UI (Task Management Interface)

### Task 2.1: Community Detail Page
- [ ] Create `/dashboard/communities/[communityId]/page.tsx`
- [ ] Display community info header
- [ ] Show community members (avatar stack)
- [ ] Show lists in community (grid/list)
- [ ] Add "Create List" button with modal
- [ ] Implement list card component (name, description, task count, color)
- [ ] Add navigation back to dashboard

**Files:**
- `src/app/dashboard/communities/[communityId]/page.tsx`
- `src/components/community/community-header.tsx`
- `src/components/community/community-members.tsx`
- `src/components/list/list-card.tsx`

**Dependencies:** Phase 1 complete, Lists API

---

### Task 2.2: List Management UI
- [ ] Create list form modal (name, description, color picker)
- [ ] Edit list modal (prefill existing data)
- [ ] Delete list confirmation dialog
- [ ] Archive/unarchive list toggle
- [ ] Pin/unpin list toggle
- [ ] List card context menu (edit, delete, archive, pin)
- [ ] Empty state when no lists

**Files:**
- `src/components/list/list-form-modal.tsx`
- `src/components/list/list-actions.tsx`

**Dependencies:** List API, Dialog component

---

### Task 2.3: Task List View
- [ ] Create task item component (title, priority badge, due date, assignees, labels, starred)
- [ ] Task list container with sorting (priority, due date, name)
- [ ] Group by: status, priority, assignee, none
- [ ] Expandable task details (show description, subtasks)
- [ ] Subtask checklist with completion toggle
- [ ] Add task button (floating or inline)
- [ ] Task item actions menu (edit, delete, assign, add label)
- [ ] Empty states (no tasks, filtered empty)

**Files:**
- `src/components/task/task-item.tsx`
- `src/components/task/task-list.tsx`
- `src/components/task/task-form-modal.tsx`
- `src/components/task/subtask-item.tsx`

**Dependencies:** Task API, Labels API, DropdownMenu, Dialog

---

### Task 2.4: Task Form
- [ ] Form with validation (Zod)
- Fields:
  - [ ] Title (required, max 255)
  - [ ] Description (textarea, markdown preview)
  - [ ] Priority (select: P1-P4)
  - [ ] Start date & time (datetime picker)
  - [ ] Due date & time (datetime picker)
  - [ ] Duration (number, minutes)
  - [ ] Assignees (multi-select dropdown)
  - [ ] Labels (multi-select with color chips)
  - [ ] Status (select: TODO, IN_PROGRESS, DONE)
- [ ] Create mode & edit mode
- [ ] Submit with optimistic update
- [ ] Error handling & display

**Files:**
- `src/components/task/task-form.tsx`
- `src/lib/validations/task.ts` (Zod schema)

**Dependencies:** React Hook Form, Zod, Select, DatePicker

---

### Task 2.5: Task CRUD Operations in UI
- [ ] Fetch tasks for current list/community with React Query
- [ ] Create task (POST /api/tasks)
- [ ] Update task (PATCH /api/tasks/[id])
- [ ] Delete task with confirmation
- [ ] Toggle task completion (quick action)
- [ ] Toggle star (quick action)
- [ ] Loading states & error boundaries
- [ ] Optimistic updates for all mutations

**Files:**
- `src/hooks/use-tasks.ts` (custom hook)
- Update `task-list.tsx` with mutations

**Dependencies:** React Query, Task API

---

## Phase 3: Views (List, Kanban, Calendar, Timeline)

### Task 3.1: Task List View (Enhanced)
- [ ] Sortable columns (click header to sort)
- [ ] Sort by: title, priority, start date, due date, assignee
- [ ] Group by: status (columns), priority (sections), assignee (sections), none (flat)
- [ ] Collapsible groups
- [ ] Inline edit (double-click to edit title)
- [ ] Quick actions (hover menu)
- [ ] Bulk select & actions (delete, change status, assign)
- [ ] Search & filter bar (text search, filters)

**Files:**
- `src/components/views/task-list-view.tsx`
- `src/components/task/task-table.tsx` (optional)

**Dependencies:** Task list component, sorting logic

---

### Task 3.2: Kanban Board
- [ ] Column layout (Todo, In Progress, Done)
- [ ] Custom column creation (optional)
- [ ] Drag and drop tasks between columns (use @dnd-kit)
- [ ] Drag to reorder within column
- [ ] Column WIP limits (optional)
- [ ] Column headers with task count
- [ ] Add task button per column
- [ ] Quick edit on drop
- [ ] Mobile: horizontal scroll

**Files:**
- `src/components/views/kanban-board.tsx`
- `src/components/kanban/kanban-column.tsx`
- `src/components/kanban/kanban-task-card.tsx`

**Dependencies:** @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities

---

### Task 3.3: Calendar View
- [ ] Monthly calendar grid
- [ ] Week view option
- [ ] Day view option
- [ ] Show tasks as dots/chips on due date
- [ ] Click date to create task (quick add)
- [ ] Click task to view/edit
- [ ] Color coding by priority/label
- [ ] Navigate months/weeks
- [ ] Today button
- [ ] Responsive (scrollable on mobile)

**Files:**
- `src/components/views/calendar-view.tsx`
- `src/components/calendar/calendar-grid.tsx`
- `src/components/calendar/calendar-event.tsx`

**Dependencies:** date-fns, calendar component (build custom or use react-calendar)

---

### Task 3.4: Timeline View (Gantt)
- [ ] Horizontal timeline (days/weeks)
- [ ] Vertical task list
- [ ] Task bars showing start-due range
- [ ] Drag to adjust dates
- [ ] Duration visualization
- [ ] Dependencies (optional, future)
- [ ] Current time indicator
- [ ] Zoom controls (day/week/month)

**Files:**
- `src/components/views/timeline-view.tsx`
- `src/components/timeline/timeline-bar.tsx`

**Dependencies:** Custom implementation or use frappe-gantt (React wrapper)

---

## Phase 4: Collaboration UI (Comments & Activity) - IN PROGRESS

### Task 4.1: Task Detail Page
- [x] Page layout: main content (task info) + side panel (comments, activity)
- [x] Task header (title, priority, status, dates)
- [x] Task description (markdown render)
- [x] Subtasks section (expandable)
- [x] Assignees section (avatars, add/remove)
- [x] Labels section (chips, add/remove)
- [x] Comments section (list, form)
- [x] Activity log section (timeline)

**Files:**
- `src/app/tasks/[taskId]/page.tsx`
- `src/components/task/task-detail.tsx`
- `src/components/task/task-sidebar.tsx` (merged into task-detail)

**Dependencies:** Task API, Comments API, Activity API

---

### Task 4.2: Comments UI
- [x] Comment list with avatars, names, timestamps
- [x] Comment form (textarea, submit)
- [x] Edit comment inline (on own comments)
- [x] Delete comment button (on own comments)
- [x] Markdown preview (or simple text)
- [ ] @mention parsing (future)
- [ ] Real-time comment updates (future)

**Files:**
- `src/components/comments/comment-list.tsx` (in task-detail)
- `src/components/comments/comment-item.tsx` (in task-detail)
- `src/components/comments/comment-form.tsx` (in task-detail)

**Dependencies:** Comments API

---

### Task 4.3: Activity Log UI
- [x] Activity timeline (vertical list)
- [x] Activity items: icon + description + user + timestamp
- [x] Group by date (Today, Yesterday, This Week)
- [x] Filter by activity type
- [x] Relative time formatting (e.g., "2 hours ago")

**Files:**
- `src/components/activity/activity-log.tsx` (in task-detail)
- `src/components/activity/activity-item.tsx` (in task-detail)

**Dependencies:** Activity API

---

## Phase 4.5: Real-time Chat (NEW)

### Task 4.4: Community Chat System
- [x] Database schema: ChatMessage model
- [x] API GET /api/communities/[communityId]/messages (with pagination)
- [x] API POST /api/communities/[communityId]/messages
- [x] ChatBox component (message list, input, send)
- [x] Message display with user avatar, name, timestamp
- [x] Real-time polling (5-second interval)
- [x] Optimistic message sending
- [x] Toast notifications for send success/error
- [ ] WebSocket implementation (future)
- [ ] File attachments (future)
- [ ] Emoji picker (future)
- [ ] Message reactions (future)

**Files:**
- `src/app/api/communities/[communityId]/messages/route.ts`
- `src/components/chat/chat-box.tsx`
- `src/components/ui/scroll-area.tsx`

**Dependencies:** Polling, fetch API

---

## Phase 5: Filters & Smart Views

### Task 5.1: Filter System
- [ ] Filter bar component (dropdowns, search)
- [ ] Filter by: assignee (multi-select), label (multi-select), priority (multi-select), status (multi-select), date range
- [ ] Active filters display (chips with remove)
- [ ] Clear all filters button
- [ ] Save filter as smart view (optional)
- [ ] URL sync (filters in query params)

**Files:**
- `src/components/filters/task-filters.tsx`
- `src/components/filters/filter-dropdown.tsx`
- `src/hooks/use-task-filters.ts`

**Dependencies:** React Query, URL search params

---

### Task 5.2: Smart Views Pages
- [ ] My Tasks page (tasks assigned to current user)
- [ ] Today page (tasks due today)
- [ ] This Week page (tasks due this week)
- [ ] Overdue page (past due tasks)
- [ ] Starred page (starred tasks)
- [ ] High Priority page (P1 & P2)

**Files:**
- `src/app/dashboard/filters/my-tasks/page.tsx`
- `src/app/dashboard/filters/today/page.tsx`
- `src/app/dashboard/filters/this-week/page.tsx`
- `src/app/dashboard/filters/overdue/page.tsx`
- `src/app/dashboard/filters/starred/page.tsx`
- `src/app/dashboard/filters/high-priority/page.tsx`

**Dependencies:** Task API with filters

---

## Phase 6: Polish & Optimization

### Task 6.1: Mobile Responsiveness
- [ ] Test all pages on mobile (< 640px)
- [ ] Fix layout issues
- [ ] Touch-friendly targets (44x44px minimum)
- [ ] Mobile navigation testing
- [ ] Form inputs mobile-friendly
- [ ] Modal dialogs mobile-optimized

---

### Task 6.2: Animations & Micro-interactions
- [ ] Page transitions (framer-motion)
- [ ] Task item hover effects
- [ ] Button press animations
- [ ] Modal enter/exit animations
- [ ] List reorder animations
- [ ] Loading skeletons

**Dependencies:** framer-motion

---

### Task 6.3: Performance Optimization
- [ ] Image optimization (next/image)
- [ ] Code splitting (dynamic imports)
- [ ] Lazy loading components
- [ ] React Query cache optimization
- [ ] Bundle size analysis
- [ ] Lighthouse audit

---

### Task 6.4: Error Handling & Validation
- [ ] Form validation errors display
- [ ] API error messages (toast notifications)
- [ ] Network error handling
- [ ] Retry logic for failed requests
- [ ] Error boundaries for components

**Files:**
- `src/components/ui/toast.tsx` (or use sonner)
- `src/lib/error-handling.ts`

---

## Testing Checklist

### Unit Tests
- [ ] Utility functions (formatDate, getPriorityColor, generateInviteCode)
- [ ] API route handlers (with mocked Prisma)
- [ ] Component rendering

### Integration Tests
- [ ] Authentication flow
- [ ] Create task flow
- [ ] Edit task flow
- [ ] Delete task flow
- [ ] Comment flow
- [ ] Filter flow

### E2E Tests (Optional)
- [ ] User sign in
- [ ] Create community
- [ ] Create list
- [ ] Create task
- [ ] Add comment

---

## Deployment Prep

- [ ] Environment variables check
- [ ] Database migrations (prisma migrate deploy)
- [ ] Build test (npm run build)
- [ ] Vercel configuration
- [ ] Domain setup (if custom)
- [ ] Analytics (optional)
- [ ] Error monitoring (Sentry, optional)

---

## Timeline Estimate

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 2 UI | 3-4 days | Community page, List UI, Task form, Task CRUD |
| Phase 3 Views | 4-5 days | List view, Kanban, Calendar, Timeline |
| Phase 4 UI | 2-3 days | Task detail, Comments, Activity |
| Phase 5 Filters | 2-3 days | Filter system, Smart views |
| Phase 6 Polish | 2-3 days | Mobile, Animations, Performance |
| **Total** | **13-18 days** | **~3 weeks** |

---

## Notes

- Use **Server Components** by default, mark interactive ones with "use client"
- Implement **optimistic updates** for better UX
- Use **React Query** for all data fetching & mutations
- Follow **shadcn/ui** patterns for consistency
- Test on **mobile** throughout development
- Commit **frequently** with descriptive messages
- Update **plan.md** and **progress.md** after each session

---

## Status Tracking

| Task | Status | Started | Completed | Notes |
|------|--------|---------|-----------|-------|
| Phase 1: Setup & Auth | ✅ COMPLETE | 2026-05-05 | 2026-05-05 | API routes, layout, auth siap |
| Phase 2: Core Data UI | 🔄 IN PROGRESS | 2026-05-06 | - | Community page, list management, task UI selesai |
| Phase 2: Task CRUD | ⏳ Pending | - | - | Belum terintegrasi dengan React Query |
| Phase 3: Views | ⏳ Pending | - | - | List view siap, Kanban/Calendar/Timeline belum |
| Phase 4: Collaboration | ⏳ Pending | - | - | Task detail dengan comments & activity siap |
| Phase 5: Filters | ⏳ Pending | - | - | - |
| Phase 6: Polish | ⏳ Pending | - | - | - |

---

**Last Updated:** 2026-05-06  
**Session:** Phase 2 UI Components (Community, List, Task) completed  
**Commit:** 092b6be - feat(phase2): implement core data UI components
