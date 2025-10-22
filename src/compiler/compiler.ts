
import { Line, LineType, MetaData } from "../interopTypes"

import { countOccurrences, splitOnlyAtFirst } from "../interopUtils"
import { getFirstWordAndRest } from "../runtime/utils"

import { isGather, isChoice } from "../interopLang"

import { MAGIC_STORY_STARTER } from "../interopLang"

const choiceToken = "."
const gatherToken = "-"

let onErrorFunc


function userCompilerError(text: string, line: Line) {
  onErrorFunc(text, line)
  throw new Error(text)
}

function codeToLines(str: string) : Line[] {
  return str.split("\n").map((orgText, i) => {
    return {
      orgText,
      orgCodeLineNo: i + 1,
      text: orgText.trim(),
      index: i,
      level: 0,
      nextLineIndex: 0, // 0 has special meaning: proceed to next line.
        // This is historical and damn stupid, because what if the next line
        // is literally the line with index 0? (Yes, the next line
        // can have index zero. Obviously there is no line before line 0,
        // but goto exists.) The fix is to not allow
        // labels on line 0 (the very first line of the script.) STUPID, see below
        // Luckily, we usually have meta data anyway in front of the story, so
        // this is not a big deal. 
      type: LineType.Undecided,
      deadEnd: false,
    }
  })
}


function processMultiTokenLine(str: string, char: string) : [string, number] {
  let level = 0
  let i = 0
  while (i < str.length) {
    const current = str[i]
    if (current !== char && current.trim() !== "") {
      break
    }
    if (current === char) {
      level++
    }
    i++
  }
  return [str.substring(i).trim(), level]
}


function addChoiceGatherInfo(lines: Line[]) {
  // Add info whether each line is a choice or gather, otherwise leave type at undecided.
  // Also determine choice/gather level from start tokens on line.
  for (const line of lines) {
    const text = line.text

    if (isGather(text, gatherToken)) {
      line.type = LineType.Gather
      const [newText, newLevel] = processMultiTokenLine(text, gatherToken)
      line.text = newText
      line.level = newLevel

    } else if (isChoice(text, choiceToken)) {
      line.type = LineType.Choice
      const [newText, newLevel] = processMultiTokenLine(text, choiceToken)
      line.text = newText
      line.level = newLevel

    } else {
      line.type = LineType.Undecided
    }
  }
}

function addLevelInfo(lines: Line[]) {
  // set level for all other lines
  let level = 1
  for (const line of lines) {
    if (line.level) {
      // encountered gather or choice, they already have a level
      // and they determine the level of the rest of the lines:
      if (line.type === LineType.Gather) {
        level = line.level
      } else if (line.type === LineType.Choice) {
        level = line.level + 1
      } else {
        throw new Error(`Fatal: only choices and gathers should have a level property `+
          `at this stage.`
        )
      }
      
      continue
    }
    line.level = level
  }
}


function markDeadEnds(lines: Line[]) {
  let i = -1
  for (const line of lines) {
    i++
    const nextLine = lines[i + 1]
    if (!nextLine) break
    if (nextLine.type === LineType.Choice || nextLine.type === LineType.Gather) {
      if (nextLine.level === line.level) {
        continue
      }
      if (nextLine.level > line.level) {
        userCompilerError("Line level too high for this context.", nextLine)
        return
      }
      // line is dead-end because next line is choice or gather with lower level.
      // dead-end means that we need to find the next gather and tell this line
      // where the next gather is or the line won't know where to go next.
      line.deadEnd = true
    }
  }
}

function connectDeadEndsWithGathers(lines: Line[]) {
  /* 
    I have no clue if this is correct.
    It honestly makes my brain hurt.
  */
  const stack : Line[] = []
  for (const line of lines) {
    if (line.type === LineType.Gather) {
      // we encountered a gather:
      const gather = line
      while (stack.length) {
        // first look if the last stack element even has the correct level:
        // (is this even necessary if the gather are well-formed?)
        const peek = stack[stack.length - 1]
        if (gather.level <= peek.level - 1) {
          //if yes, we found the corresponding gather to this line:
          // remove it from the stack, assign it the gather's index
          // as nextLineIndex so it knows where to continue execution.
          // but we stay in the while loop and check the next items.
          const line = stack.pop()
          if (!line) {
            throw new Error("Fatal")
          }
          line.nextLineIndex = gather.index
        } else {
          break
        }
      }
      continue
    }
    if (!line.deadEnd) continue
    // line with a dead-end, push it onto the stack:
    stack.push(line)
  }
}


function connectChoicesWithEachOther(lines : Line[]) {
  const stack : Line[] = []
  for (const line of lines) {

    if (line.type === LineType.Choice) {

      // remove entries from stack until a choice
      // is met that has a lower or equal level:
      while (stack.length) {
        const peek = stack[stack.length - 1]
        if (peek.level <= line.level) {
          break
        }
        const _ = stack.pop()
        console.log("§GUKESH REMOVE FROM STACK", _)
      }

      // if a previous choice with the same level as this choice
      // exists at the top of the stack,
      // remove the previous choice from the stack and connect
      // it with this choice:
      if (stack.length) {
        const peek = stack[stack.length - 1]
        if (peek.level === line.level) {
          // remove before connecting:
          const lastChoice = stack.pop()
          if (!lastChoice) {
            throw new Error(`Fatal. No choice.`)
          }
          if (lastChoice.level === line.level) {
            // connect lines:
            lastChoice.nextLineIndex = line.index
          }
        }
      }

      //and add the current choice to the stack:
      stack.push(line)
    }
    
    if (line.type === LineType.Gather) {
      // if a gather is met:
      // remove all choices from the stack
      // until a choice is met that
      // has a lower level

      while (stack.length) {
        const peek = stack[stack.length - 1]
        if (peek.level < line.level) {
          break
        }
        stack.pop()
      }
    }

  }
}


function addOrgCodeLineNo(lines: Line[], offset: number) {
  let i = -1
  for (const line of lines) {
    i++
    line.orgCodeLineNo = offset + i + 1
  }
}


function compileToLines(code: string, offset: number) : Line[] {
  const lines = codeToLines(code)

  if (lines[0].text.startsWith(".")) {
    // STUPID: see above:
    userCompilerError(`The very first line cannot start with a dot.`, lines[0])
  }

  addOrgCodeLineNo(lines, offset)
  addChoiceGatherInfo(lines)
  addLevelInfo(lines)
  markDeadEnds(lines)
  connectDeadEndsWithGathers(lines)
  connectChoicesWithEachOther(lines)
  processIfLines(lines)
  return lines
}


function processIfLines(lines: Line[]) {
  addIfInfo(lines)
  addIfNextLineInfo(lines)
  processIfCondExpressions(lines)
  excludeMultiElse(lines)
  ifCleanUp(lines)
}


function excludeMultiElse(lines: Line[]) {
  const ifStack = []
  for (const line of lines) {
    if (line.isIfCondition) {
      ifStack.push({elseCount: 0})
    } else if (line.isEnd) {
      ifStack.pop()
    } else if (line.isElse) {
      const lastIf = ifStack[ifStack.length - 1]
      if (!lastIf) {
        userCompilerError(`"else" not allowed outside if block.`, line)
      }
      lastIf.elseCount++
      if (lastIf.elseCount > 1) {
        userCompilerError(`Only one "else" per if block allowed.`, line)
      }
    }
  }
}


function processIfCondExpressions(lines: Line[]) {
  for (const line of lines) {
    if (line.isIfCondition) {
      line.ifProps = splitByOperator(line.text, line)
    }
  }
}


function splitByOperator(input: string, line: Line): 
    { left: string, operator: string, right: string } {

  const operators = [ //order matters here. composites first
    ">=", "<=",
    "<>", "!=",
    "<", ">", "=", 
  ]

  const operator = operators.find(op => input.includes(op))

  if (!operator) {
    userCompilerError("Expected = or > or similar.", line)
  }

  const occurrences = input.split(operator).length - 1
  if (occurrences !== 1) {
    userCompilerError("Only one operator like = or >= allowed.", line)
  }

  const index = input.indexOf(operator)
  const left = input.slice(0, index).trim()
  const right = input.slice(index + operator.length).trim()

  if (!isValidIfCondPart(left)) {
    userCompilerError(`${left}: expected a variable name or number.`, line)
  }

  if (!isValidIfCondPart(right)) {
    userCompilerError(`${right}: expected a variable name or number.`, line)
  }

  return { left, operator, right }
}


function isValidIfCondPart(str: string): boolean {
  return /^[A-Za-z0-9_\.\-]+$/.test(str)
}


function ifCleanUp(lines: Line[]) {
  for (const line of lines) {
    delete line.correspondingElseLine
  }
}


function addIfNextLineInfo(lines: Line[]) {
  const ifConditionsStack: Line[] = []
  for (const line of lines) {
    
    if (line.isIfCondition) {
      ifConditionsStack.push(line)

    } else if (line.isEnd) {
      const lastIfLine = ifConditionsStack.pop()
      if (!lastIfLine) {
        userCompilerError(`"end" not allowed outside if block.`, line)
      }
      if (lastIfLine.correspondingElseLine) {
        const elseLine = lastIfLine.correspondingElseLine
        elseLine.nextLineIndex = line.index

      } else {
        lastIfLine.nextLineIndex = line.index
      }

    } else if (line.isElse) {
      const lastIfLine = ifConditionsStack[ifConditionsStack.length - 1]
      if (!lastIfLine) {
        userCompilerError(`"else" not allowed outside if block.`, line)
      }
      // the next line index of an if-line is the next else or
      // if there is no next else, the next end:
      lastIfLine.nextLineIndex = line.index + 1
      lastIfLine.correspondingElseLine = line
    }
  }

  if (ifConditionsStack.length > 0) {
    userCompilerError(`Unclosed if. Expected end.`, ifConditionsStack[ifConditionsStack.length - 1])
  }

}


function addIfInfo(lines: Line[]) {
  for (const line of lines) {
    if (line.type === LineType.Undecided) {
      if (line.text.startsWith("if ")) {
        line.isIfCondition = true
        line.text = line.text.replace("if ", "").trim()
      } else if (line.text === "else") {
        line.isElse = true
      } else if (line.text === "end") {
        line.isEnd = true
      }
    }
  }
}


function stringToMetaData(str: string) {
  const lines = str.split("\n")
  const metaData: MetaData  = {}
  for (let line of lines) {
    line = line.trim()
    if (line === "") continue
    if (line.startsWith("#")) continue // comment
    let [first, rest] = getFirstWordAndRest(line)
    first = first.replace(":", "").trim()
    rest = rest.trim()
    metaData[first] = rest
  }
  return metaData
}


function extractMetaData(code: string): [MetaData, string, number, string] {
  if (!code.includes(MAGIC_STORY_STARTER)) {
    return [{}, code, 1, ""]
  }

  const [first, rest] = splitOnlyAtFirst(code, MAGIC_STORY_STARTER)

  const metaData = stringToMetaData(first)

  return [metaData, rest, countOccurrences(first, "\n"), first]
}


export type Kompilat = {
  lines: Line[],
  metaData: MetaData,
  metaDataOrg: string,
}


export function compilerSetOnError(onError: (text: string, line: Line) => void) {
  onErrorFunc = onError
}

export function compile(code: string) : Kompilat {

  const [metaData, rest, offset, metaDataOrg] = extractMetaData(code)

  const lines = compileToLines(rest, offset)

  return {
    metaData,
    lines,
    metaDataOrg,
  }
}
