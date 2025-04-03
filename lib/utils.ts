import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

export function getVideoExtension(filename: string): string | null {
  const match = filename.match(/\.([^.]+)$/)
  return match ? match[1].toLowerCase() : null
}

export function isValidVideoFormat(extension: string | null): boolean {
  if (!extension) return false
  return ["mp4", "mov", "avi", "webm"].includes(extension)
}

export function isValidVideoSize(fileSize: number): boolean {
  const MAX_SIZE_IN_BYTES = 500 * 1024 * 1024 // 500MB
  return fileSize <= MAX_SIZE_IN_BYTES
}

