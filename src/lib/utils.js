import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional Tailwind class names.
 * @param {...unknown} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
