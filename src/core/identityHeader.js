// Single source of truth for the agent identity prefix prepended to every
// generated prompt file. Mirrors the system identity concept from the
// dropped hook-based AgentSelfIdentityPlugin, but as a static prepend
// (KISS: agent names are known at install time).

export default function IDENTITY_HEADER(agentName) {
  return `You are the "${agentName}" agent.\n\n`
}
