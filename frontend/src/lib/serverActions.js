"use server";

import { revalidateTag } from "next/cache";

/**
 * Revalidate inventory cache on demand
 * Call this after creating, updating, or deleting inventory items
 * This ensures fresh data is served without waiting for ISR timeout
 */
export async function revalidateInventory() {
  try {
    revalidateTag("inventory");
    return { success: true, message: "Inventory cache revalidated" };
  } catch (error) {
    console.error("Error revalidating inventory:", error);
    return { success: false, message: "Failed to revalidate cache" };
  }
}

/**
 * Batch revalidate multiple admin pages
 */
export async function revalidateAdminPages(pages = []) {
  try {
    pages.forEach((page) => {
      revalidateTag(page);
    });
    return { success: true, message: `Revalidated ${pages.length} pages` };
  } catch (error) {
    console.error("Error revalidating admin pages:", error);
    return { success: false, message: "Failed to revalidate pages" };
  }
}

/**
 * Revalidate all admin cache
 */
export async function revalidateAllAdmin() {
  try {
    revalidateTag("admin");
    revalidateTag("inventory");
    revalidateTag("products");
    revalidateTag("orders");
    revalidateTag("users");

    return { success: true, message: "All admin caches revalidated" };
  } catch (error) {
    console.error("Error revalidating admin cache:", error);
    return { success: false, message: "Failed to revalidate admin cache" };
  }
}
