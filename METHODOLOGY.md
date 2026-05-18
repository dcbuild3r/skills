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

## External Sources To Explore

These are external articles, talks, docs, repos, and reference lists that shaped the methodology above. They are not all direct code dependencies. Treat them as the wider reading trail behind the operating model.

### Core Agent Methodology

| Source | Link | Why it matters |
| --- | --- | --- |
| z80 methodology thread | [x.com/0xz80](https://x.com/0xz80/status/2048736124328104326) | GPT Pro planning, Codex execution, worklogs, PR splitting, and subagent review loops for large work. |
| Matt Pocock, "Software Fundamentals Matter More Than Ever" | [YouTube](https://www.youtube.com/watch?v=v4F1gFy-hqg) | Engineering fundamentals as the antidote to AI-compounded codebase entropy. |
| Andrej Karpathy, "From Vibe Coding to Agentic Engineering" | [YouTube](https://www.youtube.com/watch?v=96jN2OCOfLs) | The shift from unverified vibe coding to verifier-grounded agentic engineering. |
| Mario Zechner, "Building pi in a World of Slop" | [YouTube](https://www.youtube.com/watch?v=RjfbvDXpFls) | Minimal, observable, self-modifiable harnesses and the human discipline layer needed around agents. |
| Addy Osmani, "Agent Harness Engineering" | [X article](https://x.com/addyosmani/status/2053231239721885918) | The "agent = model + harness" frame and the rule that every harness rule should trace to a real failure. |
| Petra Donka, "Agents Need Feedback Loops, Not Perfect Prompts" | [X article](https://x.com/petradonka/status/2054897826149101588) | Feedback loops, principles-not-rules, and PR-reviewed self-improvement for judgment-heavy agents. |
| Nader Dabit, "Agent Hooks: Deterministic Control for Agent Workflows" | [X article](https://x.com/dabit3/status/2055319214202777894), [GitHub](https://github.com/dabit3/agent-hooks-in-depth), [demo repo](https://github.com/dabit3/agent-hooks-in-depth/tree/main/agent-hooks-demo) | The hooks layer: move always/never/run/verify behavior out of model memory and into deterministic lifecycle checks. |
| goodalexander, "Ramping Your Coding Output with OpenAI's Codex" | [X article](https://x.com/goodalexander/status/2053573659235602645) | Solo-operator lessons for long-running Codex work, model routing, cleanup passes, and ROI framing. |
| Hermes Agent | [YouTube](https://www.youtube.com/watch?v=NvakBZyc1Sg), [docs](https://hermes-agent.nousresearch.com/docs/) | Self-hosted, always-on agent runtime with profiles, memory, skills, cron, Kanban, and MCP surfaces. |
| Oracle pattern | [steipete/oracle](https://github.com/steipete/oracle), [aniketpanjwani oracle skill](https://github.com/aniketpanjwani/skills/blob/main/skills/general/oracle/SKILL.md) | Bundle the right local context and route hard reasoning to a stronger external model. |

### Background Agents And Agentic SDLC

| Source | Link | Why it matters |
| --- | --- | --- |
| background-agents.com | [background-agents.com](https://background-agents.com/) | The "background agents" thesis: org-level software automation needs cloud runtime, governance, and fleet coordination. |
| Background Agents Summit | [summit](https://background-agents.com/summit) | Talks and operator context for infra, security, and leadership around background agents. |
| Background Agents Tool Landscape | [landscape](https://background-agents.com/landscape/) | Market map across interfaces, sandboxes, orchestration, security, review, agents, benchmarks, and standards. |
| Ona whitepapers | [ona.com/whitepapers](https://ona.com/whitepapers) | Agentic SDLC references on background agents, platform engineering, governance, and secure AI-native development. |
| Spotify background coding agent | [Part 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | Operating an internal background coding agent across many production PRs. |
| Spotify context engineering | [Part 2](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) | How repo selection, pruning, retrieval, and context design affect background-agent reliability. |
| Spotify feedback loops | [Part 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) | Tests, evals, and CI signals as predictability levers for background agents. |
| Spotify Backstage Honk | [Backstage article](https://backstage.spotify.com/how-spotify-built-honk) | Background agents integrated into internal developer portals. |
| Stripe Minions | [Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents), [Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) | One-shot, end-to-end coding agents at monorepo scale. |
| Ramp background agent | [builders.ramp.com](https://builders.ramp.com/post/why-we-built-our-background-agent) | Build-vs-buy and org-design rationale for internal background agents. |
| Ramp Inspect architecture | [Rahul GS thread](https://x.com/rahulgs/status/2016284233438793793) | Architecture reference for Ramp's background-agent platform. |
| Ramp Sheets self-maintenance | [Ramp Labs thread](https://x.com/RampLabs/status/2036165188899012655) | Scheduled and event-driven agents for continuous product maintenance. |
| Ramp adoption playbook | [Geoff Charles thread](https://x.com/geoffintech/status/2042002590758572377) | Cultural and managerial patterns for getting an engineering org to adopt agents. |
| Uber AI development | [Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/how-uber-uses-ai-for-development) | Large-org AI development rollout and agent-ready developer-platform lessons. |
| Harvey Spectre | [harvey.ai](https://www.harvey.ai/blog/building-spectre-internal-collaborative-cloud-agent-platform) | Collaborative cloud agent platform for a domain-heavy engineering org. |
| OpenAI Harness Engineering | [openai.com](https://openai.com/index/harness-engineering/) | Harness engineering as the scaffolding around Codex and agent-first development. |
| Cursor self-driving codebases | [cursor.com](https://cursor.com/blog/self-driving-codebases) | Long-running agents and self-maintaining codebase framing. |
| Cursor long-running agents | [cursor.com](https://cursor.com/blog/long-running-agents) | Reliability and cost notes for minutes-to-hours cloud agents. |
| Simon Willison on StrongDM | [simonwillison.net](https://simonwillison.net/2026/Feb/7/software-factory/) | A cautionary/observational case of serious software built through agent-heavy workflows. |

### Research, Verification, Identity, And Context

| Source | Link | Why it matters |
| --- | --- | --- |
| Memento: Teaching LLMs to Manage Their Own Context | [thread](https://x.com/DimitrisPapail/status/2041974013950373901), [paper](https://github.com/microsoft/memento/blob/main/docs/memento.pdf), [dataset](https://huggingface.co/datasets/microsoft/OpenMementos), [code](https://github.com/microsoft/memento) | Learned context management, compression, KV-cache reduction, and selective forgetting as an agent skill. |
| Timour Kosters, "AI Agents as Coordination Technology" | [At The Edges](https://attheedges.timour.xyz/p/ai-agents-as-coordination-technology) | Agents as civic and organizational coordination infrastructure, not just personal copilots. |
| Vitalik Buterin, "A Shallow Dive into Formal Verification" | [vitalik.eth.limo](https://vitalik.eth.limo/general/2026/05/18/fv.html) | AI-assisted software as "LLM proposes, deterministic checker verifies," especially for security-critical systems. |
| Benjamin Fels, "The Feature" | [X article](https://x.com/benjamintfels/status/2056307684622696836) | AI deception/fraud framing and the case for physical-world ground truth and proof of personhood. |
| cyber-Fund, "The Monastery for AI-Native Founders" | [Notion](https://www.notion.so/cyber-Fund-The-Monastery-for-AI-Native-Founders-3514e3a6b4af800b95ffeca0e967c7ed) | AI-native organization design, founder intensity, and agentic operating-company framing. |
| Karpathy LLM Wiki pattern | [gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) | The Obsidian/vault methodology backbone: raw sources, wiki summaries, concepts, entities, explorations, and logs. |

### Hooks, Security, Standards, And Evaluation

| Source | Link | Why it matters |
| --- | --- | --- |
| Claude Code hooks guide | [code.claude.com](https://code.claude.com/docs/en/hooks-guide) | Practical hook setup for lifecycle enforcement. |
| Claude Code hooks reference | [code.claude.com](https://code.claude.com/docs/en/hooks) | Event and schema reference for Claude Code hooks. |
| Devin hooks overview | [cli.devin.ai](https://cli.devin.ai/docs/extensibility/hooks/overview) | Cross-runtime hook concepts for Devin for Terminal. |
| Devin lifecycle hooks | [cli.devin.ai](https://cli.devin.ai/docs/extensibility/hooks/lifecycle-hooks) | Lifecycle-event reference for Devin hooks. |
| OpenAI Codex hooks | [developers.openai.com](https://developers.openai.com/codex/hooks) | Codex hook support for policy, validation, and completion gates. |
| Cursor hooks | [cursor.com](https://cursor.com/docs/hooks) | Cursor hook documentation. |
| Cursor CLI | [cursor.com](https://cursor.com/cli) | CLI surface relevant to agent workflow automation. |
| MCP Security Best Practices | [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/draft/basic/security_best_practices) | Official MCP security posture for tool and server integrations. |
| OWASP MCP Security Cheat Sheet | [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/cheatsheets/MCP_Security_Cheat_Sheet.html) | Practical security checklist for MCP deployments. |
| GitHub artifact attestations | [docs.github.com](https://docs.github.com/actions/security-for-github-actions/using-artifact-attestations) | Provenance and supply-chain verification for generated artifacts. |
| GitHub OIDC | [docs.github.com](https://docs.github.com/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect) | Short-lived credential flow for CI/CD and agent-adjacent automation. |
| npm trusted publishing | [docs.npmjs.com](https://docs.npmjs.com/trusted-publishers) | Trusted publishing pattern for npm packages. |
| crates.io trusted publishing | [doc.rust-lang.org](https://doc.rust-lang.org/cargo/reference/registry-authentication.html#trusted-publishing) | Trusted publishing pattern for Rust crates. |
| cargo vet | [mozilla.github.io](https://mozilla.github.io/cargo-vet/) | Supply-chain audit tooling for Rust dependencies. |
| SLSA provenance spec | [slsa.dev](https://slsa.dev/spec/v1.0/provenance) | Provenance format and supply-chain assurance reference. |
| Trail of Bits Claude Code skill ecosystem | [trailofbits.com](https://blog.trailofbits.com/) | Security-minded agent customization, skills, and devcontainer patterns. |

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
