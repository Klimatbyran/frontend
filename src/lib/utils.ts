import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format large numbers with spaces as thousand separators
export function formatNumber(num: number) {
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Creates a URL-friendly slug from a string
 * Handles Swedish characters and other special characters
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function createSlug(text: string): string {
  if (!text) return "";

  return (
    text
      .toLowerCase()
      // Replace Scandinavian and common accented characters
      .replace(/[åäáàâ]/g, "a")
      .replace(/[öôòóø]/g, "o")
      .replace(/[éèêë]/g, "e")
      .replace(/[üûùú]/g, "u")
      .replace(/[íìîï]/g, "i")
      .replace(/[ýÿ]/g, "y")
      .replace(/[ç]/g, "c")
      .replace(/[ñ]/g, "n")
      // Replace spaces and multiple dashes with a single dash
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      // Remove all non-alphanumeric characters except dashes
      .replace(/[^a-z0-9-]/g, "")
      // Remove leading and trailing dashes
      .replace(/^-+|-+$/g, "")
  );
}
