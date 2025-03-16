import { CSVRow } from "../csv-parser";

export function mapCSVToLeads(csvData: CSVRow[], userId: string) {
  return csvData.map((row) => ({
    prospect_id:
      row["Prospect ID"] ||
      row.prospect_id ||
      `LEAD-${Math.floor(Math.random() * 10000)}`,
    business_name:
      row["Business Name"] || row.business_name || "Unknown Business",
    contact_name: row["Contact Name"] || row.contact_name || "Unknown Contact",
    contact_email: row["Contact Email"] || row.contact_email || null,
    phone: row["Phone Number"] || row.phone || null,
    address: row["Address"] || row.address || null,
    status: row.status || "New",
    owner: row["Owner"] || row.owner || null,
    deal_value:
      row["Deal Value"] || row.deal_value
        ? Number(row["Deal Value"] || row.deal_value)
        : null,
    bf_interest:
      typeof row.bf_interest === "string"
        ? row.bf_interest.toLowerCase() === "true" ||
          row.bf_interest.toLowerCase() === "yes" ||
          row.bf_interest === "1"
        : Boolean(row.bf_interest),
    ct_interest:
      typeof row.ct_interest === "string"
        ? row.ct_interest.toLowerCase() === "true" ||
          row.ct_interest.toLowerCase() === "yes" ||
          row.ct_interest === "1"
        : Boolean(row.ct_interest),
    ba_interest:
      typeof row.ba_interest === "string"
        ? row.ba_interest.toLowerCase() === "true" ||
          row.ba_interest.toLowerCase() === "yes" ||
          row.ba_interest === "1"
        : Boolean(row.ba_interest),
    user_id: userId,
    created_at: row["Created At"]
      ? convertDateFormat(row["Created At"])
      : new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source: "CSV Import",
  }));
}

// Helper function to convert date formats
function convertDateFormat(dateStr: string): string {
  // Check if it's in UK format (DD/MM/YYYY)
  const ukDatePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateStr.match(ukDatePattern);

  if (match) {
    // Convert from DD/MM/YYYY to YYYY-MM-DD for database
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3];
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  return new Date().toISOString();
}
