import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatTime = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-500/20 text-green-500 dark:bg-green-500/10 dark:text-green-400'
    case 'pending':
      return 'bg-amber-500/20 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
    case 'blockage':
      return 'bg-red-500/20 text-red-600 dark:bg-red-500/10 dark:text-red-400'
    default:
      return 'bg-slate-500/20 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400'
  }
}
