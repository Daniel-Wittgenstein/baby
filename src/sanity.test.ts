
// @ts-ignore
import { test, expect } from "vitest"

test("1 + 1 should equal 2", () => {
  expect(1 + 1).toBe(2)
})

test("vitest should not be going insane 1", () => {
  expect(() => {throw new Error(``)}).toThrowError()
})

test("vitest should not be going insane 2", () => {
  expect(() => {}).not.toThrowError()
})
