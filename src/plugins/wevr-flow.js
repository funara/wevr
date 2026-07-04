import { tool } from "@opencode-ai/plugin"

function formatInput(input) {
  if (
    input == null ||
    (typeof input === "object" &&
      !Array.isArray(input) &&
      Object.keys(input).length === 0)
  ) {
    return ""
  }
  return `\n    input: ${JSON.stringify(input)}`
}

function formatTool(part) {
  const state = part.state
  const status = state.status
  const title = state.title ?? part.tool
  const input = formatInput(state.input)
  if (status === "error") {
    return `  [tool] ${title} → error: ${state.error}${input}`
  }
  return `  [tool] ${title} → ${status}${input}`
}

function formatParts(parts) {
  const lines = []
  for (const part of parts) {
    if (part.type === "text") {
      lines.push(part.text)
    } else if (part.type === "tool") {
      lines.push(formatTool(part))
    }
  }
  return lines.join("\n")
}

function formatModel(info) {
  const base = `${info.providerID}/${info.modelID}`
  return info.variant ? `${base} (${info.variant})` : base
}

function formatMessage(msg, index) {
  const num = index + 1
  if (msg.info.role === "assistant") {
    const info = msg.info
    const agent = info.agent ?? "unknown"
    const header = `${num}. assistant (${agent}) [${formatModel(info)}]`
    return `${header}\n${formatParts(msg.parts)}`
  }
  return `${num}. ${msg.info.role}\n${formatParts(msg.parts)}`
}

export const SessionFlowPlugin = async ({ client }) => {
  async function formatSessionMessages(sessionID, emptyMessage) {
    const response = await client.session.messages({
      path: { id: sessionID },
    })
    const messages = response.data ?? []
    if (messages.length === 0) {
      return emptyMessage
    }

    return messages.map(formatMessage).join("\n\n---\n\n")
  }

  async function formatSessionMessagesBatch(sessionIDs) {
    const sections = await Promise.all(
      sessionIDs.map(async (sessionID) => {
        const emptyMessage = "(No messages found or session not accessible)"

        try {
          const output = await formatSessionMessages(sessionID, emptyMessage)
          return `=== Session: ${sessionID} ===\n${output}`
        } catch {
          return `=== Session: ${sessionID} ===\n${emptyMessage}`
        }
      }),
    )

    return sections.join("\n\n")
  }

  return {
    tool: {
      parent_session_messages: tool({
        description:
          "Fetch all messages from the parent session. " +
          "Returns the full conversation with agent attribution " +
          "and message content. Only works from subagent sessions " +
          "(sessions with a parentID).",
        args: {},
        async execute(_args, context) {
          const session = await client.session.get({
            path: { id: context.sessionID },
          })
          const parent = session.data?.parentID
          if (!parent) {
            return `Error: Session ${context.sessionID} has no parent. This tool only works from subagent sessions.`
          }

          return formatSessionMessages(
            parent,
            `Session ${parent} has no messages.`,
          )
        },
      }),
      session_messages: tool({
        description:
          "Fetch all messages from a session by ID. " +
          "Returns the full conversation with agent attribution " +
          "and message content.",
        args: {
          sessionId: tool.schema.string().describe("The session ID to read"),
        },
        async execute(args) {
          return formatSessionMessages(
            args.sessionId,
            `Session ${args.sessionId} has no messages.`,
          )
        },
      }),
      session_messages_batch: tool({
        description:
          "Fetch all messages from multiple sessions by ID. Returns the full conversations concatenated with session delimiters. Useful for reading multiple related sessions (e.g., TDD phase sessions from a dispatch log) in a single tool call.",
        args: {
          sessionIds: tool.schema
            .array(tool.schema.string())
            .describe("Array of session IDs to fetch messages from."),
        },
        async execute(args) {
          return formatSessionMessagesBatch(args.sessionIds)
        },
      }),
    },
  }
}
