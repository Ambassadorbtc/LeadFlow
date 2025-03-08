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
