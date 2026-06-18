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
    let message = `API error ${res.status}`;
    try {
      const err = await res.json();
      message = err.message ?? err.error ?? message;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }

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

// Account
export interface AccountProfile {
  accountId: number;
  username: string;
  email: string | null;
  avatarCharId: number | null;
  avatarCharName: string | null;
  creationDate: string;
}

export async function apiGetMyProfile(): Promise<AccountProfile> {
  return apiFetch<AccountProfile>("/api/accounts/me");
}

// Posts
export interface PostSummary {
  postId: number;
  title: string;
  username: string;
  stygianName: string;
  createdAt: string;
  averageRating: number | null;
  ratingCount: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-indexed)
}

// Public — no JWT required
export async function apiGetPosts(page = 0, size = 12): Promise<Page<PostSummary>> {
  return apiFetch<Page<PostSummary>>(`/api/posts?page=${page}&size=${size}`);
}

// My own posts filtered by accountId
export async function apiGetMyPosts(accountId: number): Promise<Page<PostSummary>> {
  return apiFetch<Page<PostSummary>>(`/api/posts?accountId=${accountId}&size=50`);
}
// Post detail
export interface PostBossCharacter {
  charId: number;
  charName: string;
  charSlug: string;
  slot: number;
  hasSig: boolean;
  cons: number;
}

export interface PostBoss {
  bossId: number;
  bossSlug: string;
  bossName: string;
  buildInfo: string | null;
  characters: PostBossCharacter[];
}

export interface PostDetail {
  postId: number;
  title: string;
  description: string | null;
  videoLink: string | null;
  createdAt: string;
  updatedAt: string;
  account: { accountId: number; username: string };
  stygian: { stygianId: number; stygianName: string; version: string };
  bosses: PostBoss[];
}

export interface RatingSummary {
  average: number | null;
  count: number;
}

export async function apiGetPost(postId: number): Promise<PostDetail> {
  return apiFetch<PostDetail>(`/api/posts/${postId}`);
}

export async function apiGetPostRatingSummary(postId: number): Promise<RatingSummary> {
  return apiFetch<RatingSummary>(`/api/posts/${postId}/rating-summary`);
}
