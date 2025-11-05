
import { Command, TargetTable, CommandTable, ActionType } from "./runtimeTypes"
import { Line, LineType } from "../interopTypes"
import { extractLabelAndCommandInfo } from "./extractLabelAndCommandInfo"
import { Action } from "./runtimeTypes"
import { hasLabelStartText } from "./hasLabelStartText"
import { getFirstWordAndRest, removeFirstChar } from "./utils"

import { CustomCommand } from "./runtimeTypes"

import { Instruction } from "./runtimeTypes"

type ExecLineResult = {
  action: Action,
  nextLine: number,
  customInstructions?: Instruction[],
}


type RunnerCallbacks = {
  onCheckIfCond: (left: string, op: string, right: string) => boolean
}


export class Runner {

  #lines: Line[]
  #targetTable: TargetTable = {}
  #commandTable: CommandTable = []
  #linePointer: number = 0
  #currentChoices: Line[] = []
  #callbacks: RunnerCallbacks
  #customCommands: Record<string, CustomCommand>


  constructor(storyLines: Line[], callbacks: RunnerCallbacks, 
      customCommands: Record<string, CustomCommand>) {

    this.#lines = storyLines
    this.#customCommands = customCommands
    const { targetTable, commandTable } = extractLabelAndCommandInfo(this.#lines,
      this.#customCommands)
    this.#targetTable = targetTable
    this.#commandTable = commandTable
    this.#callbacks = callbacks
  }


  restartStory() {
    this.#linePointer = 0
    this.#currentChoices = []
  }


  processNextLine() : Action {
    if (this.#currentChoices.length > 0 && !this.#isNextLineAChoice()) {
      return {
        type: ActionType.EndOfTurn,
        text: "",
        lineNo: -1,
      }
    }

    const {action,  nextLine, customInstructions} = this.#execLine(this.#linePointer)
    console.log("dafuq", action , customInstructions)
    this.#linePointer = nextLine
    if (customInstructions) {
      action.customInstructions = customInstructions
    }
    return action
  }


  chooseChoice(index: number) {
    const choice = this.#currentChoices[index]
    if (!choice) {
      throw new Error(`Fatal: choice with index ${index} does not exist.`)
    }
    this.#currentChoices = []
    this.#linePointer = choice.index + 1
  }

  
  #checkIfCond(line: Line) {
    if (this.#callbacks.onCheckIfCond(
      line.ifProps.left,
      line.ifProps.operator,
      line.ifProps.right
    )) {
      return line.index + 1
    } else {
      return line.nextLineIndex
    }
  }


  #isNextLineAChoice() {
    return !!(this.#lines[this.#linePointer]?.type === LineType.Choice)
  }


  #execCommand(command: Command, index: number, line: Line) : ExecLineResult {

    const customCommand = this.#customCommands[command.name]

    if (customCommand?.onExec) {
    
      const parts = command.text.split(/\s-\s/).map(n => n.trim()).filter(Boolean)
      const result = customCommand.onExec(parts, command.text, command.name)

      let nextLine = index + 1

      if (result.target) {
        nextLine = this.#targetTable[result.target]
      }

      return {
        nextLine,
        action: {
          type: ActionType.Command,
          text: command.text,
          commandName: command.name,
          lineNo: line?.orgCodeLineNo,
        },
        customInstructions: result.do,
      }

    }

    // ##################################

    if (command.name === "goto") {
      const target = command.text.toLowerCase()
      const nextLine = this.#targetTable[target]
      return {
        nextLine,
        action: {
          type: ActionType.Nothing,
          text: "",
          lineNo: line?.orgCodeLineNo,
        }
      }
    }

    return {
      nextLine: index + 1,
      action: {
        type: ActionType.Command,
        text: command.text,
        commandName: command.name,
        lineNo: line?.orgCodeLineNo,
      }
    }

  }


  #execChoice(line: Line) {
    const result = {
      nextLine: line.nextLineIndex || line.index + 1,
      action: {
        type: ActionType.Choice,
        text: line.text,
        choiceIndex: this.#currentChoices.length,
        lineNo: line?.orgCodeLineNo,
      }
    }
    this.#currentChoices.push(line)
    return result
  }


  #execText(line: Line) {
    return {
      nextLine: line.nextLineIndex || line.index + 1,
      action: {
        type: ActionType.Text,
        text: line.text,
        lineNo: line?.orgCodeLineNo,
      }
    }
  }


  #execLine(index : number) : ExecLineResult {
    const line = this.#lines[index]
    if (!line) {
      return {
        nextLine: 0,
        action: {
          type: ActionType.StoryFlowRunsOut,
          text: "",
          lineNo: line?.orgCodeLineNo,
        }
      }
    }

    if (this.#commandTable[line.index]) {
      const res = this.#execCommand(this.#commandTable[line.index], line.index, line)
      console.log("MERDA????", res)
      return res
    }

    if (line.isEnd) {
      return {
        nextLine: line.index + 1,
        action: {
          type: ActionType.Nothing,
          text: "",
          lineNo: line?.orgCodeLineNo,
        }
      }
    }

    if (line.isElse) {
      return {
        nextLine: line.nextLineIndex,
        action: {
          type: ActionType.Nothing,
          text: "",
          lineNo: line?.orgCodeLineNo,
        }
      }
    }

    if (line.isIfCondition) {
      const nextLine = this.#checkIfCond(line)
      return {
        nextLine,
        action: {
          type: ActionType.Nothing,
          text: "",
          lineNo: line?.orgCodeLineNo,
        }
      }
    }

    if (line.type === LineType.Choice) {
      return this.#execChoice(line)
    }

    if (line.type === LineType.Gather) {
      //do nothing
      return {
        nextLine: line.index + 1,
        action: {
          type: ActionType.Nothing,
          text: "",
          lineNo: line?.orgCodeLineNo,
        }
      }
    }

    if (hasLabelStartText(removeFirstChar(line.text))) {
      return {
        nextLine: line.index + 1,
        action: {
          type: ActionType.Nothing,
          text: "",
          lineNo: line?.orgCodeLineNo,
        }
      }
    }
    return this.#execText(line)


  }


}