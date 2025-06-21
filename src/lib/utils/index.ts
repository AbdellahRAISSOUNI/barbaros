import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

// Combines class names with Tailwind's merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date using dayjs
export function formatDate(date: Date | string, format = "MMMM D, YYYY") {
  return dayjs(date).format(format);
}

// Format time using dayjs
export function formatTime(date: Date | string, format = "h:mm A") {
  return dayjs(date).format(format);
}

// Generate a random string for IDs
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, length + 2);
}

// Capitalize first letter of a string
export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Convert a string to slug format
export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
} 