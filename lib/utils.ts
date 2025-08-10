import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize and validate a user-provided URL for HTTP(S) requests.
 * - Trims whitespace and surrounding quotes (including smart quotes)
 * - Adds https:// if protocol is missing
 * - Rejects non-http(s) protocols
 * - Performs a minimal hostname sanity check
 *
 * Returns a fully-qualified URL string or null if invalid.
 */
export function normalizeAndValidateHttpUrl(input: string): string | null {
  if (typeof input !== "string") return null

  let candidate = input.trim()

  // Strip surrounding straight or smart quotes
  candidate = candidate.replace(/^[\s'"\u2018\u2019\u201C\u201D]+|[\s'"\u2018\u2019\u201C\u201D]+$/g, "")

  // Remove common trailing punctuation from copy-paste contexts
  candidate = candidate.replace(/[)\].,;:!?]+$/, "")

  // Default to https if no protocol
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = "https://" + candidate
  }

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null

    const hostname = parsed.hostname
    const isIPv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)
    const looksLikeDomain = hostname.includes(".")
    const isLocalhost = hostname === "localhost"

    if (!hostname || (!isIPv4 && !looksLikeDomain && !isLocalhost)) return null

    return parsed.toString()
  } catch {
    return null
  }
}