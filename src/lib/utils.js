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

/**
 * Format a money amount with two decimals (display only).
 * @param {number} amount
 * @returns {string} e.g. "42.50", "-18.75"
 */
export function formatAmount(amount) {
  return (Number(amount) || 0).toFixed(2);
}
