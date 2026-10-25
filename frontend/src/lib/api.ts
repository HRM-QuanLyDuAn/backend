// ============================================================
// API client dùng chung — gọi qua api-gateway duy nhất (:4000).
// Cả web và mobile dùng chung 1 cửa gateway, không gọi thẳng 4001-4005.
// ============================================================

export const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";

export interface ApiErrorShape {
  code: string;
  message: string;
}

export class GatewayError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) {
    const err = (body as { error?: ApiErrorShape } | null)?.error;
    throw new GatewayError(
      err?.code || `HTTP_${res.status}`,
      err?.message || `Lỗi hệ thống (${res.status})`,
      res.status
    );
  }
  if (body !== null && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${GATEWAY_URL}${path}`, {
      credentials: "include",
      signal: controller.signal,
    });
    return await parseEnvelope<T>(res);
  } finally {
    clearTimeout(timer);
  }
}

export async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${GATEWAY_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return await parseEnvelope<T>(res);
  } finally {
    clearTimeout(timer);
  }
}

export async function apiPut<T>(path: string, payload?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${GATEWAY_URL}${path}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    });
    return await parseEnvelope<T>(res);
  } finally {
    clearTimeout(timer);
  }
}

export async function apiDelete<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${GATEWAY_URL}${path}`, {
      method: "DELETE",
      credentials: "include",
      signal: controller.signal,
    });
    return await parseEnvelope<T>(res);
  } finally {
    clearTimeout(timer);
  }
}

export function gatewayHealth() {
  return apiGet<{ status: string; service: string; time: string }>("/health");
}
