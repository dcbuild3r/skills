# AI Skills

This repo is a snapshot of the AI skills I use locally in Codex and adjacent agent tools. It is both an archive of the actual skill files and a distilled statement of the working methodology behind them.

Snapshot date: 2026-05-18

## What Is Here

The curated upload contains 85 `SKILL.md` files:

| Area | Path | Count | What it is |
| --- | --- | ---: | --- |
| Personal agent skills | `skills/personal-agents/` | 16 | Skills installed into `~/.agents/skills`, mostly engineering workflow skills. |
| Workspace-local agent skills | `skills/code-agents/` | 1 | Skills installed under `/Users/dcbuilder/Code/.agents/skills`. |
| Personal Codex skills | `skills/personal-codex/` | 1 | User-installed Codex skills from `~/.codex/skills`. |
| Codex system skills | `skills/codex-system/` | 2 | Built-in Codex skills from `~/.codex/skills/.system`. |
| OpenAI curated plugins | `skills/plugin-cache/openai-curated/` | 61 | Skills bundled by enabled Codex plugins such as Vercel, GitHub, Slack, Supabase, and Superpowers. |
| OpenAI bundled plugins | `skills/plugin-cache/openai-bundled/` | 1 | The bundled Browser skill. |
| OpenAI primary runtime | `skills/plugin-cache/openai-primary-runtime/` | 3 | Document, spreadsheet, and presentation skills from the primary runtime cache. |
| Source metadata | `metadata/` | - | Lockfile and provenance data for the user-installed `.agents` skills. |

This is intentionally organized by installation surface rather than by topic. That makes it easier to see whether a skill came from my personal toolchain, Codex itself, or an enabled plugin.

## Curate Before Upload

Use the local curator when deciding what should actually be committed and pushed:

```bash
bun run curate
```

Then open the printed local URL. The app starts every skill as unreviewed. Mark each skill as `Keep` or `Remove`; upload preparation stays disabled until every skill has an explicit decision.

The curator can:

- list all skills and all script files in the dump
- filter by source, decision status, text search, and whether a skill has scripts
- save decisions to `metadata/skill-selection.json`
- build a safe preview at `dist/selected-upload/`
- apply the final selection to the working tree by deleting skills marked `Remove`

Use `Build Upload Preview` first when you want to inspect the final remote payload without modifying `skills/`. Use `Apply To Working Tree` only after the selection is final; that is the step that makes the repo contain only the skills you actually want to upload.

The script inventory is also written to `SCRIPTS.md`:

```bash
bun run inventory
```

## Methodology

The common thread is simple: skills turn good agent behavior into repeatable operating procedure. I do not want a model to improvise every time it hits a known class of work. I want it to load the right playbook, preserve context, gather evidence, and ship with verification.

### 1. Start From A Named Workflow

Good AI work starts by choosing the right mode. A bug is not a feature spec. A security question is not a vibe check. A PRD is not an implementation plan.

The skills encode this as named workflows: `diagnose`, `tdd`, `triage`, `to-prd`, `to-issues`, `oracle`, `security-scan`, `github`, `frontend-app-builder`, and so on. Naming the workflow makes the agent less likely to collapse everything into generic coding.

### 2. Prefer Evidence Over Plausibility

The strongest skills here bias toward real signals:

- reproduce the bug before fixing it
- inspect the actual checkout before judging the architecture
- run the build, tests, CI, browser, or device flow where possible
- verify live docs or current product behavior when the answer may have drifted
- report verification gaps instead of smoothing them over

This is why many skills are procedural. The procedure is not bureaucracy; it is a way to keep the model attached to the world.

### 3. Work In Vertical Slices

The implementation style I want is tracer bullets and tight feedback loops:

1. Define the smallest behavior that proves the direction.
2. Build or test that behavior end to end.
3. Learn from the result.
4. Repeat.

This shows up in the TDD, PRD, issue-writing, and prototype skills. The goal is not maximal ceremony. The goal is to keep work independently reviewable and runnable.

### 4. Let Domain Language Shape The Code

Several skills push the agent to read `CONTEXT.md`, ADRs, issue labels, and local docs before making architectural claims. That reflects a strong preference: code should be understood through the domain's vocabulary, not through generic "service/component/helper" mush.

When the language is fuzzy, the agent should sharpen it. When the code disagrees with the docs, the agent should say so. When a decision matters long-term, it should become an ADR or issue, not an invisible chat assumption.

### 5. Use External Tools As Reality Checks

This repo includes skills for browser automation, GitHub, Linear, Slack, Google Drive, Supabase, Vercel, Android, iOS, documents, spreadsheets, and presentations. The pattern is the same: use the system of record when it exists.

The `oracle` skill adds another kind of reality check: bundle the right files and prompt for a separate high-context review. It is a way to get a second model pass without losing the concrete file set.

### 6. Keep Skill Context Lean

The best skills are concise entrypoints with progressive disclosure. They should explain the workflow, point to scripts or references only when needed, and avoid dumping every possible fact into context. A skill is not a textbook. It is a specialized operating guide.

### 7. Preserve Human Intent

The skills are not there to replace judgment. They are there to make judgment less forgetful. They help the agent remember things like:

- ask one good question when the decision tree is unclear
- keep accepted scope splits intact
- credit upstream work
- avoid destructive git operations
- prefer the user's actual repo and runtime over generic advice
- finish with a clear account of what was verified

## Personal Skills

These are the skills installed directly under `~/.agents/skills` and copied into `skills/personal-agents/`.

| Skill | Source | Purpose |
| --- | --- | --- |
| `caveman` | Matt Pocock | Ultra-compressed communication mode. |
| `diagnose` | Matt Pocock | Disciplined bug and performance diagnosis. |
| `find-skills` | Vercel Labs | Discover and install skills from the wider ecosystem. |
| `grill-me` | Matt Pocock | Interrogate a plan until the decision tree is clear. |
| `grill-with-docs` | Matt Pocock | Stress-test plans against domain docs and ADRs. |
| `improve-codebase-architecture` | Matt Pocock | Find deepening opportunities in a codebase. |
| `prototype` | Matt Pocock | Build throwaway prototypes to flush out design choices. |
| `setup-matt-pocock-skills` | Matt Pocock | Add repo-local agent skill context and issue tracker guidance. |
| `supabase` | Supabase | Supabase product, CLI, MCP, auth, and database workflows. |
| `supabase-postgres-best-practices` | Supabase | Postgres performance and schema best practices. |
| `tdd` | Matt Pocock | Red-green-refactor feature and bugfix workflow. |
| `to-issues` | Matt Pocock | Convert plans and PRDs into implementation issues. |
| `to-prd` | Matt Pocock | Turn conversation context into a PRD. |
| `triage` | Matt Pocock | Run issue triage through role-based states. |
| `write-a-skill` | Matt Pocock | Create new skills with progressive disclosure. |
| `zoom-out` | Matt Pocock | Step back and explain a code area in broader context. |

The personal Codex install currently includes:

| Skill | Source | Purpose |
| --- | --- | --- |
| `oracle` | Peter Steinberger / `@steipete/oracle` | Bundle prompts and files for external ChatGPT review. |

The workspace-local install currently includes:

| Skill | Source | Purpose |
| --- | --- | --- |
| `agentkit-x402` | World / AgentKit | Handle x402 `402 Payment Required` responses that advertise AgentKit human-backed-agent access. |

## Codex And Plugin Skills

The Codex system skills copied into `skills/codex-system/` are:

- `skill-creator`
- `skill-installer`

The enabled plugin and runtime caches contribute these skill groups:

| Plugin group | Count |
| --- | ---: |
| `browser` | 1 |
| `build-web-apps` | 6 |
| `codex-security` | 6 |
| `documents` | 1 |
| `github` | 4 |
| `google-drive` | 1 |
| `linear` | 1 |
| `presentations` | 1 |
| `slack` | 5 |
| `spreadsheets` | 1 |
| `supabase` | 2 |
| `superpowers` | 14 |
| `vercel` | 22 |

Plugin skill files are copied from the local Codex cache, so treat them as a snapshot of what was enabled on this machine, not as canonical upstream source.

## Credits And Upstream Repositories

Credit belongs to the upstream authors and maintainers. This repo is a local snapshot plus my synthesis of how I use the skills.

| Project / author | Repo or reference | Used for |
| --- | --- | --- |
| Matt Pocock | [`mattpocock/skills`](https://github.com/mattpocock/skills) | Most personal engineering workflow skills: diagnosis, TDD, triage, PRDs, issue slicing, architecture, prototyping, and grilling. |
| Supabase | [`supabase/agent-skills`](https://github.com/supabase/agent-skills) | Supabase and Postgres best-practice skills. |
| Vercel Labs | [`vercel-labs/skills`](https://github.com/vercel-labs/skills) | `find-skills` and the skills ecosystem references. |
| Vercel Labs | [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin) | Vercel plugin skills in the Codex plugin cache. |
| Jesse Vincent | [`obra/superpowers`](https://github.com/obra/superpowers) | Superpowers methodology skills for planning, TDD, debugging, verification, and parallel agents. |
| Peter Steinberger | [`steipete/oracle`](https://github.com/steipete/oracle) | Oracle CLI and Codex skill for packaging files and prompts for review. |
| Supabase Community | [`supabase-community/codex-plugin`](https://github.com/supabase-community/codex-plugin) | Supabase Codex plugin skills. |
| World | [`worldcoin/agentkit`](https://github.com/worldcoin/agentkit) and [AgentKit docs](https://docs.world.org/agents/agent-kit/integrate) | Workspace-local `agentkit-x402` skill and AgentKit x402 flow references. |
| OpenAI | [`openai/skills`](https://github.com/openai/skills) | Codex system skills and installable skill conventions. |
| OpenAI | [`openai/plugins`](https://github.com/openai/plugins) | Several OpenAI-authored curated plugin bundles copied from the local plugin cache. |
| OpenAI primary runtime | Local Codex primary-runtime cache | Document, spreadsheet, and presentation skills available to Codex. |
| OpenAI Browser plugin | [`openai/openai/lib/browser_use/plugin`](https://github.com/openai/openai/tree/master/lib/browser_use/plugin) | Bundled browser automation skill. |
| Skills ecosystem | [skills.sh](https://skills.sh/) | Discovery surface for installable skills. |
| Supabase docs | [supabase.com/docs](https://supabase.com/docs) | Product and database behavior references used by Supabase skills. |
| PostgreSQL docs | [postgresql.org/docs](https://www.postgresql.org/docs/current/) | Core database semantics and performance references. |
| OpenAI developer docs | [developers.openai.com](https://developers.openai.com/) | Current OpenAI API and product docs used by `openai-docs`. |

Third-party files keep their upstream authorship and licensing. The root `LICENSE` applies to my original material in this repo unless an upstream file or directory says otherwise.

## Refreshing The Snapshot

From this repo root, the local dump can be refreshed with the same shape:

```bash
mkdir -p skills/personal-agents skills/code-agents skills/personal-codex \
  skills/codex-system skills/plugin-cache/openai-curated \
  skills/plugin-cache/openai-bundled skills/plugin-cache/openai-primary-runtime \
  metadata

rsync -a ~/.agents/skills/ skills/personal-agents/
rsync -a /Users/dcbuilder/Code/.agents/skills/ skills/code-agents/
rsync -a ~/.codex/skills/oracle/ skills/personal-codex/oracle/
rsync -a ~/.codex/skills/.system/ skills/codex-system/

rsync -a --include='*/' --include='skills/***' --include='.codex-plugin/***' \
  --include='plugin.lock.json' --include='.app.json' --include='.mcp.json' \
  --exclude='*' \
  ~/.codex/plugins/cache/openai-curated/ skills/plugin-cache/openai-curated/

rsync -a --include='*/' --include='skills/***' --include='.codex-plugin/***' \
  --include='plugin.lock.json' --include='.app.json' --include='.mcp.json' \
  --exclude='*' \
  ~/.codex/plugins/cache/openai-bundled/ skills/plugin-cache/openai-bundled/

rsync -a --include='*/' --include='skills/***' --include='.codex-plugin/***' \
  --include='plugin.lock.json' --include='.app.json' --include='.mcp.json' \
  --exclude='*' \
  ~/.codex/plugins/cache/openai-primary-runtime/ \
  skills/plugin-cache/openai-primary-runtime/

cp ~/.agents/.skill-lock.json metadata/agents-skill-lock.json
[ -f /Users/dcbuilder/Code/.agents/.skill-lock.json ] && \
  cp /Users/dcbuilder/Code/.agents/.skill-lock.json metadata/code-agents-skill-lock.json
```

After refreshing, check the count:

```bash
find skills -name SKILL.md -print | wc -l
```
