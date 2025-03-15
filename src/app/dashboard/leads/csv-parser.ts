export interface CSVRow {
  [key: string]: string;
}

export function parseCSV(csvText: string): CSVRow[] {
  // Split the CSV text into lines
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return [];

  // Extract headers from the first line
  const headers = lines[0].split(",").map((header) => header.trim());

  // Process each data row
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);
    if (values.length !== headers.length) {
      console.warn(`Skipping row ${i + 1}: column count mismatch`);
      continue;
    }

    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    rows.push(row);
  }

  return rows;
}

// Helper function to parse a CSV line, handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());
  return result;
}
