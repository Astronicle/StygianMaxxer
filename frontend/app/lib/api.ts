const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// Token helpers (localStorage for now)
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("smx_token");
}

export function setToken(token: string): void {
  localStorage.setItem("smx_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("smx_token");
}

// Core fetch wrapper
type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    // Try to extract backend error message
    let message = `API error ${res.status}`;
    try {
      const err = await res.json();
      message = err.message ?? err.error ?? message;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }

  // 204 No Content — nothing to parse
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// Auth API
export interface AuthResponse {
  token: string;
  type: string;
}

export async function apiLogin(usernameOrEmail: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { usernameOrEmail, password },
  });
}

export async function apiRegister(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: { username, email, password },
  });
}