import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return ""
  const d = new Date(date)
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return ""
  const d = new Date(date)
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 1:
      return "text-red-500 bg-red-50 dark:bg-red-950"
    case 2:
      return "text-orange-500 bg-orange-50 dark:bg-orange-950"
    case 3:
      return "text-blue-500 bg-blue-50 dark:bg-blue-950"
    case 4:
      return "text-gray-500 bg-gray-50 dark:bg-gray-950"
    default:
      return "text-gray-500 bg-gray-50"
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "TODO":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    case "IN_PROGRESS":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
    case "DONE":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
