// Airtable client
export async function fetchAirtable(tableName: string, options?: {
  maxRecords?: number;
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: "asc" | "desc" }>;
  fields?: string[];
}) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    throw new Error("Airtable credentials not configured");
  }

  const params = new URLSearchParams();
  if (options?.maxRecords) params.set("maxRecords", String(options.maxRecords));
  if (options?.filterByFormula) params.set("filterByFormula", options.filterByFormula);
  if (options?.sort) {
    options.sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction);
    });
  }
  if (options?.fields) {
    options.fields.forEach((f) => {
      params.append("fields[]", f);
    });
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?${params}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Airtable error: ${response.statusText}`);
  }

  return response.json();
}

// GoHighLevel client
export async function fetchGHL(endpoint: string) {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    throw new Error("GHL credentials not configured");
  }

  const url = `https://services.leadconnectorhq.com${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: "2021-07-28",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`GHL error: ${response.statusText}`);
  }

  return response.json();
}

// Hostaway client
export async function fetchHostaway(endpoint: string) {
  const apiKey = process.env.HOSTAWAY_API_KEY;
  const accountId = process.env.HOSTAWAY_ACCOUNT_ID;

  if (!apiKey || !accountId) {
    throw new Error("Hostaway credentials not configured");
  }

  const url = `https://api.hostaway.com/v1${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Hostaway-Account": accountId, // Required per Hostaway API docs
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Hostaway error (${response.status}): ${errorBody}`);
  }

  return response.json();
}
