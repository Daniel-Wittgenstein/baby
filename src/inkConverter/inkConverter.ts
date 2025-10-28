/* 

  Experimental / unfinished

*/

import { Kompilat } from "../compiler/compiler"
import { LineType } from "../interopTypes"
import { Line } from "../interopTypes"
import { extractLabelAndCommandInfo } from "../runtime/extractLabelAndCommandInfo"
import { removeFirstChar } from "../runtime/utils"
import { hasLabelStartText } from "../runtime/hasLabelStartText"
import { getFirstWordAndRest } from "../runtime/utils"
import { Command } from "../runtime/runtimeTypes"
import { arithmeticCommands, arithmeticToInk } from "../runtime/arithmetic"

const commandPrefix = "$"

const indent = 2

const postInk = `
=== function round(u3_x)
    {u3_x < 0:
        {FLOOR(u3_x) + 1 - u3_x < 0.5:
            ~ return FLOOR(u3_x) + 1
        }
        ~ return FLOOR(u3_x)
    }
    ~ return FLOOR(u3_x + 0.5)
`

export function convertToInk(kompilat: Kompilat) {
  const { targetTable, commandTable } = extractLabelAndCommandInfo(kompilat.lines)
  let final = ""

  let index = -1

  for (const line of kompilat.lines) {

    index++

    final += " ".repeat((line.level - 1) * indent)

    if (line.type === LineType.Choice) {
      final += choiceToInk(line)
      continue

    }
    
    if (line.type === LineType.Gather) {
      final += gatherToInk(line)
      continue
    }

    if (!line.text.startsWith(".")) {
      // normal text:
      final += textToInk(line)
      continue
    }

    const text = removeFirstChar(line.text)

    if (hasLabelStartText(text)) {
      const [_, name] = getFirstWordAndRest(text)
      final += labelToInk(line)
      continue
    }

    const command = commandTable[index]

    if (!command) {
      throw new Error(`Index ${index}: ${text}: this line is neither recognized as a choice, `
        + `nor a label nor a command, but it starts with a dot? Fatal dev error.`)
    }

    final += commandToInk(command)

  }

  return final + "\n\n// ###########\n\n" + postInk
}


function choiceToInk(line: Line) {
  return "+".repeat(line.level) + line.text
}


function gatherToInk(line: Line) {
  return "-".repeat(line.level) + line.text
}


function labelToInk(line: Line) {
  return "-".repeat(line.level) + `(${line.text})`
}


function commandToInk(command: Command) {
  const {name, text} = command
  const func = arithmeticCommands[name]

  if (!func) {
    // these commands are just left as text, not converted:
    return commandPrefix + name + " " + text
  }

  const [first, second] = getFirstWordAndRest(text)

  const inkText = arithmeticToInk[name](first, second)

  return inkText + "\n"
}


function textToInk(line: Line) {
  return line.text + "\n"
}

