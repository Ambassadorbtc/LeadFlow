export interface CSVRow {
  [key: string]: string;
}

export function parseCSV(csvText: string): CSVRow[] {
  // Split the CSV text into lines
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return [];

  // Extract headers from the first line
  const headers = lines[0]
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map((header) => {
      // Remove quotes if they exist
      const trimmed = header.trim();
      return trimmed.startsWith('"') && trimmed.endsWith('"')
        ? trimmed.substring(1, trimmed.length - 1)
        : trimmed;
    });

  // Process each data row
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    try {
      const values = parseCSVLine(line);

      // Handle case where values length doesn't match headers length
      if (values.length !== headers.length) {
        console.warn(
          `Row ${i + 1}: column count mismatch (${values.length} values, ${headers.length} headers)`,
        );
        // If we have more values than headers, truncate
        // If we have fewer values than headers, pad with empty strings
        while (values.length < headers.length) values.push("");
        if (values.length > headers.length) values.length = headers.length;
      }

      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      rows.push(row);
    } catch (error) {
      console.error(`Error parsing row ${i + 1}:`, error);
      // Continue with next row instead of failing the entire import
    }
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
      // Handle escaped quotes (double quotes inside quoted fields)
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
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

export function mapCSVToLeads(csvData: any[], userId: string) {
  // Create a map to track used prospect IDs within this import batch
  const usedProspectIds = new Set<string>();

  return csvData.map((row, index) => {
    // Create a new lead object with ONLY the specified fields
    const lead: Record<string, any> = {
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      business_name: row.business_name || row["Business Name"] || "",
      contact_name: row.contact_name || row["Contact Name"] || "",
      contact_email: row.contact_email || row["Contact Email"] || "",
      phone: row.phone || row["Phone Number"] || "",
      address: row.address || row["Address"] || "",
      owner: row.owner || row["Owner"] || "",
    };

    // Get the prospect ID from the row or generate a new one
    let prospectId = row.prospect_id || row["Prospect ID"] || null;

    // If no prospect ID provided or it's already used in this batch, generate a unique one
    if (!prospectId || usedProspectIds.has(prospectId)) {
      prospectId = `LEAD-${Math.floor(Math.random() * 1000000)}-${index}`;
    }

    // Add to used IDs set and assign to lead
    usedProspectIds.add(prospectId);
    lead.prospect_id = prospectId;

    // Handle date format conversion from UK format (DD/MM/YYYY) to ISO
    if (row.created_at || row["Created At"]) {
      const dateStr = row.created_at || row["Created At"];
      if (typeof dateStr === "string") {
        // Check if it's in UK format (DD/MM/YYYY)
        const ukDatePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const match = dateStr.match(ukDatePattern);

        if (match) {
          // Convert from DD/MM/YYYY to YYYY-MM-DD for database
          const day = match[1].padStart(2, "0");
          const month = match[2].padStart(2, "0");
          const year = match[3];
          lead.created_at = `${year}-${month}-${day}T00:00:00.000Z`;
        }
      }
    }

    return lead;
  });
}
