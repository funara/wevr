import { describe, it } from "node:test"
import assert from "node:assert"
import { cleanJsonc } from "../src/cli/commands/doctor.js"

describe("cleanJsonc", () => {
  it("leaves standard JSON unchanged", () => {
    const input = '{"a": 1, "b": "hello"}'
    assert.deepStrictEqual(JSON.parse(cleanJsonc(input)), { a: 1, b: "hello" })
  })

  it("strips single-line comments", () => {
    const input = `{
      // this is a comment
      "a": 1 // another comment
    }`
    assert.deepStrictEqual(JSON.parse(cleanJsonc(input)), { a: 1 })
  })

  it("strips multi-line comments", () => {
    const input = `{
      /* this is a
         multi-line comment */
      "a": 1
    }`
    assert.deepStrictEqual(JSON.parse(cleanJsonc(input)), { a: 1 })
  })

  it("strips trailing commas in objects", () => {
    const input = `{
      "a": 1,
      "b": 2,
    }`
    assert.deepStrictEqual(JSON.parse(cleanJsonc(input)), { a: 1, b: 2 })
  })

  it("strips trailing commas in arrays", () => {
    const input = `[
      "one",
      "two",
    ]`
    assert.deepStrictEqual(JSON.parse(cleanJsonc(input)), ["one", "two"])
  })

  it("does not strip commas or comment-like structures inside double-quoted strings", () => {
    const input = `{
      "url": "http://example.com",
      "description": "text with a, comma and // not a comment",
      "trailing_comma_str": "value,"
    }`
    assert.deepStrictEqual(JSON.parse(cleanJsonc(input)), {
      url: "http://example.com",
      description: "text with a, comma and // not a comment",
      trailing_comma_str: "value,",
    })
  })
})
