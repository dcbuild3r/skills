# AI Methodology

This is the working method behind this skills repo: use skills as executable playbooks, keep the agent attached to real evidence, and preserve the user's intent all the way from vague request to verified result. The point is not ceremony. The point is to make the useful parts of agent behavior repeatable: choose the right mode, gather the right context, act directly, verify the outcome, and credit the people and projects whose tools make the workflow possible.

Snapshot context: this repo currently carries 85 kept skills and 69 scripts, curated from local Codex, personal agent, workspace-local agent, plugin cache, and primary runtime installs.

## Core Principles

### Skills Are Operating Procedures

A skill is not just a prompt. It is a named workflow for a recurring class of work. Bugs, PRDs, security validation, CI debugging, browser testing, repo judging, and issue planning all need different habits. Naming the workflow keeps the agent from flattening every task into generic coding.

The local skill set reflects this:

- `diagnose`, `systematic-debugging`, and `gh-fix-ci` for evidence-led debugging
- `tdd`, `test-driven-development`, and `prototype` for small executable slices
- `to-prd`, `to-issues`, `triage`, and `linear` for turning fuzzy intent into trackable work
- `security-scan`, `finding-discovery`, `validation`, and `fix-finding` for security work with clear phases
- `frontend-app-builder`, `frontend-testing-debugging`, `browser`, and Vercel skills for real rendered app work
- `oracle` for bundling a focused file set and prompt for external review
- `slack`, `github`, `google-drive`, `supabase`, and `vercel` for using the actual system of record

### Evidence Beats Plausibility

The default answer should come from the real source of truth, not a plausible memory of how things usually work. Depending on the task, that source of truth might be:

- the current checkout
- production headers
- GitHub checks and PR state
- BrowserStack artifacts
- authenticated app behavior
- a live browser run
- issue tracker state
- Slack context
- Supabase data
- official docs
- actual build and test output

If evidence is partial, say so. A failed database verification, missing device, gated demo, or unavailable CI run is not a reason to pretend certainty. It is part of the result.

### Work In Vertical Slices

The preferred implementation shape is tracer bullets: pick the smallest end-to-end behavior that proves the direction, wire it through, test it, then expand. This keeps work reviewable and prevents big speculative rewrites.

This matters especially for frontend and product work. The first screen should be a real usable surface, not a decorative landing page. For benchmark and browser work, separate the layers honestly: UI wiring, compile or artifact generation, and actual browser execution are different states of done.

### Preserve Scope Splits

When a plan has accepted boundaries, keep them. If one task is "engine-only native backend" and another is "app-style BrowserStack benchmark," do not merge them. If a user says local-static v1, keep the fallback local. If a backlog issue is gated to releases after a specific version, do not turn it into immediate migration work.

Good agent work is partly remembering the shape of the decision the user already made.

### Domain Language Shapes The Code

Read the repo's own vocabulary before inventing abstractions. Look for `CONTEXT.md`, ADRs, issue labels, product terms, local helper APIs, and existing component boundaries. If the code and docs disagree, say so. If the domain language is fuzzy, sharpen it before building a vague generic layer.

### Verify Before Claiming Completion

Completion means the relevant check passed, not that the code looks good. The check depends on the work:

- bugfix: reproduction plus passing regression path
- frontend: browser screenshot or interaction evidence
- dependency bump: install, lockfile update, typecheck, lint, build where available
- security question: trace the real sink, guard, deployment model, or exposed runtime
- benchmark: measure the intended region, excluding hidden setup
- skill install: verify the skill file and any runtime dependency separately
- repo judging: clone, build, test, and compare demo behavior to the claims

When a check cannot run, name the gap plainly.

### Keep Context Lean

Skills should use progressive disclosure. The entrypoint should describe when to use the workflow and point to scripts, references, or examples only as needed. A skill that dumps every fact into context becomes harder to use over time.

For personal Superpowers-style planning, the durable preference is to keep plan and skill drafts in the active conversation unless the user explicitly asks to persist them. Planning should help execution, not litter the repo.

### Prefer The User's Actual Runtime

The method follows the user's environment. In JavaScript and TypeScript repos, prefer Bun when the repo supports it. For apps, test the real dev server or built artifact. For mobile, confirm the device or simulator is actually usable before promising a run. For hosted apps, deployment model matters as much as package version.

## Workflow Patterns

### Diagnosis

Start by reproducing or locating the failure. Gather the smallest evidence set that explains what changed, where the behavior diverges, and which layer owns the problem. Avoid broad refactors until the failure has a name.

The useful habit: compare semantic timings, logs, artifacts, and runtime behavior before accepting the obvious explanation. A slow-looking benchmark may be a measurement-boundary bug. A failing mobile job may be a cloud/device inventory issue rather than a code issue.

### Test-Driven And Prototype Work

Use red-green-refactor when the target behavior is crisp. Use a prototype when the product or interaction shape is still uncertain. In both cases, keep the loop small enough that each step teaches something.

The goal is not to maximize process. The goal is to avoid building a beautiful abstraction around an untested assumption.

### Security Validation

Security work starts from a claim, then traces real data flow to real sinks and guards. Do not stop at "this looks scary" or "the version is affected." Check the deployment model, input boundary, write path, auth boundary, and impact wording.

Good security output distinguishes:

- affected package version from exposed deployment model
- attacker-controlled path from guaranteed overwrite
- plausible exploit from demonstrated sink
- remediation needed now from defense-in-depth backlog

### Benchmarking

Benchmarking is about honest timing semantics. Hidden setup must not sit inside the measured region. If a device-cloud result is strange, compare phase timings before blaming hardware variance. For native FFI work, separate engine measurement from app-style end-to-end measurement so binding generator overhead does not contaminate the question.

### Hackathon And Repo Judging

Judging means testing whether the project works as advertised. The durable flow is:

1. Fresh clone in the requested folder.
2. Install with the repo's intended package manager.
3. Run build and test commands.
4. Inspect live links or demos when provided.
5. Compare claims to implementation.
6. Report concrete blockers, trust gaps, and evidence.

A compile success is not enough if the demo path, API boundary, or advertised flow does not work.

### News And Content Ingestion

For repeat ingestion workflows, use a conservative operational loop: resolve metadata, canonicalize the URL, dedupe by exact URL and identifier, classify using local source data, insert, then verify. Sparse source text should produce sparse metadata. Do not invent detail to make the entry feel fuller.

### Product And Portal Work

Respect product scope corrections. If the desired frontend varies by domain, build domain-aware sections rather than a generic wiki view. Preserve local fallbacks when adding live data. For privacy-sensitive views, mask before paint, not after. For history and finance views, prefer explicit year-over-year comparison when the user's goal is tracking change across snapshots.

### Planning And Issue Writing

Plans should become independently grabbable work. Preserve accepted splits and turn them into concrete tickets with owners, boundaries, verification, and sequencing. If new downstream examples change the shape of the plan, re-evaluate rather than defending the old abstraction.

### External Review

Use `oracle` when a second model pass would help. The lesson from installing and using it is that the skill and runtime are separate: the skill teaches the workflow, while the `@steipete/oracle` CLI does the bundling. Verify both. Use tight file sets, dry-run summaries, and file reports before sending broad context.

## Lessons So Far

- The real source of truth changes by task. For security, trace sinks and deployment. For CI, inspect current checks. For browser work, inspect the live app. For planning, preserve tracker state and accepted scope.
- "Works locally" is not one bit. Build, test, browser render, artifact generation, and benchmark execution are different facts.
- Benchmark numbers are only meaningful when the measured boundary matches the claim.
- Dependency advisories need deployment-aware answers. A vulnerable version and an exposed production path are not the same thing.
- Use Bun by default for JS and TS repos that support it.
- Keep generated plans and Superpowers artifacts in the active conversation unless persistence is explicitly requested.
- When a verification path fails, report the gap instead of smoothing over it.
- Do not let broad recommendations erase the user's concrete constraint, like local-static, release-gated, app-style, or section-aware.
- Skill installation is two-part when a runtime is involved: install the skill, then verify the CLI or dependency it invokes.
- Browser screenshots and interaction checks catch a different class of failure than typechecks.
- Hackathon judging should test the promise, not just the repository.
- Sparse source material should stay sparse in generated metadata.
- A repo's local helpers and vocabulary usually beat a new abstraction.
- Commit only the skills the user actually wants to keep, and keep scripts visible in an inventory so executable behavior is auditable.

## Practical Checklist

Before acting:

- What workflow is this: diagnose, build, review, triage, benchmark, security, planning, or publish?
- What is the real source of truth?
- What user constraint must be preserved?
- Which files, tools, or docs are enough context?

While acting:

- Prefer the repo's existing patterns.
- Keep the slice small and runnable.
- Use structured tools and scripts when available.
- Credit upstream work.
- Avoid destructive git operations.

Before finishing:

- Run the relevant verification.
- Separate what passed from what was not checked.
- Link the changed files or resulting artifacts.
- Push only intentional scope.

## References And Credits

Credit belongs to the upstream authors and maintainers. This repo is a local snapshot plus my synthesis of how I use these skills.

| Project / author | Repo or reference | What it contributes |
| --- | --- | --- |
| Matt Pocock | [`mattpocock/skills`](https://github.com/mattpocock/skills) | Personal engineering workflow skills for diagnosis, TDD, triage, PRDs, issue slicing, architecture, prototyping, and plan grilling. |
| Supabase | [`supabase/agent-skills`](https://github.com/supabase/agent-skills) | Supabase and Postgres workflow guidance. |
| Vercel Labs | [`vercel-labs/skills`](https://github.com/vercel-labs/skills) | `find-skills` and ecosystem discovery references. |
| Vercel | [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin) | Vercel plugin skills and deployment-oriented agent guidance. |
| Jesse Vincent | [`obra/superpowers`](https://github.com/obra/superpowers) | Superpowers methodology for planning, TDD, debugging, verification, and parallel work. |
| Peter Steinberger | [`steipete/oracle`](https://github.com/steipete/oracle) | Oracle CLI and Codex workflow for bundling prompts plus focused file sets for review. |
| Supabase Community | [`supabase-community/codex-plugin`](https://github.com/supabase-community/codex-plugin) | Supabase Codex plugin skills. |
| World | [`worldcoin/agentkit`](https://github.com/worldcoin/agentkit) and [AgentKit docs](https://docs.world.org/agents/agent-kit/integrate) | Workspace-local `agentkit-x402` skill and AgentKit x402 flow references. |
| OpenAI | [`openai/skills`](https://github.com/openai/skills) | Codex system skills and skill conventions. |
| OpenAI | [`openai/plugins`](https://github.com/openai/plugins) | OpenAI-authored plugin bundles copied from the local Codex cache. |
| OpenAI Browser plugin | [`openai/openai/lib/browser_use/plugin`](https://github.com/openai/openai/tree/master/lib/browser_use/plugin) | Bundled browser automation skill. |
| Skills ecosystem | [skills.sh](https://skills.sh/) | Discovery surface for installable skills. |
| Supabase docs | [supabase.com/docs](https://supabase.com/docs) | Product and database behavior references used by Supabase skills. |
| PostgreSQL docs | [postgresql.org/docs](https://www.postgresql.org/docs/current/) | Core database semantics and performance references. |
| OpenAI developer docs | [developers.openai.com](https://developers.openai.com/) | Current OpenAI API and product documentation. |

Third-party files retain their upstream authorship and licensing. The root `LICENSE` applies to original material in this repo unless an upstream file or directory says otherwise.
