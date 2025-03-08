/**
 * Utility functions for exporting and importing project components
 */

/**
 * Export a component or set of components to JSON format
 * @param components Array of component objects to export
 * @returns JSON string representation of the components
 */
export function exportComponentsToJSON(components: any[]) {
  return JSON.stringify(components, null, 2);
}

/**
 * Import components from JSON format
 * @param jsonString JSON string containing component definitions
 * @returns Array of component objects
 */
export function importComponentsFromJSON(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing component JSON:", error);
    return [];
  }
}

/**
 * Export project structure including components, pages, and configurations
 * @returns Project structure as a JSON string
 */
export function exportProjectStructure() {
  // This would be implemented to gather all relevant project files
  // For now, this is a placeholder
  const projectStructure = {
    components: [],
    pages: [],
    config: {},
  };

  return JSON.stringify(projectStructure, null, 2);
}

/**
 * Helper function to download content as a file
 * @param content Content to download
 * @param fileName Name of the file to download
 * @param contentType MIME type of the content
 */
export function downloadAsFile(
  content: string,
  fileName: string,
  contentType: string = "application/json",
) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file
 * @param data Array of objects to export
 * @param filename Name of the CSV file
 * @returns Boolean indicating success or failure
 */
export function exportToCSV(data: any[], filename: string): boolean {
  try {
    if (!data || data.length === 0) {
      return false;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      headers.join(","), // Header row
      ...data.map((row) => {
        return headers
          .map((header) => {
            // Handle values that might contain commas or quotes
            const value =
              row[header] === null || row[header] === undefined
                ? ""
                : row[header];
            const valueStr = String(value);
            return valueStr.includes(",") ||
              valueStr.includes('"') ||
              valueStr.includes("\n")
              ? `"${valueStr.replace(/"/g, '""')}"`
              : valueStr;
          })
          .join(",");
      }),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    return false;
  }
}
