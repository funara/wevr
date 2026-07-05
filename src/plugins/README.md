# Bundled plugins

This folder holds plugin source files that `wevr init` copies into the
user's OpenCode plugin directory (`~/.config/opencode/plugins/`), giving
subagents cross-session context tools and command output filtering out of
the box.

## `wevr-flow.js` -- cross-session context

Implementation of the `SessionFlowPlugin`. Exposes three tools for reading
conversation history across related sessions (parent, sibling, or batch):

- `parent_session_messages` -- read the parent session's full transcript
- `session_messages(sessionId)` -- read any session by ID
- `session_messages_batch(sessionIds)` -- read multiple sessions in one call

The output is a structured text dump with numbered messages, agent
attribution, and one-line tool-invocation summaries, separated by
`\n\n---\n\n`.

## `wevr-squeeze.js` -- context quality & session continuity

Implementation of the `WevrSqueezePlugin` (rebranded from `token-optimizer-opencode`). Monitors context fill limits and session health, calculates ResourceHealth and SessionEfficiency metrics, alerts on loop/retry patterns, and enables seamless session continuity/restores for same-project tasks.

## Why `wevr-flow` was extracted

Subagents (Coder, Tester, Reviewer, Inspector, Fixer, etc.) run in fresh
child sessions with no access to the parent orchestrator's conversation
history. When a parent agent dispatches a subagent via the `Task` tool, the
subagent cannot see what was discussed in the parent -- which means it has
to ask the user to re-paste context, or guess. `parent_session_messages`
bridges that gap: the subagent can fetch the parent transcript on demand
and pick up where the parent left off.

## Why the identity plugin was dropped

The original `AgentSelfIdentityPlugin` injected agent identity via
`experimental.chat.*` hooks. Wevr's 12 agent names are known at install
time, so we prepend a static identity header (`You are the "<name>" agent.`)
to every generated prompt file. This is KISS: no hook evaluation per
request, no dependency on undocumented experimental APIs, single source
of truth in `src/core/identityHeader.js`.

## Why the attribution tool was dropped

The original `AgentAttributionToolPlugin` was designed for a Retrospective
agent that captures post-session observations. Wevr has no Retrospective
agent in its pipeline, so the tool would have no caller -- YAGNI.

## How they are loaded

`wevr init` copies both plugins into `~/.config/opencode/plugins/` and
writes a `package.json` declaring `@opencode-ai/plugin: ^1.17.9` as a
dependency. On OpenCode's first launch, the
bundled Bun runtime detects the `package.json` and runs `bun install`
automatically -- no user action required. Once installed, both plugins are
available to every agent that has the appropriate permissions.
