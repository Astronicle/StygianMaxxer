# StygianMaxxer

StygianMaxxer is a community-run archive of **Stygian Onslaught** clears for Genshin Impact. Browse builds by cycle or boss, see what a clear actually costs in account investment, and post your own runs once you've got something worth sharing.

> Unofficial fan project — not affiliated with HoYoverse. Game content and assets belong to their respective owners.

## What you can do here

- **Stygians** — look up any cycle and see every boss in its lineup.
- **Bosses** — jump straight to a specific boss and see every clear that's beaten it.
- **Posts** — filter clears by cost, clear time, difficulty, or the characters used.
- **Users** — check out other players' dashboards and clear history.

### Anatomy of a post

A post is one clear of a Stygian cycle, made up of:

- **Stygian cycle & difficulty** — which cycle was cleared, and whether it was on `Fearless` or `Dire`.
- **Bosses** — every boss from that cycle actually cleared, each with its own clear time (0–120s) and optional build notes.
- **Teams** — up to 4 characters per boss, each with constellation, weapon + refinement, artifact set, and a signature-weapon flag.
- **Tags** — short labels flagging what's notable about the run. Post-wide tags (`Mine`/`Not Mine`, `No Builds`, an FPS tier, a ping tier) apply to the whole post; boss-specific tags (`Ping Dependent`, tool/execution tags, `Cheese`, `Over Level`) apply to a single boss clear. Currently only shown on `/post/[postID]`; browse/boss/stygian list views don't render them yet. See "How to Use Tags" on `/about` for what each one means.
- **Video link** — a public link to the clear (YouTube, Bilibili, or similar) so others can watch the run.
- **Rating** — other users can rate a post out of 5 stars.

### Tags

Tags are picked when creating or editing a post. Post-wide tags are grouped into mutually-exclusive rows in the UI (`Mine`/`Not Mine`, the three FPS tiers, the two ping tiers — `No Builds` stands alone), and the same exclusivity is re-validated server-side in `PostServiceImpl.normalizePostTags` so the API can't be used to bypass it. If neither `Mine` nor `Not Mine` is submitted, the backend defaults to `Not Mine`. Boss-specific tags have no exclusivity rules and are picked independently per boss.

### Cost formula

Cost is an automatically-calculated, rough measure of how much account investment a clear needs:

| Slot | Condition | Cost |
|---|---|---|
| Character | 4★, any constellation | 0 |
| Character | 5★ standard | (Cons + 1) × 0.5 |
| Character | 5★ limited | Cons + 1 |
| Weapon | 4★ or below, any refinement | 0 |
| Weapon | 5★ standard | Refinement × 0.5 |
| Weapon | 5★ limited | Refinement |

A boss's total cost is the sum of every character slot (character cost + weapon cost); a post's total cost is the sum across every boss cleared. Half-point totals are normal whenever a standard 5★ is involved.

See [`/about`](frontend/app/about/page.tsx) in the app for the full posting guide and community guidelines.

## Tech stack

**Frontend** — `frontend/`
- [Next.js 16](https://nextjs.org/) (App Router) + React 19, TypeScript
- Tailwind CSS 4 + [daisyUI](https://daisyui.com/) for styling/components
- [lucide-react](https://lucide.dev/) for icons

**Backend** — `backend/`
- Java, Spring Boot 4 (`spring-boot-starter-webmvc`, `-data-jpa`, `-security`, `-data-redis`, `-validation`)
- PostgreSQL, with schema/data managed by Flyway (`backend/src/main/resources/db/migration`)
- JWT auth via `jjwt`
- Redis (session/cache support)
- Lombok

## Project structure

```
website/
├── backend/                 # Spring Boot API
│   ├── src/main/java/com/stygianMaxxer/
│   │   ├── controller/       # REST endpoints (Account, Auth, Post, Stygian, LookUp)
│   │   ├── service/          # business logic
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── model/             # JPA entities
│   │   ├── dto/                # request/response records
│   │   └── security/          # JWT auth, filters, config
│   ├── src/main/resources/
│   │   ├── db/migration/      # Flyway SQL migrations (schema + seed data)
│   │   └── application*.properties
│   └── docker-compose.yml     # Postgres + app containers
│
└── frontend/                 # Next.js app
    ├── app/
    │   ├── boss/[bossID]/       # boss detail — posts that cleared this boss
    │   ├── stygian/[stygianID]/ # stygian cycle detail — posts for this cycle
    │   ├── post/[postID]/        # single post detail (+ /edit)
    │   ├── post/                 # browse all posts
    │   ├── user/                 # public user profiles
    │   ├── dashboard/            # signed-in user's own posts
    │   ├── submit/, results/     # post creation flow
    │   ├── login/, signup/       # auth
    │   ├── about/                 # what this site is, how posting/cost works
    │   ├── components/            # shared UI (cards, filters, headers, badges, tags/)
    │   └── lib/                    # api.ts (typed API client), avatar helpers
    └── .env.local.example
```

## Getting started

### Backend

1. `cd backend`
2. Copy `env.example` → `.env` and fill in real values (DB credentials, a generated `JWT_SECRET`).
3. Bring up Postgres (and optionally the app) via Docker:
   ```bash
   docker compose up -d
   ```
4. Or run the API directly against a local Postgres instance:
   ```bash
   ./mvnw spring-boot:run
   ```
   Flyway will run all migrations automatically on startup.

The API listens on `http://localhost:8080` by default.

### Frontend

1. `cd frontend`
2. Copy `.env.local.example` → `.env.local` and point `NEXT_PUBLIC_API_BASE_URL` / `API_BASE_URL` at your backend.
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

The app runs on `http://localhost:3000` by default.

## Data model at a glance

Core entities live in `backend/.../model`: `Account`, `Post`, `PostBoss`, `PostBossCharacter`, `Boss`, `Stygian`/`StygianVersion`, `Character`, `Weapon`, `WeaponType`, `ArtifactSet`. A `Post` belongs to a `Stygian` cycle and has one `PostBoss` per boss cleared; each `PostBoss` has up to 4 `PostBossCharacter` rows (character, weapon, refinement, constellation, artifact set) representing the team used. Cost and clear time are computed/stored per boss and rolled up per post. Tags are simple `@ElementCollection` sets — `PostTag` on `Post` (table `post_tag`) and `BossTag` on `PostBoss` (table `post_boss_tag`).

## Contributing

There's no moderation queue — posts go live immediately, so accuracy is a shared responsibility. If you're submitting a clear, see the **Do / Don't** guidelines on the `/about` page before posting.
