import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-14 pb-20">
      {/* Hero */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">About StygianMaxxer</h1>
        <p className="opacity-70 max-w-2xl">
          StygianMaxxer is a community-run archive of Stygian Onslaught clears
          for Genshin Impact. Browse builds by cycle or boss, see what it
          actually costs to clear something, and post your own runs once
          you&apos;ve got a clear worth sharing.
        </p>
        <p className="text-xs opacity-50 max-w-2xl">
          Unofficial fan project — not affiliated with HoYoverse. Game
          content and assets belong to their respective owners.
        </p>
      </div>

      {/* What you can do here */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What You Can Do Here</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Stygians", body: "Look up any cycle and see every boss in its lineup.", href: "/stygian" },
            { title: "Bosses", body: "Jump straight to a specific boss and see every clear that's beaten it.", href: "/boss" },
            { title: "Posts", body: "Filter clears by cost, clear time, difficulty, or the characters used.", href: "/post" },
            { title: "Users", body: "Check out other players' dashboards and clear history.", href: "/user" },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="card bg-base-200 hover:bg-base-300 transition-colors h-full"
            >
              <div className="card-body p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm opacity-70">{item.body}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Anatomy of a post */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What&apos;s in a Post</h2>
        <p className="opacity-70">
          A post is one clear of a Stygian cycle. It&apos;s built from a few
          pieces:
        </p>
        <div className="card bg-base-200">
          <div className="card-body gap-3">
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-medium">Stygian cycle &amp; difficulty</span>
                <span className="opacity-70"> — which cycle you cleared, and whether it was on </span>
                <span className="badge badge-warning badge-sm font-semibold">Fearless</span>
                <span className="opacity-70"> or </span>
                <span className="badge badge-error badge-sm font-semibold">Dire</span>.
              </li>
              <li>
                <span className="font-medium">Bosses</span>
                <span className="opacity-70"> — toggle on every boss from that cycle you actually cleared, each with its own clear time (0–120s) and optional build notes.</span>
              </li>
              <li>
                <span className="font-medium">Teams</span>
                <span className="opacity-70"> — up to 4 characters per boss, each with constellation, weapon + refinement, artifact set, and a signature-weapon flag.</span>
              </li>
              <li>
                <span className="font-medium">Video link</span>
                <span className="opacity-70"> — a public link to the clear (YouTube, Bilibili, or similar) so others can see the run for themselves.</span>
              </li>
              <li>
                <span className="font-medium">Rating</span>
                <span className="opacity-70"> — other users can rate your post out of 5 stars once it&apos;s up.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How to submit */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Posting a Clear</h2>
        <ul className="steps steps-vertical">
          <li className="step step-primary text-left ps-3">
            <div className="text-left">
              <p className="font-medium">Sign in</p>
              <p className="text-sm opacity-70">
                Create an account or log in, then head to your{" "}
                <Link href="/dashboard" className="link link-primary">Dashboard</Link>.
              </p>
            </div>
          </li>
          <li className="step step-primary text-left ps-3">
            <div className="text-left">
              <p className="font-medium">Hit + Create Post</p>
              <p className="text-sm opacity-70">
                Pick the Stygian cycle your clear belongs to — its bosses will load automatically.
              </p>
            </div>
          </li>
          <li className="step step-primary text-left ps-3">
            <div className="text-left">
              <p className="font-medium">Fill in each boss you cleared</p>
              <p className="text-sm opacity-70">
                Add your team, clear time, and any build notes worth mentioning (rotation, substitutions, etc).
              </p>
            </div>
          </li>
          <li className="step step-primary text-left ps-3">
            <div className="text-left">
              <p className="font-medium">Drop your video link</p>
              <p className="text-sm opacity-70">
                A public YouTube or Bilibili link works best — private or unlisted links won&apos;t be viewable by anyone else.
              </p>
            </div>
          </li>
          <li className="step step-primary text-left ps-3">
            <div className="text-left">
              <p className="font-medium">Submit</p>
              <p className="text-sm opacity-70">
                Your post goes live immediately — no review queue. You can edit or delete it later from your dashboard.
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* Cost */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How Cost Is Calculated</h2>
        <p className="opacity-70">
          Cost is a rough measure of how much account investment a clear
          needs — it&apos;s calculated automatically from the team you enter, so
          you don&apos;t have to do any math yourself. The rules:
        </p>
        <div className="overflow-x-auto">
          <table className="table bg-base-200">
            <thead>
              <tr>
                <th>Slot</th>
                <th>Condition</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Character</td>
                <td className="opacity-70">4★, any constellation</td>
                <td>0</td>
              </tr>
              <tr>
                <td>Character</td>
                <td className="opacity-70">5★ standard (e.g. Selector-eligible)</td>
                <td>(Cons + 1) × 0.5</td>
              </tr>
              <tr>
                <td>Character</td>
                <td className="opacity-70">5★ limited</td>
                <td>Cons + 1</td>
              </tr>
              <tr>
                <td>Weapon</td>
                <td className="opacity-70">4★ or below, any refinement</td>
                <td>0</td>
              </tr>
              <tr>
                <td>Weapon</td>
                <td className="opacity-70">5★ standard</td>
                <td>Refinement × 0.5</td>
              </tr>
              <tr>
                <td>Weapon</td>
                <td className="opacity-70">5★ limited</td>
                <td>Refinement</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm opacity-60">
          A boss&apos;s total cost is just the sum of every character slot (character cost + weapon cost). Half-point totals are normal whenever a standard 5★ is involved.
        </p>
      </section>

      {/* Guidelines */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Posting Guidelines</h2>
        <p className="opacity-70">
          There&apos;s no moderation queue here — posts go live the moment
          you submit them, which means the accuracy of the database is on
          all of us. A few things that keep it useful for everyone:
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card bg-base-200">
            <div className="card-body gap-2">
              <h3 className="font-semibold">Do</h3>
              <ul className="text-sm opacity-80 space-y-1.5 list-disc list-inside">
                <li>Double-check the cycle, boss, and difficulty before posting.</li>
                <li>Enter the constellation and refinement you actually used, not what you own.</li>
                <li>Link the actual clear, set to public so others can watch it.</li>
                <li>Use the build notes field for anything that isn&apos;t obvious from the team alone — rotation order, a one-off substitution, why a slot is overcooked, etc.</li>
                <li>For Dire clears, it&apos;s worth noting whether any Exalted One buffs were active, since that affects how repeatable the clear is for someone without them.</li>
              </ul>
            </div>
          </div>
          <div className="card bg-base-200">
            <div className="card-body gap-2">
              <h3 className="font-semibold">Don&apos;t</h3>
              <ul className="text-sm opacity-80 space-y-1.5 list-disc list-inside">
                <li>Post a failed or partial attempt as if it were a clean clear.</li>
                <li>Inflate constellations or refinements to make a team look stronger (or weaker) than it was.</li>
                <li>Link a private/unlisted video, a platform clip that can be taken down at any time, or a link to an unrelated video.</li>
                <li>Reuse someone else&apos;s footage as your own clear.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="card bg-base-200">
        <div className="card-body items-center text-center gap-3 py-10">
          <h2 className="text-xl font-semibold">Got a clear worth sharing?</h2>
          <p className="opacity-70 max-w-md">
            Sign in, head to your dashboard, and post it — it takes a few minutes and helps everyone else figure out what&apos;s actually possible this cycle.
          </p>
          <div className="flex gap-3 mt-1">
            <Link href="/signup" className="btn btn-primary">Sign Up</Link>
            <Link href="/post" className="btn btn-outline">Browse Posts</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
