---
name: grok
description: "Ask Grok (xAI) questions inside the user's logged-in x.com session via the Chrome MCP. Grok is uniquely strong on X-native context: who works where, recent tweets, conversation history, account reputation, niche crypto/AI subcultures. Use it when the best evidence lives on X and not the open web. Two modes — (1) general query in the SuperGrok chat at x.com/i/grok, (2) target-anchored query via the per-post / per-profile 'Grok actions' menu when the question is about a specific tweet or account."
---

# Grok (via x.com Chrome session)

Grok is xAI's chat model embedded inside x.com. Because it indexes the live X graph it routinely beats general LLMs on:

- who currently works at org X (from bios, recent posts, replies)
- "what happened in the last 48h around topic Y" (timeline-native)
- niche subcultures (crypto, AI labs, e/acc, EA, etc.) where reputation lives in tweets
- disambiguating people who share a name (cross-references handles, followers, mutuals)
- pulling the substance of a long thread or quote-chain without scraping

Grok is **not** the right tool for: official documentation lookups, code review, repo bundling (use `/oracle` for that), structured factual lookups that have a clean primary source.

## Default workflow

1. Frame the question. Decide: is it **general** (about a topic / org / event) or **target-anchored** (about one tweet or one account)?
2. Make sure the user's Chrome session has an authenticated x.com tab. Use `mcp__chrome-browser__list_pages`; if no x.com tab, `new_page` to `https://x.com/home` and confirm via `take_snapshot` that the composer is visible (not a login wall).
3. Run the right mode (general vs target-anchored, below).
4. Watch generation until the stop/regen control flips to "regenerate" — Grok streams output.
5. Extract the final answer with `evaluate_script` (read the latest assistant message DOM) or read it from the snapshot, then bring it back into the conversation. Cite Grok explicitly as the source — its claims are not verified.
6. Verify anything load-bearing (an exit date, a job title, a claim about funding) against a primary source before acting. Grok will confidently hallucinate handles and dates.

## Mode A — general query (SuperGrok chat)

For "tell me about X", "who at EF Protocol is still active in 2026", "what is @somehandle known for", etc.

1. `mcp__chrome-browser__new_page` → `https://x.com/i/grok` (or navigate an existing X tab there).
2. `take_snapshot` to find the composer textbox uid.
3. `fill` the textbox with the prompt. Prefer specific, scoped prompts ("List every person who has publicly announced leaving the Ethereum Foundation in 2026, with the X post link") over open-ended ones.
4. Submit (Enter, or click the send button via uid from the snapshot).
5. Poll with `take_snapshot` every few seconds until the response stops streaming. The send button flips between "stop generating" and "send" states — that is the completion signal.
6. Copy the final assistant message text out.

## Mode B — target-anchored query (per-post / per-profile Grok actions)

When the question is about one tweet or one account, this mode gives Grok the right anchor without you having to describe it.

For a **specific post**:
1. Navigate to the post URL (`x.com/<handle>/status/<id>`).
2. `take_snapshot`; locate the `Grok actions` button on that article (every post has one).
3. Click it; a menu opens with options like *Summarize*, *Explain this post*, *What are people saying*, *Ask Grok about this*.
4. Pick the closest match, or pick "Ask Grok" and type a custom prompt. Submit.
5. Watch + extract as in Mode A.

For a **specific account**:
1. Navigate to `x.com/<handle>`.
2. From the profile page, either:
   - click the `Grok` top-bar button to open a chat with that profile already in context, or
   - click `Grok actions` on a representative pinned/recent post.
3. Ask the targeted question ("What does this person work on now? Who do they cite most? Recent role changes?").

## Prompt patterns that work

- **Role / employment intel**: "Based on their tweets and bio in 2026, what is @handle's current role and employer? Cite specific posts with dates."
- **Org headcount delta**: "List every account that has tweeted in 2026 about leaving <org>. Return handle, claimed prior role, departure date, and the linking tweet URL."
- **Who-knows-who**: "Among Ethereum Foundation Protocol researchers active on X, who has interacted most with @handle in the last 90 days?"
- **Subcultural read**: "What is @handle's reputation among the <subculture>? Cite representative tweets."
- **Thread distillation**: anchor on the root tweet and ask "Summarize this thread in <=10 bullets, preserving who said what and any URLs cited."

Always require citations (post URLs or handles). Grok will provide them when asked and hallucinate them when not.

## Safety preflight

Before submitting, confirm:
- The user explicitly asked for Grok / X-native research.
- Prompt does not contain secrets, credentials, contents of private DMs, or third-party private data.
- You are pasting into the user's own x.com session (visible handle in the top-right is `@dcbuilder`, per memory).
- You are not asking Grok to take any write action (post, reply, DM) — this skill is read-only. Posting is a separate, explicit ask.

If any item is false, stop and surface the issue instead of submitting.

## Limitations to call out in the answer

- Grok's training cutoff and live-index freshness drift; treat anything outside the last ~72h with extra skepticism.
- Grok confidently fabricates X handles. Verify any handle it cites by opening the profile.
- It tends to over-aggregate from low-confidence sources (parody accounts, sarcasm, deleted-then-quoted posts). Cross-check with the actual post.
- Long threads can get truncated; if the question hinges on a specific reply deep in a chain, navigate there directly first.

## When to combine with other skills

- After Grok identifies a person of interest → use `mcp__session__lookup_person` for a structured profile card.
- After Grok summarizes an X thread on a topic Dominik wants to remember → file as a Clipping via `/content`.
- For deep technical / cryptography research, prefer `/oracle` (ChatGPT Pro deep research) over Grok — see `feedback_oracle_routing.md`.

## Example invocations

```
/grok who are the three EF protocol leads in 2026 and what is each person's current status (sabbatical / leaving / still active)? cite tweets.
```

```
/grok target=https://x.com/raulvk/status/2056712036059369955  summarize the thread and any quoted replies. who else announced an EF exit in the same window?
```

```
/grok target=https://x.com/somehandle  what does this person currently work on, who do they cite most, any recent role change? cite specific posts.
```
