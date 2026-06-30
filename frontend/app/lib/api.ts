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

// Decodes the JWT payload client-side to read the logged-in account's id
// (the token's `sub` claim). This is for UI convenience only — e.g. hiding
// the "rate this post" widget on your own posts — never for access control;
// the backend independently enforces every permission check.
export function getCurrentAccountId(): number | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const claims = JSON.parse(json) as { sub?: string };
    return claims.sub ? Number(claims.sub) : null;
  } catch {
    return null;
  }
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
// Backend DTO: AccountProfileResponse { accountId, username, email, avatarCharId, avatarCharName, avatarCharSlug, creationDate }
export interface AccountProfile {
  accountId: number;
  username: string;
  email: string | null;         // null on public profiles
  avatarCharId: number | null;  // null if no avatar set
  avatarCharName: string | null; // null if no avatar set
  avatarCharSlug: string | null; // null if no avatar set — use this (not the name) to build icon URLs
  creationDate: string;         // ISO OffsetDateTime string
}

// GET /api/accounts/me  (requires JWT)
export async function apiGetMyProfile(): Promise<AccountProfile> {
  return apiFetch<AccountProfile>("/api/accounts/me");
}

// PATCH /api/accounts/me  (requires JWT)
// Send only the fields you want to change — null/omitted fields are left as-is.
// avatarCharId: null clears the avatar.
export async function apiUpdateMyProfile(updates: {
  username?: string;
  email?: string;
  avatarCharId?: number | null;
}): Promise<AccountProfile> {
  return apiFetch<AccountProfile>("/api/accounts/me", {
    method: "PATCH",
    body: updates,
  });
}

// GET /api/accounts/{accountId}  (public)
export async function apiGetProfile(accountId: number): Promise<AccountProfile> {
  return apiFetch<AccountProfile>(`/api/accounts/${accountId}`);
}

// GET /api/accounts/by-username/{username}  (public)
export async function apiGetProfileByUsername(username: string): Promise<AccountProfile> {
  return apiFetch<AccountProfile>(`/api/accounts/by-username/${encodeURIComponent(username)}`);
}

// Backend DTO: AccountSummaryResponse { accountId, username, avatarCharId, avatarCharName, avatarCharSlug }
// Lightweight shape used for the user browse list.
export interface AccountSummary {
  accountId: number;
  username: string;
  avatarCharId: number | null;
  avatarCharName: string | null;
  avatarCharSlug: string | null;
}

// GET /api/accounts?page=&size=  (public)
export async function apiGetAccounts(page = 0, size = 24): Promise<Page<AccountSummary>> {
  return apiFetch<Page<AccountSummary>>(`/api/accounts?page=${page}&size=${size}`);
}

// ─── Posts — browse ───────────────────────────────────────────────────────────
// Backend DTO: PostSummaryResponse { postId, title, username, stygianName, createdAt, averageRating, ratingCount, totalClearTime, bosses }

export interface PostBossSummary {
  bossId: number;     // backend: Short
  bossSlug: string;   // used to build Supabase icon URL
  bossName: string;
  clearTime: number;  // backend: short, seconds 0-120
  cost: number;        // auto-calculated team cost for this boss (backend: BigDecimal)
  characters: PostBossCharacterIcon[];
}

// Minimal character reference — just enough for an icon + name (no weapon/
// artifact/refinement detail). Used in PostBossClearSummary below.
export interface PostBossCharacterIcon {
  charId: number;    // backend: Short
  charSlug: string;  // used to build Supabase icon URL
  charName: string;
}

// This-boss-only clear summary, present on PostSummary only when the
// /api/posts request is filtered to a single bossId (the boss detail page).
// Distinct from PostSummary.totalClearTime/totalCost/bosses, which cover
// every boss in the post — a post can clear multiple bosses, so this field
// scopes the numbers down to just the boss being viewed.
export interface PostBossClearSummary {
  clearTime: number;  // backend: short, seconds 0-120 — this boss only
  cost: number;         // character + weapon cost — this boss only (backend: BigDecimal)
  characters: PostBossCharacterIcon[];
}

export interface PostSummary {
  postId: number;
  title: string;
  username: string;
  stygianName: string;
  createdAt: string;            // ISO OffsetDateTime string
  averageRating: number | null; // null if no ratings yet
  ratingCount: number;          // NOTE: backend returns Long — JS treats it as number fine
  difficulty: "Fearless" | "Dire";
  totalClearTime: number;       // sum of every boss's clearTime in this post, in seconds
  totalCost: number;             // sum of every boss's cost in this post (backend: BigDecimal)
  bosses: PostBossSummary[];
  bossClear: PostBossClearSummary | null;  // only present when filtered by bossId
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

// All advanced filter params — pass as a partial, omitted fields are ignored.
export interface PostFilterParams {
  stygianId?: number;
  accountId?: number;
  bossId?: number;
  charId?: number;
  difficulty?: "Fearless" | "Dire";
  titleSearch?: string;
  minCost?: number;
  maxCost?: number;
  minTime?: number;
  maxTime?: number;
  charInclude?: number[];
  includeMode?: "AND" | "OR";
  charExclude?: number[];
  allBossesOnly?: boolean;
  page?: number;
  size?: number;
}

export async function apiGetPostsFiltered(params: PostFilterParams): Promise<Page<PostSummary>> {
  const qs = new URLSearchParams();
  if (params.stygianId  != null) qs.set("stygianId",   String(params.stygianId));
  if (params.accountId  != null) qs.set("accountId",   String(params.accountId));
  if (params.bossId     != null) qs.set("bossId",      String(params.bossId));
  if (params.charId     != null) qs.set("charId",      String(params.charId));
  if (params.difficulty != null) qs.set("difficulty",  params.difficulty);
  if (params.titleSearch != null && params.titleSearch.trim() !== "") qs.set("titleSearch", params.titleSearch.trim());
  if (params.minCost    != null) qs.set("minCost",     String(params.minCost));
  if (params.maxCost    != null) qs.set("maxCost",     String(params.maxCost));
  if (params.minTime    != null) qs.set("minTime",     String(params.minTime));
  if (params.maxTime    != null) qs.set("maxTime",     String(params.maxTime));
  if (params.charInclude?.length) params.charInclude.forEach(id => qs.append("charInclude", String(id)));
  if (params.includeMode)        qs.set("includeMode", params.includeMode);
  if (params.charExclude?.length) params.charExclude.forEach(id => qs.append("charExclude", String(id)));
  if (params.allBossesOnly != null) qs.set("allBossesOnly", String(params.allBossesOnly));
  qs.set("page", String(params.page ?? 0));
  qs.set("size", String(params.size ?? 12));
  return apiFetch<Page<PostSummary>>(`/api/posts?${qs.toString()}`);
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
  charRarity: number;      // backend: short, 1-5
  charLimited: boolean;    // banner classification — drives team cost
  characterCost: number;   // this slot's character-only cost contribution (backend: BigDecimal)
  weaponId: number;        // backend: Short
  weaponName: string;
  weaponSlug: string;      // used to build Supabase icon URL
  weaponRarity: number;    // backend: short, 1-5
  weaponTypeSlug: string;  // e.g. "sword" — icon path is <base>/<weaponTypeSlug>/<weaponSlug>.png
  weaponLimited: boolean;  // banner classification — drives team cost
  weaponCost: number;      // this slot's weapon-only cost contribution (backend: BigDecimal)
  refinement: number;      // backend: short, 1-5 (R1-R5)
  artifactSetId: number;   // backend: Short
  artifactSetName: string;
  artifactSetSlug: string; // used to build Supabase icon URL
  slot: number;         // which slot this character fills (1-based)
  hasSig: boolean;      // has signature weapon
  cons: number;         // constellation level
}

export interface PostBoss {
  bossId: number;       // backend: Short
  bossSlug: string;     // used to build Supabase icon URL
  bossName: string;
  buildInfo: string | null;
  clearTime: number;    // backend: short, seconds 0-120
  cost: number;          // auto-calculated team cost for this boss (backend: BigDecimal)
  characters: PostBossCharacter[];
}

export interface PostDetail {
  postId: number;
  title: string;
  description: string | null;
  videoLink: string | null;
  difficulty: "Fearless" | "Dire";
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
  clearTime: number;
  characters: {
    charId: number;
    weaponId: number;
    artifactSetId: number;
    refinement: number;
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
    difficulty?: "Fearless" | "Dire";
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

// POST /api/posts/{postId}/rate  (requires JWT; 409 if rating your own post)
// rating must be 1–5 per backend validation. Acts as an upsert — calling it
// again with a new value just updates your existing rating.
export async function apiRatePost(postId: number, rating: number): Promise<void> {
  return apiFetch<void>(`/api/posts/${postId}/rate`, {
    method: "POST",
    body: { rating },
  });
}

// GET /api/posts/{postId}/my-rating  (requires JWT)
// Returns the logged-in user's existing rating for this post (1-5), or null
// if they haven't rated it yet.
export async function apiGetMyRating(postId: number): Promise<number | null> {
  return apiFetch<number | null>(`/api/posts/${postId}/my-rating`);
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

// ─── Characters (lookup) ──────────────────────────────────────────────────────
export interface Character {
  id: number;
  slug: string;
  name: string;
  rarity: number;
  isLimited: boolean;
  element: { id: number; slug: string; name: string };
  weaponType: { id: number; slug: string; name: string };
}

export async function apiGetCharacters(): Promise<Character[]> {
  return apiFetch<Character[]>("/api/characters");
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

// ─── Weapons (lookup) ─────────────────────────────────────────────────────────
// Backend DTO: WeaponResponse { id: short, slug: String, name: String, rarity: short, weaponType: LookupRef }

export interface Weapon {
  id: number;     // backend: short
  slug: string;   // used to build Supabase icon URL
  name: string;
  rarity: number; // 1-5
  isLimited: boolean; // banner classification — drives team cost
  weaponType: { id: number; slug: string; name: string };
}

// Team cost formula (mirrors backend CostCalculator — see PostServiceImpl).
// Live client-side calculation for the "Cost (auto)" display; the backend
// always recomputes and stores the authoritative value on submit, so this
// is purely a UX convenience and is never trusted as-is.
//   4★ character (any)        = 0
//   5★ limited character      = cons + 1
//   5★ standard character     = (cons + 1) × 0.5
//   4★ and below weapon (any) = 0
//   5★ limited weapon         = refinement
//   5★ standard weapon        = refinement × 0.5
export function calculateCharacterCost(rarity: number, isLimited: boolean, cons: number): number {
  if (rarity < 5) return 0;
  const base = cons + 1;
  return isLimited ? base : base * 0.5;
}

export function calculateWeaponCost(rarity: number, isLimited: boolean, refinement: number): number {
  if (rarity < 5) return 0;
  return isLimited ? refinement : refinement * 0.5;
}

// Default refinement convention: 5★ weapons (the rare ones, usually limited)
// default to R1; everything 4★ and below defaults to R5. Users can always
// override this — it's just the sensible starting point.
export function defaultRefinementForRarity(rarity: number): number {
  return rarity >= 5 ? 1 : 5;
}

// GET /api/weapons  (public)
export async function apiGetWeapons(): Promise<Weapon[]> {
  return apiFetch<Weapon[]>("/api/weapons");
}

// GET /api/weapons/{slug}  (public)
export async function apiGetWeapon(slug: string): Promise<Weapon> {
  return apiFetch<Weapon>(`/api/weapons/${slug}`);
}

// GET /api/weapons/by-weapon-type/{weaponTypeId}  (public)
// Used to filter the weapon picker down to only weapons a given character can equip.
export async function apiGetWeaponsByWeaponType(weaponTypeId: number): Promise<Weapon[]> {
  return apiFetch<Weapon[]>(`/api/weapons/by-weapon-type/${weaponTypeId}`);
}

// ─── Artifact Sets (lookup) ───────────────────────────────────────────────────
// Backend DTO: ArtifactSetResponse { id: short, slug: String, name: String }

export interface ArtifactSet {
  id: number;    // backend: short
  slug: string;  // used to build Supabase icon URL
  name: string;
}

// GET /api/artifact-sets  (public)
export async function apiGetArtifactSets(): Promise<ArtifactSet[]> {
  return apiFetch<ArtifactSet[]>("/api/artifact-sets");
}

// GET /api/artifact-sets/{slug}  (public)
export async function apiGetArtifactSet(slug: string): Promise<ArtifactSet> {
  return apiFetch<ArtifactSet>(`/api/artifact-sets/${slug}`);
}
