import { API } from "@/domain/constants";

export async function apiPost(endpoint: string, body: object) {
  const r = await fetch(`${API}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}
