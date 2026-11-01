<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:04120f,55:0d3b33,100:14b8a6&height=235&section=header&text=ICSE%20Resources&fontSize=46&fontColor=ecfdf8&fontAlignY=40&desc=6%2C367%20files.%20Static%20pages.%20No%20waiting%20room.&descSize=17&descAlignY=62&animation=twinkling" alt="ICSE Resources" width="100%">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=500&size=19&duration=3200&pause=900&color=2dd4bf&center=true&vCenter=true&width=680&lines=Astro%20prerenders%20it%2C%20React%20islands%20wake%20it%20up;Fuzzy%20search%20over%206%2C367%20files%20in%20the%20browser;Every%20approved%20upload%20gets%20archived%20offsite" alt="Typing animation" />

<br />

<a href="https://icse-resources.pages.dev/"><img src="https://img.shields.io/badge/%E2%96%B6%20Open%20the%20portal-14b8a6?style=for-the-badge&labelColor=04120f&logo=cloudflarepages&logoColor=2dd4bf" alt="Open the portal" /></a>

</div>

<div align="center">

<img src="https://img.shields.io/badge/Astro-5-2dd4bf?style=flat-square&labelColor=04120f" alt="Astro 5" />
<img src="https://img.shields.io/badge/Cloudflare-Pages%20%2B%20D1-f38020?style=flat-square&labelColor=04120f" alt="Cloudflare Pages and D1" />
<img src="https://img.shields.io/badge/Catalogue-6%2C367%20files-14b8a6?style=flat-square&labelColor=04120f" alt="6367 files" />
<img src="https://img.shields.io/badge/Search-Fuse.js-5eead4?style=flat-square&labelColor=04120f" alt="Fuse.js" />
<img src="https://img.shields.io/badge/Tests-node%20--test-0d9488?style=flat-square&labelColor=04120f" alt="node --test" />

</div>

<br />

<div align="center">

### <a href="https://icse-resources.pages.dev/">icse-resources.pages.dev</a>

<sub>No account and no install. Open a subject, read a paper, download it. That is the whole product.</sub>

</div>

---

<div align="center">

## What it is

</div>

A resource portal for **ICSE Class 10** that treats a messy Google Drive as a first-class catalogue. 6,367 files — chapter notes, board specimen papers with marking schemes, previous-year papers, analysis-of-pupil-performance reports, and school prelim papers — sorted into the folder structure the class actually maintains, then served as pre-rendered HTML from Cloudflare's edge.

Two things make it more than a file list. The pages are **built at build time**, so the library paints before any JavaScript runs on a phone on a bad connection. And a student who cannot find something can **submit it** — the upload goes into a moderation queue, and once approved a background worker copies the file to the Internet Archive so the catalogue survives the drive folder it came from.

<div align="center">

<sub>Previously a single-page React app (<b>class-10-icse</b>). This is the rebuild: static output, small islands, and a backend that only runs when someone actually submits or downloads.</sub>

</div>

---

<div align="center">

## How it works

</div>

<ol>
<li><b>Prerendered routes.</b> <code>/</code>, <code>/study-materials</code>, <code>/study-materials/all</code>, <code>/cisce</code>, <code>/quizzes</code>, <code>/about</code>, <code>/contact</code>, <code>/privacy</code> and <code>/404</code> ship as plain HTML. The catalogue is in the markup, not behind a spinner.</li>
<li><b>Islands switch on where they earn it.</b> Search modal, resource library, download modal, tutorial modal, theme toggle and the app-level modals are React islands with <code>client:load</code> or <code>client:idle</code>. Everything else is Astro with zero client weight.</li>
<li><b>One download button, three fallbacks.</b> Each file attempts the primary host, then a mirror, then the Drive copy — surfaced as a single action with a modal that explains what happened, instead of making a student choose between three ambiguous buttons.</li>
<li><b>Submissions and their afterlives.</b> A student uploads a missing paper; it lands as <code>pending</code> with a receipt hash and a per-client rate limit. Approving it publishes the file and queues an archive job that mirrors it off-site.</li>
</ol>

<div align="center">

## What is inside

</div>

<ul>
<li><b>Hierarchical library</b> — folders keep their original nesting (subject → chapter → school → year) and start closed, so a 6,367-row catalogue still opens on a scannable page.</li>
<li><b>Spotlight search</b> — <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd>, Fuse.js over a flat 6,367-row index, arrow keys and <kbd>Enter</kbd> to open a result.</li>
<li><b>Featured books</b> — a curated strip above the raw listing: PW Endgame notes, sample papers, question banks, each a real <code>.pdf</code> in the same index.</li>
<li><b>Completion analytics without a third-party tracker</b> — visits and downloads are recorded as events in D1 keyed by a visitor hash, exposed only as aggregate counts in the admin report.</li>
<li><b>Student submissions</b> — grade, subject and type, with Discord/Reddit handles, a receipt hash for the student to check status later, and hard rate limits per client.</li>
<li><b>Community archive</b> — approved submissions are copied to the Internet Archive by a resumable, sharded worker, and the archive URL is written back onto the submission row.</li>
<li><b>Dark and light, without a flash</b> — the theme preference is read in <code>&lt;head&gt;</code> and applied before first paint.</li>
</ul>

---

<div align="center">

## Stack

</div>

<ul>
<li><b>Astro 5 on Cloudflare Pages</b> — static by default, server routes only where a form or a query needs one (<code>@astrojs/cloudflare</code>).</li>
<li><b>React 18 islands</b> — the interactive parts only; <code>@astrojs/react</code> plus Radix primitives behind shadcn/ui.</li>
<li><b>Cloudflare D1</b> — SQLite at the edge, schema managed by numbered migrations checked into the repo.</li>
<li><b>Node worker for archiving</b> — a long-running process that talks to the Drive API and the Internet Archive, deliberately outside the request path.</li>
<li><b><code>node --test</code></b> — no Jest, no Vitest; the test runner is the one in the runtime.</li>
<li><b>Fuse.js</b> — search is a 180 KB index and a library, not a search server.</li>
</ul>

<div align="center">

<img src="https://skillicons.dev/icons?i=astro,react,ts,tailwind,cloudflare,supabase,nodejs,git" alt="Astro, React, TypeScript, Tailwind, Cloudflare, Node, Git" />

</div>

---

<div align="center">

## Under the hood

</div>

<details>
<summary><b>Schema</b> — three migrations, one analytics table, one submission queue</summary>

<br />

<p><code>0001_analytics.sql</code> adds <code>analytics_events</code> with a <code>CHECK</code> on the event type so a typo cannot invent a new metric, and indexes on <code>(created_at)</code>, <code>(visitor_id, created_at)</code> and <code>(file_id, event_type)</code> — one for the time series, one for per-visitor de-duplication, one for "most downloaded file".</p>

<p><code>0002_student_submissions.sql</code> adds the queue itself plus a separate limits table:</p>

<pre><code>student_submissions(id, receipt_hash UNIQUE, grade CHECK IN (10,12), subject,
  resource_type, discord_id, reddit_id, file_name, content_type, file_size,
  status CHECK IN ('pending','approved','rejected'), submitted_at, reviewed_at,
  rejection_reason)

student_submission_limits(client_hash, window_start, attempts)  -- PRIMARY KEY (client_hash, window_start)</code></pre>

<p>Rate limiting lives in its own table on purpose: incrementing <code>attempts</code> must not touch the row a moderator is reviewing.</p>

</details>

<details>
<summary><b>The archive worker</b> — why approved files get copied twice</summary>

<br />

<p>Every approved submission is queued with a claim column, and <code>cloud-worker/server.mjs</code> drains that queue:</p>

<ul>
<li><b>Sharded and idempotent.</b> A task belongs to shard <code>hash(id) % SYNC_TOTAL_SHARDS</code>, so two workers can run without touching each other's tasks, and a claim timestamp stops the same file being uploaded twice.</li>
<li><b>Drive in, Internet Archive out.</b> It exchanges a Google refresh token for an access token, downloads the file with <code>alt=media</code>, then uploads it with S3-style <code>x-archive-*</code> headers, following redirects to the real storage node.</li>
<li><b>Bounded.</b> <code>MAX_CONCURRENT</code>, <code>RUN_DURATION_MINUTES</code> and <code>AUTO_EXIT_WHEN_DONE</code> exist because the host bills by the second — the worker is designed to start, drain, and exit.</li>
<li><b>Observable.</b> It exposes live counters (queued, verifying, done, failed, MB/s, ETA) as a status page, and retries with backoff via <code>archive_retry_at</code> and <code>archive_attempts</code> rather than blocking the queue on a flaky upload.</li>
</ul>

<p>When an upload succeeds, <code>archive_url</code> is written back onto the submission, so a student's file has a permanent home even if the Drive folder is reorganised later.</p>

</details>

<details>
<summary><b>Tests that describe behaviour, not functions</b></summary>

<br />

<p><code>bun run test</code> runs <code>tests/e2e/runner.mjs</code>, which walks four tiers: feature coverage, boundary and corner cases, cross-feature interactions, and realistic student sessions. Alongside them sit narrower suites for the islands, layout and theme, the resource catalogue and the download fallback — plus a browser test that loads the real page.</p>

<p>The tiering is the useful part: a change that fixes one feature and breaks the combination of two has somewhere to show up.</p>

</details>

<details>
<summary><b>Download failover, in one action</b></summary>

<br />

<p>A hidden iframe is used to trigger the download so popup blockers stay out of it, and the visible UI stays a single button. If the first host fails, the modal opens with the mirrors rather than silently doing nothing — the failure is explained at the moment it matters, not logged to a console nobody reads.</p>

</details>

---

<div align="center">

## Project structure

</div>

<pre><code>icse-resources/
├── src/pages/                 # prerendered routes
│   ├── index.astro  study-materials*.astro  cisce.astro  quizzes.astro
│   ├── resource.ts            # single-file resolver with host fallbacks
│   └── api/
│       ├── analytics/{visit,downloads,report}.ts
│       └── submissions/{index,file,status,approved,admin,archive-job}.ts
├── src/components/            # shared Astro shell
│   └── islands/               # React: library, search, modals, theme toggle
├── migrations/                # 0001 analytics · 0002 submissions · 0003 archive
├── public/data/search-index.json
├── cloud-worker/server.mjs    # Drive -> Internet Archive queue drainer
└── tests/                     # tier1..tier4 e2e + unit suites</code></pre>

---

<div align="center">

## Run it

</div>

<div align="center">

**Just want the files:**

### <a href="https://icse-resources.pages.dev/">icse-resources.pages.dev</a>

</div>

<pre><code>git clone https://github.com/Jivaansh-Yadav/icse-resources.git
cd icse-resources
npm install
npm run dev            # astro dev
npm run build          # astro build -> dist/
npm run deploy         # build + wrangler pages deploy dist
npm test               # four-tier e2e suite</code></pre>

<p>The submission endpoints need a D1 binding and an admin token; without them the portal still browses, searches and downloads, and only the upload and analytics routes are inert.</p>

<div align="center">

<sub>Student uploads are only published after manual review, and every approved file is mirrored to the Internet Archive so a cleaned-up Drive folder cannot take the catalogue with it.</sub>

</div>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:04120f,55:0d3b33,100:14b8a6&height=110&section=footer&reversal=true" alt="" width="100%">
