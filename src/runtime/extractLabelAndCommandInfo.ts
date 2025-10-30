
import { Command, TargetTable, CommandTable } from "./runtimeTypes"

import { Line, LineType } from "../interopTypes"

import { getFirstWordAndRest, removeFirstChar } from "./utils"

import { userError } from "./userError"

import { hasLabelStartText } from "./hasLabelStartText"

import { arithmeticCommands } from "./arithmetic"

export function extractLabelAndCommandInfo(storyLines: Line[]) {

  const targetTable: TargetTable = {}

  const commandTable : CommandTable = []


  function validateCommand(name: string, text: string, orgNo: number) {
    if (name === "goto") {
      const labelName = text
      if (!doesLabelExist(labelName)) {
        userError(`".goto ${labelName}", but there is no label with name "${labelName}"`, orgNo)
      }
      return true
    }

    if (name === "end") {
      userError(`".end" is not a thing. Either use "end" to close an if block or `
        + `use ".quit" if you want to quit the story.`, orgNo)
      return true // yes, return true here!
    }

    if (name === "quit") {
      if (text.trim()) {
        userError(`I did not expect additional text on a "quit" command line.`, orgNo)
      }
      return true
    }

    if (arithmeticCommands[name]) {
      return true
    }

    // allow unknown commands? if yes, return true here:
    return false
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
    if (!validateCommand(commandName, text, orgNo)) {
      userError(`".${commandName}" is not a valid command. `+
        `If you wanted to create a choice, put a space after the dot.`, orgNo
      )
    }
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