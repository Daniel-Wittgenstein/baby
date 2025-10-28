// @ts-ignore
import { test, expect } from "vitest"

import { compilerSetOnError } from "../compiler/compiler"

import { Line } from "../interopTypes"

import { compileAndRun } from "./test-funcs"

compilerSetOnError((msg: string, line: Line) => {
  throw new Error(msg)
})

const BASIC_STORY =     `

###story###

You are walking through a forest.

You reach a fork in the road.

. Go left.

  You go left and die.

. Go right.

  You go right and die.

. Go back home.

  You go back home: good decision!

  In fact, this was the best decision.

-

The story ends here.

`


test("basic flow", () => {
  expect(() => compileAndRun(
    BASIC_STORY, {
      clickOn: ["Go back home."],
      textAppears: ["No such text in story therefore we expect the test code to throw an error."],
      textDoesNotAppear: [""],
    }
  )).toThrowError()
})



test("basic flow", () => {
  expect(() => compileAndRun(
    BASIC_STORY, {
      clickOn: ["Go back home."],
      textAppears: ["In fact, this was the best decision.", "The story ends here."],
      textDoesNotAppear: ["You go right and die."],
    }
  )).not.toThrowError()
})



test("basic flow", () => {
  expect(() => compileAndRun(
    BASIC_STORY, {
      clickOn: ["Go right."],
      textAppears: ["You go right and die."],
      textDoesNotAppear: [],
    }
  )).not.toThrowError()
})



test("basic flow", () => {
  expect(() => compileAndRun(
    BASIC_STORY, {
      clickOn: ["Go left."],
      textAppears: ["You go left and die.", "The story ends here."],
      textDoesNotAppear: ["In fact, this was the best decision."],
    }
  )).not.toThrowError()
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

