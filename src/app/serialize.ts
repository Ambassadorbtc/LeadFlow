"use server";

/**
 * Serialize data to ensure it can be safely passed to client components
 */
export async function serializeSupabaseData<T>(data: T): Promise<T> {
  if (data === null || data === undefined) {
    return data as T;
  }

  try {
    // Convert to JSON and back to create a plain object
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Serialization error:", error);
    // Return safe fallback based on data type
    return (Array.isArray(data) ? [] : {}) as T;
  }
}
