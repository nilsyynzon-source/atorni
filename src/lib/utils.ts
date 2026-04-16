import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy')
}

export function formatDateTime(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy h:mm a')
}

export function formatTime(dateString: string): string {
  return format(parseISO(dateString), 'h:mm a')
}

export function timeAgo(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim()
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
}

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-zinc-100 text-zinc-600',
  confirmed: 'bg-zinc-950 text-white',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-zinc-100 text-zinc-500',
}
