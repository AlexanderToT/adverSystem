import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并多个类名，并且使用tailwind-merge优化
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 