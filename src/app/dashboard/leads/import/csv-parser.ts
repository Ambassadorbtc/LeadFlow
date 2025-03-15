export interface CSVRow {
  [key: string]: string;
}

export interface ParseResult {
  headers: string[];
  data: CSVRow[];
  errors: string[];
}

export function parseCSV(csvContent: string): ParseResult {
  const result: ParseResult = {
    headers: [],
    data: [],
    errors: [],
  };

  try {
    // Split by lines and filter out empty lines
    const lines = csvContent
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "");

    if (lines.length === 0) {
      result.errors.push("CSV file is empty");
      return result;
    }

    // Parse headers (first line)
    result.headers = parseCSVLine(lines[0]);

    if (result.headers.length === 0) {
      result.errors.push("No headers found in CSV file");
      return result;
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      // Skip empty lines
      if (values.length === 0) continue;

      // Check if row has correct number of columns
      if (values.length !== result.headers.length) {
        result.errors.push(
          `Row ${i + 1} has ${values.length} columns, expected ${result.headers.length}`,
        );
        continue;
      }

      // Create object from headers and values
      const row: CSVRow = {};
      for (let j = 0; j < result.headers.length; j++) {
        row[result.headers[j]] = values[j];
      }

      result.data.push(row);
    }

    if (result.data.length === 0) {
      result.errors.push("No data rows found in CSV file");
    }
  } catch (error) {
    result.errors.push(
      `Error parsing CSV: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return result;
}

// Helper function to parse a CSV line respecting quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Handle quotes
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Double quotes inside quotes - add a single quote
        current += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = "";
    } else {
      // Add character to current field
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

export function mapCSVToLeads(
  data: CSVRow[],
  mappings: Record<string, string>,
): any[] {
  return data.map((row) => {
    const lead: Record<string, any> = {
      // Default values
      status: "New",
      created_at: new Date().toISOString(),
    };

    // Apply mappings
    Object.entries(mappings).forEach(([csvField, dbField]) => {
      if (csvField && dbField && row[csvField] !== undefined) {
        lead[dbField] = row[csvField];
      }
    });

    return lead;
  });
}
