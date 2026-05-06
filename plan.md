# Collaborative Todo List App - Project Plan

## Project Overview

**Project Name:** CommunityTodo
**Type:** Web Application (Mobile-Responsive)
**Core Functionality:** Collaborative todo list application where a small community (5-10 members) can create, share, assign, and manage tasks together with full CRUD operations, date management, and real-time collaboration.
**Target Users:** Small teams, families, study groups, or communities of 5-10 people who need shared task management.

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18+ with TypeScript |
| Styling | TailwindCSS |
| UI Components | shadcn/ui |
| Authentication | NextAuth.js (Google Provider) |
| Database | PostgreSQL (via Prisma ORM) |
| Deployment | Vercel (Free Tier) |
| State Management | React Query + Zustand |
| Forms | React Hook Form + Zod |
| Date Handling | date-fns |
| Icons | Lucide React |

---

## UI/UX Design Philosophy

**Design Direction:** Ultra-modern, elegant, professional, premium quality

**Design Principles:**
- **Glassmorphism** accents with subtle blur effects
- **Micro-interactions** and smooth animations
- **Generous whitespace** for breathing room
- **Typography hierarchy** with clear visual weights
- **Dark mode** support with premium dark aesthetic
- **Responsive-first** approach (mobile view priority)
- **Smooth transitions** between states and views

**Color Palette:**
```
Primary: Deep Indigo (#6366f1)
Secondary: Slate (#64748b)
Accent: Emerald (#10b981)
Background Light: #fafafa
Background Dark: #0f172a
Surface Light: #ffffff
Surface Dark: #1e293b
```

---

## Feature Specification

### Phase 1: Authentication & User Management ✅ COMPLETE

#### 1.1 Google OAuth Authentication
- [x] Implement NextAuth.js with Google Provider
- [x] Session management with JWT
- [x] Protected routes middleware
- [x] User profile sync from Google (name, email, avatar)
- [x] Sign out functionality

#### 1.2 User Profile
- [x] Display user avatar from Google
- [x] Show user name and email
- [ ] User presence indicator (online/offline) - Phase 4

---

### Phase 2: Community & List Management ✅ COMPLETE (Backend) / 🔄 In Progress (UI)

#### 2.1 Community Creation
- [x] Create community with name and description (API done)
- [x] Generate unique invite code (6 characters) (API done)
- [ ] Community owner can manage members (API done, UI pending)
- [ ] Invite members via code (API done, UI pending)

#### 2.2 Community Members
- [x] Join community with invite code (API done)
- [x] View member list (API done)
- [x] Member roles: Owner, Admin, Member (schema done)
- [ ] Remove members (Owner/Admin only) (API done, UI pending)
- [ ] Leave community (API done, UI pending)

#### 2.3 List/Project Management
- [x] Create multiple lists per community (API done)
- [x] Edit list name and description (API done)
- [x] Delete list (with confirmation) (API done)
- [x] Archive list (API done)
- [x] Pin important lists (API done)
- [x] Color-code lists (API done)
- [ ] List UI components (pending - Phase 3)

---

### Phase 3: Task Management (Core) 🔄 In Progress (Backend API ✅ Complete, UI Pending)

#### 3.1 Task CRUD
- [x] Create task with title (required) (API done)
- [x] Add description (rich text markdown) (API done)
- [x] Set priority (P1-P4 with color coding) (API done)
- [x] Set start date and time (API done)
- [x] Set due date and time (API done)
- [x] Set duration (estimated time) (API done)
- [x] Mark as completed/incomplete (API done)
- [ ] Edit task inline (UI pending)
- [ ] Delete task (with confirmation) (API done, UI pending)

#### 3.2 Task Organization
- [ ] Drag and drop reorder tasks (API order field done, UI pending)
- [ ] Add subtasks (unlimited nesting) (API done, UI pending)
- [ ] Task checklists within subtasks (API done, UI pending)
- [ ] Star/favorite tasks (API done, UI pending)
- [ ] Bulk select and actions (pending)

#### 3.3 Task Labels/Tags
- [x] Create custom labels with colors (API done)
- [x] Assign multiple labels per task (API done)
- [ ] Filter by label (API done, UI pending)
- [x] Edit/delete labels (API done)

#### 3.4 Task Assignment
- [x] Assign task to one or more members (API done)
- [ ] View "Assigned to Me" filter (API done, UI pending)
- [ ] Unassigned task indicator (UI pending)

---

### Phase 4: Views & Visualization

#### 4.1 List View
- [ ] Standard list display
- [ ] Sort by: Date, Priority, Name, Assignee
- [ ] Group by: Status, Priority, Label, Assignee
- [ ] Collapse/expand subtasks

#### 4.2 Kanban Board
- [ ] Columns: To Do, In Progress, Done
- [ ] Drag and drop between columns
- [ ] Custom column creation
- [ ] Column WIP limits (optional)

#### 4.3 Calendar View
- [ ] Monthly calendar display
- [ ] Show tasks on due dates
- [ ] Click date to add task
- [ ] Color coding by priority

#### 4.4 Timeline View
- [ ] Gantt-style timeline
- [ ] Show start-due date range
- [ ] Drag to adjust dates
- [ ] Duration visualization

---

### Phase 5: Collaboration Features ✅ COMPLETE (Backend) / 🔄 In Progress (UI)

#### 5.1 Comments & Discussion
- [x] Add comments to tasks (API done)
- [ ] @mention members (API schema done, UI pending)
- [x] Edit/delete own comments (API done)
- [x] Rich text in comments (API done, UI markdown pending)

#### 5.2 Activity Log
- [x] Track all changes (created, updated, deleted) (API done)
- [x] Show who made changes (API done)
- [x] Show when changes made (API done)
- [ ] Filter activity by user (API done, UI pending)

#### 5.3 Real-time Updates
- [ ] Live sync across all members (pending - Phase 5)
- [ ] Presence indicators (pending)
- [ ] Optimistic UI updates (pending)

---

### Phase 6: Filters & Smart Views 🔄 In Progress (API ✅, UI Pending)

#### 6.1 Predefined Filters
- [ ] My Tasks (assigned to me) (API: GET /api/tasks?assignedToMe, UI pending)
- [ ] Today (due today) (API: GET /api/tasks?dueToday, UI pending)
- [ ] This Week (due this week) (API: GET /api/tasks?dueThisWeek, UI pending)
- [ ] Overdue (past due date) (API: GET /api/tasks?overdue, UI pending)
- [ ] High Priority (P1, P2) (API: GET /api/tasks?priority=P1,P2, UI pending)
- [ ] Unassigned (API: GET /api/tasks?unassigned, UI pending)

#### 6.2 Custom Filters
- [ ] Create custom filter combinations (pending)
- [ ] Save custom filters (pending)
- [ ] Quick access to saved filters (pending)

---

### Phase 7: Notifications & Reminders

#### 7.1 In-App Notifications
- [ ] Task assigned to you
- [ ] Task due soon (24h, 1h before)
- [ ] New comment on your task
- [ ] @mention notifications

#### 7.2 Reminders
- [ ] Set reminder for task
- [ ] Multiple reminders per task
- [ ] Snooze reminder

---

### Phase 8: Settings & Preferences

#### 8.1 User Settings
- [ ] Theme toggle (Light/Dark/System)
- [ ] Notification preferences
- [ ] Default view preference

#### 8.2 Community Settings
- [ ] Edit community name/description (Admin+)
- [ ] Manage invite code (Admin+)
- [ ] Delete community (Owner only)

---

## Database Schema

### User
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  memberships   CommunityMember[]
  assignedTasks TaskAssignee[]
  createdTasks  Task[]    @relation("CreatedTasks")
  comments      Comment[]
}
```

### Community
```prisma
model Community {
  id          String   @id @default(cuid())
  name        String
  description String?
  inviteCode  String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  ownerId     String
  members     CommunityMember[]
  lists       List[]
}
```

### CommunityMember
```prisma
model CommunityMember {
  id          String     @id @default(cuid())
  role        Role       @default(MEMBER)
  joinedAt    DateTime   @default(now())
  userId      String
  communityId String
  user        User       @relation(fields: [userId], references: [id])
  community   Community  @relation(fields: [communityId], references: [id])
}
```

### List
```prisma
model List {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String   @default("#6366f1")
  isArchived  Boolean  @default(false)
  isPinned    Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  communityId String
  community   Community @relation(fields: [communityId], references: [id])
  tasks       Task[]
}
```

### Task
```prisma
model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(P3)
  startDate   DateTime?
  dueDate     DateTime?
  duration    Int?      // in minutes
  isStarred   Boolean   @default(false)
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  listId      String
  list        List      @relation(fields: [listId], references: [id])
  createdById String
  createdBy   User      @relation("CreatedTasks", fields: [createdById], references: [id])
  assignees   TaskAssignee[]
  subtasks    Subtask[]
  labels      TaskLabel[]
  comments    Comment[]
  activity    Activity[]
}
```

### Subtask
```prisma
model Subtask {
  id        String   @id @default(cuid())
  title     String
  isDone    Boolean  @default(false)
  order     Int      @default(0)
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
}
```

### Label
```prisma
model Label {
  id          String      @id @default(cuid())
  name        String
  color       String
  communityId String
  tasks       TaskLabel[]
}
```

### TaskLabel
```prisma
model TaskLabel {
  taskId    String
  labelId   String
  task      Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  label     Label  @relation(fields: [labelId], references: [id], onDelete: Cascade)
  @@id([taskId, labelId])
}
```

### TaskAssignee
```prisma
model TaskAssignee {
  taskId    String
  userId    String
  task      Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user      User   @relation(fields: [userId], references: [id])
  @@id([taskId, userId])
}
```

### Comment
```prisma
model Comment {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}
```

### Activity
```prisma
model Activity {
  id        String       @id @default(cuid())
  type      ActivityType
  details   String?
  createdAt DateTime     @default(now())
  taskId    String
  task      Task         @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId    String
}
```

---

## API Endpoints

### Auth
- `GET /api/auth/[...nextauth]` - NextAuth handlers
- `GET /api/auth/session` - Get current session

### Communities
- `POST /api/communities` - Create community
- `GET /api/communities` - List user's communities
- `GET /api/communities/[id]` - Get community details
- `PATCH /api/communities/[id]` - Update community
- `DELETE /api/communities/[id]` - Delete community
- `POST /api/communities/[id]/join` - Join via invite code
- `POST /api/communities/[id]/leave` - Leave community
- `GET /api/communities/[id]/members` - List members
- `DELETE /api/communities/[id]/members/[userId]` - Remove member

### Lists
- `POST /api/lists` - Create list
- `GET /api/lists` - Get lists by community
- `PATCH /api/lists/[id]` - Update list
- `DELETE /api/lists/[id]` - Delete list
- `POST /api/lists/[id]/reorder` - Reorder lists

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get tasks (with filters)
- `GET /api/tasks/[id]` - Get task details
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `POST /api/tasks/[id]/subtasks` - Add subtask
- `PATCH /api/tasks/[id]/subtasks/[subtaskId]` - Update subtask
- `DELETE /api/tasks/[id]/subtasks/[subtaskId]` - Delete subtask
- `POST /api/tasks/[id]/assign` - Assign user
- `DELETE /api/tasks/[id]/assign/[userId]` - Unassign user

### Labels
- `POST /api/labels` - Create label
- `GET /api/labels` - Get labels by community
- `PATCH /api/labels/[id]` - Update label
- `DELETE /api/labels/[id]` - Delete label

### Comments
- `POST /api/tasks/[id]/comments` - Add comment
- `PATCH /api/comments/[id]` - Update comment
- `DELETE /api/comments/[id]` - Delete comment

### Activity
- `GET /api/tasks/[id]/activity` - Get task activity log

---

## UI Component Structure

```
src/
├── components/
│   ├── ui/                    # shadcn components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── tooltip.tsx
│   │   ├── popover.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── community-selector.tsx
│   ├── task/
│   │   ├── task-item.tsx
│   │   ├── task-form.tsx
│   │   ├── task-card.tsx
│   │   ├── task-list.tsx
│   │   ├── task-calendar.tsx
│   │   ├── task-kanban.tsx
│   │   ├── task-timeline.tsx
│   │   ├── task-filter.tsx
│   │   └── task-detail.tsx
│   ├── list/
│   │   ├── list-card.tsx
│   │   ├── list-form.tsx
│   │   └── list-header.tsx
│   ├── community/
│   │   ├── community-card.tsx
│   │   ├── invite-modal.tsx
│   │   ├── member-list.tsx
│   │   └── settings-modal.tsx
│   └── common/
│       ├── priority-badge.tsx
│       ├── date-picker.tsx
│       ├── color-picker.tsx
│       └── loading-spinner.tsx
├── app/
│   ├── (auth)/
│   │   └── signin/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── communities/
│   │       └── [communityId]/
│   │           ├── page.tsx
│   │           ├── lists/
│   │           └── settings/
│   └── api/
│       └── ...
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── use-tasks.ts
│   ├── use-lists.ts
│   └── use-community.ts
└── types/
    └── index.ts
```

---

## Development Phases

### Phase 1: Setup & Auth (Week 1) ✅ COMPLETE
- [x] Initialize Next.js project with TypeScript
- [x] Install and configure TailwindCSS + shadcn/ui
- [x] Set up Prisma with PostgreSQL (Neon/Vercel Postgres)
- [x] Configure NextAuth.js with Google
- [x] Create base layout components (Header, Sidebar, MobileNav, CommunitySelector)

### Phase 2: Core Data (Week 2) ✅ COMPLETE (Backend) / 🔄 In Progress (UI)
- [x] Implement database schema
- [x] Create API routes for CRUD (Lists, Labels, Comments, Activity)
- [x] Build community management (API)
- [x] Build list management (API)
- [x] Build task management (API)
- [ ] Build community UI pages
- [ ] Build list management UI
- [ ] Build task management UI (forms, lists)

### Phase 3: UI Components (Week 3) 🔄 In Progress
- [ ] Build task list view (priority, due dates, assignees)
- [ ] Build task form with all fields (modal/page)
- [ ] Build kanban board (columns, drag-drop)
- [ ] Build calendar view (monthly/weekly)
- [ ] Build timeline view (Gantt-style)
- [ ] Build task detail view (subtasks, comments, activity)

### Phase 4: Collaboration (Week 4) ✅ COMPLETE (Backend) / 🔄 In Progress (UI)
- [x] Implement comments (API)
- [x] Implement activity log (API)
- [ ] Real-time updates (Pusher or polling) - Phase 5
- [x] Filters and smart views (API done, UI pending)

### Phase 5: Polish (Week 5) 🔄 In Progress
- [x] Dark mode (CSS variables done)
- [x] Animations (Tailwind animations added)
- [ ] Mobile responsiveness (partial - need testing)
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Real-time sync implementation
- [ ] Presence indicators
- [ ] Optimistic UI updates

---

## Acceptance Criteria

### Must Have (MVP) 🔄 In Progress
- [x] Google OAuth login (configured)
- [x] Create/join community (API done)
- [x] Create/edit/delete lists (API done)
- [x] Create/edit/delete tasks with dates (API done)
- [x] Priority levels (API done)
- [x] Assign tasks to members (API done)
- [x] Mark tasks complete (API done)
- [ ] List view (UI pending)
- [x] Comments on tasks (API done)
- [ ] Responsive design (partial - base CSS done)

### Should Have 🔄 In Progress
- [ ] Kanban view (pending)
- [ ] Calendar view (pending)
- [ ] Filters (Today, This Week, Overdue) (API done, UI pending)
- [x] Labels/tags (API done)
- [x] Subtasks (API done)
- [x] Activity log (API done)

### Nice to Have ⏳ Pending
- [ ] Timeline view
- [x] Dark mode (CSS done)
- [ ] Reminders
- [ ] Real-time sync

---

## Notes

- Using Vercel Postgres (free tier) for database
- Using shadcn/ui for all UI components (customized)
- Focus on premium UI/UX with smooth animations
- Mobile-first approach for responsive design
- Optimistic UI updates for better UX
