import { describe, it } from "node:test"
import assert from "node:assert"
import IDENTITY_HEADER from "./identityHeader.js"

describe("identityHeader", () => {
  it('returns "You are the <name> agent.\\n\\n" format', () => {
    const result = IDENTITY_HEADER("coder")
    assert.strictEqual(result, 'You are the "coder" agent.\n\n')
  })

  it('handles multi-word agent names', () => {
    const result = IDENTITY_HEADER("plan-writer")
    assert.strictEqual(result, 'You are the "plan-writer" agent.\n\n')
  })
})
