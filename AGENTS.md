<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## SCENTIA — project skills and verification

Before changing React/Next.js code, read `.agents/skills/vercel-react-best-practices/SKILL.md` and the applicable rule files. The skill is installed locally and its source is tracked by `skills-lock.json`. Record concrete applications in `docs/SKILLS.md`; do not claim unmeasured performance gains.

Preserve the original botanical design, the 20 reference names and their 50 ml prices. Live transactional prices and stocks come from Supabase, never from browser totals. All orders remain explicitly pedagogical with no real payment.

Keep Supabase authorization on the server and in RLS. Never expose service-role credentials or allow a customer to modify their role. Use the non-destructive transaction suite in `tests/database.sql` to verify changes.

Before delivery: run `pnpm lint`, `pnpm build`, and `pnpm test`. Preserve the original project's Git history; do not invent contributions or dates.
