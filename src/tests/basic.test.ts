// @ts-ignore
import { test, expect } from "vitest"

import { compilerSetOnError } from "../compiler/compiler"

import { Line } from "../interopTypes"

import { compileAndRun } from "./test-funcs"

compilerSetOnError((msg: string, line: Line) => {
  throw new Error(msg)
})


test("basic code that should work without an error", () => {
  expect(() => compileAndRun(
    `endsdd`, {
      clickOn: [],
      textAppears: [],
      textDoesNotAppear: [],
    }
  )).not.toThrowError()
})


test("basic code that should throw compiler error", () => {
  expect(() => compileAndRun(
    `end`, {
      clickOn: [],
      textAppears: [],
      textDoesNotAppear: [],
    }
  )).toThrowError()
})

