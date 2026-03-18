const CF_API_BASE = "https://api.cloudflare.com/client/v4";

function getConfig() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  if (!token || !zoneId) {
    throw new Error("CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are required");
  }
  return { token, zoneId };
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export interface CustomHostnameResult {
  id: string;
  status: string;
  ssl?: { status: string };
}

export async function createCustomHostname(
  hostname: string
): Promise<CustomHostnameResult> {
  const { token, zoneId } = getConfig();

  const res = await fetch(`${CF_API_BASE}/zones/${zoneId}/custom_hostnames`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      hostname,
      ssl: { method: "http", type: "dv", settings: { min_tls_version: "1.2" } },
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    const msg = data.errors?.[0]?.message || "Failed to create custom hostname";
    throw new Error(msg);
  }

  return data.result;
}

export async function getCustomHostname(
  id: string
): Promise<CustomHostnameResult> {
  const { token, zoneId } = getConfig();

  const res = await fetch(
    `${CF_API_BASE}/zones/${zoneId}/custom_hostnames/${id}`,
    { method: "GET", headers: headers(token) }
  );

  const data = await res.json();
  if (!res.ok || !data.success) {
    const msg = data.errors?.[0]?.message || "Failed to get custom hostname";
    throw new Error(msg);
  }

  return data.result;
}

export async function deleteCustomHostname(id: string): Promise<void> {
  const { token, zoneId } = getConfig();

  const res = await fetch(
    `${CF_API_BASE}/zones/${zoneId}/custom_hostnames/${id}`,
    { method: "DELETE", headers: headers(token) }
  );

  const data = await res.json();
  if (!res.ok || !data.success) {
    const msg = data.errors?.[0]?.message || "Failed to delete custom hostname";
    throw new Error(msg);
  }
}
