import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates distance between two coordinates in miles using Haversine formula
 */
export function calculateDistanceInMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return "< 0.1 mi";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

/** Where users land after login when no specific destination was requested */
export const DEFAULT_POST_LOGIN_PATH = "/courts";

/**
 * localStorage key used to carry the intended destination across the Google
 * OAuth round-trip (the query string is lost when we leave the app).
 */
export const POST_LOGIN_REDIRECT_KEY = "postLoginRedirect";

/**
 * Validates a post-login redirect target before we navigate to it.
 *
 * Only same-origin relative paths are allowed. Anything absolute
 * ("http://evil.com") or protocol-relative ("//evil.com", "/\evil.com") is
 * rejected so a crafted ?redirect= link cannot bounce users off-site.
 */
export function getSafeRedirectPath(
  path: string | null | undefined,
  fallback: string = DEFAULT_POST_LOGIN_PATH
): string {
  if (!path) return fallback;

  const trimmed = path.trim();

  // Must be a rooted relative path, and must not start a new host
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return fallback;

  // Never send the user back to an auth page — that would loop
  if (/^\/(login|register|forgot-password|reset-password|verify-otp)(\/|\?|$)/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
