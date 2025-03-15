import { CSVRow } from "../csv-parser";

export function mapCSVToLeads(csvData: CSVRow[], userId: string) {
  return csvData.map((row) => ({
    prospect_id: row.prospect_id || `LEAD-${Math.floor(Math.random() * 10000)}`,
    business_name: row.business_name || "Unknown Business",
    contact_name: row.contact_name || "Unknown Contact",
    contact_email: row.contact_email || null,
    phone: row.phone || null,
    address: row.address || null,
    status: row.status || "New",
    owner: row.owner || null,
    deal_value: row.deal_value ? Number(row.deal_value) : null,
    bf_interest:
      row.bf_interest === "true" || row.bf_interest === "yes" || false,
    ct_interest:
      row.ct_interest === "true" || row.ct_interest === "yes" || false,
    ba_interest:
      row.ba_interest === "true" || row.ba_interest === "yes" || false,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}
