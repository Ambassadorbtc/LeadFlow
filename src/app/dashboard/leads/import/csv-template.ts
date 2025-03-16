export const CSV_TEMPLATE_HEADERS = [
  "Prospect ID",
  "Business Name",
  "Contact Name",
  "Contact Email",
  "Phone Number",
  "Address",
  "Owner",
  "Created At",
];

export const generateCSVTemplate = () => {
  return CSV_TEMPLATE_HEADERS.join(",");
};
