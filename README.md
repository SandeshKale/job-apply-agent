# Job Apply Agent

Daily LinkedIn + Naukri job application dashboard with **smart ranking**, **human-like automation** (via [browser-use](https://github.com/browser-use/browser-use)), application tracking, and strict safety limits.

Built for **Sandesh Kale** (Lead Backend Engineer · BFSI · Singapore) — profile, skills, and search queries are pre-filled from LinkedIn export data.

---

## Features

- **Smart ranking** — scores jobs by Easy Apply, recency, title match, skill overlap, preferred companies, location; enforces per-company and platform quotas.
- **Intuitive dashboard** — paste candidates → rank → generate ready-to-run browser-use prompt → track history.
- **Safety first** — daily max (default 10), random delays, real Chrome profile preferred, hard stop on CAPTCHA / unusual activity.
- **Persistent state** — config + applied log stored in `data/` (gitignored).
- **Linting + unit tests** — ESLint, Prettier, Vitest covering ranking and prompt builders.

## Quick start

```bash
# 1. Install Node deps
npm install

# 2. Copy your resume into data/
mkdir -p data
cp /path/to/your/resume.pdf data/Sandesh_Kale_Resume.pdf

# 3. Run the dashboard
npm run dev
# → http://localhost:3000
```

### Optional: full browser automation

```bash
# Python side
cd python
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# follow browser-use install docs (Chromium + API key)

# From the dashboard: generate an "apply prompt", copy it, then:
python agent_runner.py --prompt-file /tmp/apply-prompt.txt
# or
browser-use run "$(cat /tmp/apply-prompt.txt)"
```

## Daily workflow

1. Open the dashboard.
2. (Optional) Click **Rank-only prompt** → run it with browser-use to collect ~20–40 candidates as JSON.
3. Paste the JSON into the candidates box → **Rank & select top jobs**.
4. Click **Generate apply prompt** → copy.
5. Run the prompt with browser-use (real Chrome profile recommended so you stay logged in).
6. Applications appear in the history table (you can also POST results to `/api/applied`).

## Scripts

| Command            | Description                |
|--------------------|----------------------------|
| `npm run dev`      | Start Next.js dashboard    |
| `npm run build`    | Production build           |
| `npm run lint`     | ESLint (zero warnings)     |
| `npm run format`   | Prettier write             |
| `npm test`         | Vitest unit tests          |
| `npm run typecheck`| `tsc --noEmit`             |

## Project layout

```
src/
  app/           # Next.js App Router + API routes
  components/    # UI
  lib/           # ranking, storage, prompt builder, default config
  types/         # shared TypeScript types
python/          # browser-use runner
tests/           # Vitest
data/            # runtime config + applied.json (gitignored)
```

## Safety notes

- LinkedIn actively detects automation. Keep daily volume low, use your real Chrome profile, and never ignore CAPTCHA / “unusual activity” warnings.
- The agent is instructed **never to invent** experience, titles, or skills.
- This tool is for personal productivity; respect each site’s Terms of Service.

## License

MIT © Sandesh Kale
