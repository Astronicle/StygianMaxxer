const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// ─── Token helpers (localStorage) ────────────────────────────────────────────
// Dispatched whenever the token is set/cleared so components (e.g. Navbar)
// can update their auth state immediately without a full page reload.
export const AUTH_CHANGE_EVENT = "smx_auth_change";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("smx_token");
}

export function setToken(token: string): void {
  localStorage.setItem("smx_token", token);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearToken(): void {
  localStorage.removeItem("smx_token");
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
// Automatically attaches the JWT Bearer token if one exists in localStorage.
// Throws an Error with the backend's message on non-2xx responses.
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

  // 204 No Content — nothing to parse
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
// Backend DTO: AuthResponse { token: String, type: String }
export interface AuthResponse {
  token: string;
  type: string;   // always "Bearer"
}

// POST /auth/login  → body: { usernameOrEmail, password }
export async function apiLogin(usernameOrEmail: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { usernameOrEmail, password },
  });
}

// POST /auth/register  → body: { username, email, password }
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

// ─── Account ──────────────────────────────────────────────────────────────────
// Backend DTO: AccountProfileResponse { accountId, username, email, avatarCharId, avatarCharName, creationDate }
export interface AccountProfile {
  accountId: number;
  username: string;
  email: string | null;         // null on public profiles
  avatarCharId: number | null;  // null if no avatar set
  avatarCharName: string | null; // null if no avatar set
  creationDate: string;         // ISO OffsetDateTime string
}

// GET /api/accounts/me  (requires JWT)
export async function apiGetMyProfile(): Promise<AccountProfile> {
  return apiFetch<AccountProfile>("/api/accounts/me");
}

// GET /api/accounts/{accountId}  (public)
export async function apiGetProfile(accountId: number): Promise<AccountProfile> {
  return apiFetch<AccountProfile>(`/api/accounts/${accountId}`);
}

// GET /api/accounts/by-username/{username}  (public)
export async function apiGetProfileByUsername(username: string): Promise<AccountProfile> {
  return apiFetch<AccountProfile>(`/api/accounts/by-username/${encodeURIComponent(username)}`);
}

// Backend DTO: AccountSummaryResponse { accountId, username, avatarCharId, avatarCharName }
// Lightweight shape used for the user browse list.
export interface AccountSummary {
  accountId: number;
  username: string;
  avatarCharId: number | null;
  avatarCharName: string | null;
}

// GET /api/accounts?page=&size=  (public)
export async function apiGetAccounts(page = 0, size = 24): Promise<Page<AccountSummary>> {
  return apiFetch<Page<AccountSummary>>(`/api/accounts?page=${page}&size=${size}`);
}

// ─── Posts — browse ───────────────────────────────────────────────────────────
// Backend DTO: PostSummaryResponse { postId, title, username, stygianName, createdAt, averageRating, ratingCount }
export interface PostSummary {
  postId: number;
  title: string;
  username: string;
  stygianName: string;
  createdAt: string;            // ISO OffsetDateTime string
  averageRating: number | null; // null if no ratings yet
  ratingCount: number;          // NOTE: backend returns Long — JS treats it as number fine
}

// Generic Spring Page wrapper
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;               // current page, 0-indexed
}

// GET /api/posts?page=&size=  (public)
export async function apiGetPosts(page = 0, size = 12): Promise<Page<PostSummary>> {
  return apiFetch<Page<PostSummary>>(`/api/posts?page=${page}&size=${size}`);
}

// GET /api/posts?accountId=&size=50  — filtered to one user (requires JWT for own posts)
export async function apiGetMyPosts(accountId: number): Promise<Page<PostSummary>> {
  return apiFetch<Page<PostSummary>>(`/api/posts?accountId=${accountId}&size=50`);
}

// ─── Posts — detail ───────────────────────────────────────────────────────────
// These mirror PostBossCharacterResponse, PostBossResponse, PostResponse from the backend.

export interface PostBossCharacter {
  charId: number;       // backend: Short
  charName: string;
  charSlug: string;     // used to build Supabase icon URL
  slot: number;         // which slot this character fills (1-based)
  hasSig: boolean;      // has signature weapon
  cons: number;         // constellation level
}

export interface PostBoss {
  bossId: number;       // backend: Short
  bossSlug: string;     // used to build Supabase icon URL
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

// GET /api/posts/{postId}  (public)
export async function apiGetPost(postId: number): Promise<PostDetail> {
  return apiFetch<PostDetail>(`/api/posts/${postId}`);
}

// DELETE /api/posts/{postId}  (requires JWT, owner only)
export async function apiDeletePost(postId: number): Promise<void> {
  return apiFetch<void>(`/api/posts/${postId}`, { method: "DELETE" });
}

// PostBossCharacter update shape (same as create)
export interface PostBossUpdateEntry {
  bossId: number;
  buildInfo: string;
  characters: {
    charId: number;
    slot: number;
    hasSig: boolean;
    cons: number;
  }[];
}

// PATCH /api/posts/{postId}  (requires JWT, owner only)
// All fields optional — only send what changed.
export async function apiUpdatePost(
  postId: number,
  body: {
    title?: string;
    description?: string;
    videoLink?: string;
    bosses?: PostBossUpdateEntry[];
  }
): Promise<PostDetail> {
  return apiFetch<PostDetail>(`/api/posts/${postId}`, {
    method: "PATCH",
    body,
  });
}

// ─── Rating ───────────────────────────────────────────────────────────────────
// Backend DTO: RatingSummaryResponse { average: Double, count: Long }
export interface RatingSummary {
  average: number | null; // null if no ratings yet
  count: number;
}

// GET /api/posts/{postId}/rating-summary  (public)
export async function apiGetPostRatingSummary(postId: number): Promise<RatingSummary> {
  return apiFetch<RatingSummary>(`/api/posts/${postId}/rating-summary`);
}

// POST /api/posts/{postId}/rate  (requires JWT)
// score must be 1–5 per backend validation
export async function apiRatePost(postId: number, score: number): Promise<void> {
  return apiFetch<void>(`/api/posts/${postId}/rate`, {
    method: "POST",
    body: { score },
  });
}

// GET /api/posts/{postId}/bosses  (public)
// Lightweight list of bosses killed in a post — { id, slug, name } each.
// Used to render boss icons on post summary cards (e.g. user profile).
export async function apiGetPostBosses(postId: number): Promise<Boss[]> {
  return apiFetch<Boss[]>(`/api/posts/${postId}/bosses`);
}

// ─── Stygian ──────────────────────────────────────────────────────────────────
// Backend DTOs: StygianBossResponse { bossId, bossSlug, bossName, slot }
//               StygianResponse     { id, name, version, bosses: StygianBossResponse[] }

export interface StygianBoss {
  bossId: number;    // backend: short
  bossSlug: string;  // used to build Supabase icon URL
  bossName: string;
  slot: number;      // which slot this boss occupies in the cycle
}

export interface Stygian {
  id: number;        // backend: short
  name: string;
  version: string;   // e.g. "6.2"
  bosses: StygianBoss[];
}

// GET /api/stygian  (public)
export async function apiGetStygians(): Promise<Stygian[]> {
  return apiFetch<Stygian[]>("/api/stygian");
}

// GET /api/stygian/{id}  (public)
export async function apiGetStygian(id: number): Promise<Stygian> {
  return apiFetch<Stygian>(`/api/stygian/${id}`);
}

// ─── Bosses (lookup) ──────────────────────────────────────────────────────────
// Backend DTO: BossResponse { id: short, slug: String, name: String }

export interface Boss {
  id: number;    // backend: short
  slug: string;  // used to build Supabase icon URL
  name: string;
}

// GET /api/bosses  (public)
export async function apiGetBosses(): Promise<Boss[]> {
  return apiFetch<Boss[]>("/api/bosses");
}

// GET /api/bosses/{slug}  (public)
export async function apiGetBoss(slug: string): Promise<Boss> {
  return apiFetch<Boss>(`/api/bosses/${slug}`);
}
