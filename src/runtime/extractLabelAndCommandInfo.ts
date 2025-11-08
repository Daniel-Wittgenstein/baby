
import { Command, TargetTable, CommandTable } from "./runtimeTypes"

import { Line, LineType } from "../interopTypes"

import { getFirstWordAndRest, removeFirstChar } from "./utils"

import { userError } from "./userError"

import { hasLabelStartText } from "./hasLabelStartText"

import { arithmeticCommands } from "./arithmetic"

import { splitCommandTextIntoParts } from "./splitCommandTextIntoParts"

import { CustomCommand } from "./runtimeTypes"

export function extractLabelAndCommandInfo(storyLines: Line[],
  customCommands: Record<string, CustomCommand>
) {

  const targetTable: TargetTable = {}

  const commandTable : CommandTable = []


  function validateCommand(name: string, text: string, orgNo: number) {
    if (name === "goto") {
      const labelName = text
      if (!doesLabelExist(labelName)) {
        userError(`".goto ${labelName}", but there is no label with name "${labelName}"`, orgNo)
      }
      return
    }

    if (name === "end") {
      userError(`".end" is not a thing. Either use "end" to close an if block or `
        + `use ".quit" if you want to quit the story.`, orgNo)
      return
    }

    if (name === "quit") {
      if (text.trim()) {
        userError(`I did not expect additional text on a "quit" command line.`, orgNo)
      }
      return
    }

    if (arithmeticCommands[name]) {
      return
    }

    const customCommand = customCommands[name]

    if (!customCommand) {
      userError(`command with name "${name}" does not exist.`, orgNo)
      return
    }

    if (!customCommand?.onStart) return // no onStart function: no check, consider
      // command valid

    //call onStart function:

    const parts = splitCommandTextIntoParts(text)
    const result = customCommand.onStart(parts, text, name)

    if (typeof result === "string") {
      userError("custom command error: " + result, orgNo)
      return
    }

    return
  }


  function doesLabelExist(name: string) {
    const index = getLabelIndex(name)
    return index || index === 0
  }


  function getLabelIndex(name: string) {
    return targetTable[name]
  }


  function addLabel(index: number, name: string) {
    name = name.toLowerCase()
    targetTable[name] = index
  }


  function addCommand(index: number, commandName: string, text: string, orgNo: number) {
    commandTable[index] = {
      name: commandName,
      text,
    }
    validateCommand(commandName, text, orgNo)
  }

  //construct label info:

  for (const line of storyLines) {
    if (line.type === LineType.Undecided) {
      if (!line.text.startsWith(".")) continue
      const text = removeFirstChar(line.text)
      if (hasLabelStartText(text)) {
        const [_, name] = getFirstWordAndRest(text)
        addLabel(line.index, name)
        continue
      }
    }
  }

  // and now process commands:
  for (const line of storyLines) {
    if (line.type !== LineType.Undecided || !line.text.startsWith(".")) continue
    
    const text = removeFirstChar(line.text)
    if (hasLabelStartText(text)) continue

    let [commandName, rest] = getFirstWordAndRest(text)
    commandName = commandName.toLowerCase()
    addCommand(line.index, commandName, rest, line.orgCodeLineNo)
  }

  return {
    targetTable,
    commandTable,
  }

}