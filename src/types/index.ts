import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export type Role = "OWNER" | "ADMIN" | "MEMBER"
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"
export type Priority = "P1" | "P2" | "P3" | "P4"
export type ActivityType =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "TASK_COMPLETED"
  | "TASK_UNCOMPLETED"
  | "TASK_ASSIGNED"
  | "TASK_UNASSIGNED"
  | "COMMENT_ADDED"
  | "COMMENT_DELETED"
  | "STATUS_CHANGED"

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface Community {
  id: string
  name: string
  description?: string | null
  inviteCode: string
  createdAt: Date
  updatedAt: Date
  ownerId: string
  owner: User
  members: CommunityMember[]
  lists: List[]
}

export interface CommunityMember {
  id: string
  role: Role
  joinedAt: Date
  userId: string
  communityId: string
  user: User
}

export interface List {
  id: string
  name: string
  description?: string | null
  color: string
  isArchived: boolean
  isPinned: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  communityId: string
  tasks: Task[]
}

export interface Task {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: Priority
  startDate?: Date | null
  dueDate?: Date | null
  duration?: number | null
  isStarred: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  listId: string
  createdById: string
  createdBy: User
  assignees: TaskAssignee[]
  subtasks: Subtask[]
  labels: TaskLabel[]
  comments: Comment[]
}

export interface Subtask {
  id: string
  title: string
  isDone: boolean
  order: number
  taskId: string
}

export interface Label {
  id: string
  name: string
  color: string
  communityId: string
}

export interface TaskLabel {
  taskId: string
  labelId: string
  label: Label
}

export interface TaskAssignee {
  taskId: string
  userId: string
  user: User
}

export interface Comment {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  taskId: string
  userId: string
  user: User
}

export interface Activity {
  id: string
  type: ActivityType
  details?: string | null
  createdAt: Date
  taskId: string
  userId: string
  user: User
}

export interface FilterOption {
  label: string
  value: string
 icon?: string
}

export interface ViewMode {
  id: string
  name: string
  icon: string
}