// Shared helpers for displaying a user's avatar character.
//
// Avatars are just Characters (the same ones used in post builds) — an
// account stores a reference to one via avatarCharId/avatarCharSlug.
// Icons live in the same Supabase bucket as build-character icons:
//   <CHAR_ICON_BASE>/<charSlug>/icon.webp
//
// IMPORTANT: always build the URL from the slug, never the display name —
// names like "Traveler (Anemo)" contain spaces/parens and won't resolve.

const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";

// New accounts are given this avatar by the backend at registration time
// (see AuthService#DEFAULT_AVATAR_SLUG). Used here as a frontend fallback
// for any pre-existing accounts that don't have an avatar set yet.
export const DEFAULT_AVATAR_SLUG = "traveler-anemo";
export const DEFAULT_AVATAR_NAME = "Traveler (Anemo)";
export const DEFAULT_AVATAR_ID = 92;

export function avatarIconUrl(slug: string | null | undefined): string {
  const resolvedSlug = slug ?? DEFAULT_AVATAR_SLUG;
  if (!CHAR_ICON_BASE) return "/icon.png";
  return `${CHAR_ICON_BASE}/${resolvedSlug}/icon.webp`;
}
