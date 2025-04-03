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
      return 'bg-emerald-950/30 text-emerald-400 border border-emerald-800/30'
    case 'pending':
      return 'bg-amber-950/30 text-amber-400 border border-amber-800/30'
    case 'blockage':
      return 'bg-red-950/30 text-red-400 border border-red-800/30'
    default:
      return 'bg-slate-800/50 text-slate-300 border border-slate-700/50'
  }
}
