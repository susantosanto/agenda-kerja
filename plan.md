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

### Phase 1: Authentication & User Management

#### 1.1 Google OAuth Authentication
- [ ] Implement NextAuth.js with Google Provider
- [ ] Session management with JWT
- [ ] Protected routes middleware
- [ ] User profile sync from Google (name, email, avatar)
- [ ] Sign out functionality

#### 1.2 User Profile
- [ ] Display user avatar from Google
- [ ] Show user name and email
- [ ] User presence indicator (online/offline)

---

### Phase 2: Community & List Management

#### 2.1 Community Creation
- [ ] Create community with name and description
- [ ] Generate unique invite code (6 characters)
- [ ] Community owner can manage members
- [ ] Invite members via code

#### 2.2 Community Members
- [ ] Join community with invite code
- [ ] View member list
- [ ] Member roles: Owner, Admin, Member
- [ ] Remove members (Owner/Admin only)
- [ ] Leave community

#### 2.3 List/Project Management
- [ ] Create multiple lists per community
- [ ] Edit list name and description
- [ ] Delete list (with confirmation)
- [ ] Archive list
- [ ] Pin important lists
- [ ] Color-code lists

---

### Phase 3: Task Management (Core)

#### 3.1 Task CRUD
- [ ] Create task with title (required)
- [ ] Add description (rich text markdown)
- [ ] Set priority (P1-P4 with color coding)
- [ ] Set start date and time
- [ ] Set due date and time
- [ ] Set duration (estimated time)
- [ ] Mark as completed/incomplete
- [ ] Edit task inline
- [ ] Delete task (with confirmation)

#### 3.2 Task Organization
- [ ] Drag and drop reorder tasks
- [ ] Add subtasks (unlimited nesting)
- [ ] Task checklists within subtasks
- [ ] Star/favorite tasks
- [ ] Bulk select and actions

#### 3.3 Task Labels/Tags
- [ ] Create custom labels with colors
- [ ] Assign multiple labels per task
- [ ] Filter by label
- [ ] Edit/delete labels

#### 3.4 Task Assignment
- [ ] Assign task to one or more members
- [ ] View "Assigned to Me" filter
- [ ] Unassigned task indicator

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

### Phase 5: Collaboration Features

#### 5.1 Comments & Discussion
- [ ] Add comments to tasks
- [ ] @mention members
- [ ] Edit/delete own comments
- [ ] Rich text in comments

#### 5.2 Activity Log
- [ ] Track all changes (created, updated, deleted)
- [ ] Show who made changes
- [ ] Show when changes made
- [ ] Filter activity by user

#### 5.3 Real-time Updates
- [ ] Live sync across all members
- [ ] Presence indicators
- [ ] Optimistic UI updates

---

### Phase 6: Filters & Smart Views

#### 6.1 Predefined Filters
- [ ] My Tasks (assigned to me)
- [ ] Today (due today)
- [ ] This Week (due this week)
- [ ] Overdue (past due date)
- [ ] High Priority (P1, P2)
- [ ] Unassigned

#### 6.2 Custom Filters
- [ ] Create custom filter combinations
- [ ] Save custom filters
- [ ] Quick access to saved filters

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

### Phase 1: Setup & Auth (Week 1)
- [ ] Initialize Next.js project with TypeScript
- [ ] Install and configure TailwindCSS + shadcn/ui
- [ ] Set up Prisma with PostgreSQL (Neon/Vercel Postgres)
- [ ] Configure NextAuth.js with Google
- [ ] Create base layout components

### Phase 2: Core Data (Week 2)
- [ ] Implement database schema
- [ ] Create API routes for CRUD
- [ ] Build community management
- [ ] Build list management
- [ ] Build task management

### Phase 3: UI Components (Week 3)
- [ ] Build task list view
- [ ] Build task form with all fields
- [ ] Build kanban board
- [ ] Build calendar view
- [ ] Build timeline view

### Phase 4: Collaboration (Week 4)
- [ ] Implement comments
- [ ] Implement activity log
- [ ] Real-time updates (Pusher or polling)
- [ ] Filters and smart views

### Phase 5: Polish (Week 5)
- [ ] Dark mode
- [ ] Animations
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Bug fixes

---

## Acceptance Criteria

### Must Have (MVP)
- [ ] Google OAuth login
- [ ] Create/join community
- [ ] Create/edit/delete lists
- [ ] Create/edit/delete tasks with dates
- [ ] Priority levels
- [ ] Assign tasks to members
- [ ] Mark tasks complete
- [ ] List view
- [ ] Comments on tasks
- [ ] Responsive design

### Should Have
- [ ] Kanban view
- [ ] Calendar view
- [ ] Filters (Today, This Week, Overdue)
- [ ] Labels/tags
- [ ] Subtasks
- [ ] Activity log

### Nice to Have
- [ ] Timeline view
- [ ] Dark mode
- [ ] Reminders
- [ ] Real-time sync

---

## Notes

- Using Vercel Postgres (free tier) for database
- Using shadcn/ui for all UI components (customized)
- Focus on premium UI/UX with smooth animations
- Mobile-first approach for responsive design
- Optimistic UI updates for better UX
