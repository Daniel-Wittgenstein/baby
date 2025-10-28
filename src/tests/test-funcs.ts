
import { compilerSetOnError, compile } from "../compiler/compiler"

import { Runner } from "../runtime/runner"
import { ActionType } from "../runtime/runtimeTypes"


type VirtualChoice = {
  text: string,
  choiceIndex?: number,
}


type VirtualText = {
  text: string,
}


export function compileAndRun(
    code: string,
    behavior: {
      clickOn: string[],
      textAppears: string[],
      textDoesNotAppear: string[],
    }
) {

  function runUntilNoMoreContent() {
    let safety = 0

    while (true) {
      safety++
      if (safety >= 100_000) {
        throw new Error(`Test: endless loop?`)
      }
      const action = runner.processNextLine()
      
      if (action.type === ActionType.StoryFlowRunsOut) {
        return true
      }

      if (action.type === ActionType.EndOfTurn) {
        return false
      }

      if (action.type === ActionType.Choice) {
        currentChoices.push({
          text: action.text,
          choiceIndex: action.choiceIndex,
        })
      }

      if (action.type === ActionType.Text) {
        collectedTexts.push({
          text: action.text,
        })
      }

    }
  }

  // #####################################
  // #####################################
  // #####################################

  let currentChoices: VirtualChoice[] = []
  const collectedTexts: VirtualText[] = []

  const {clickOn, textAppears: appears, textDoesNotAppear: doesNotAppear} = behavior

  const res = compile(code)
  const runner = new Runner(res.lines, {
    onCheckIfCond: () => true
  })

  runner.restartStory()

  while (true) {

    currentChoices = []

    const storyCompleted = runUntilNoMoreContent()
    if (storyCompleted) {
      break
    }
    
    const clickOnText = clickOn.shift()
    if (!clickOnText) {
      break
    }

    const filteredChoices = currentChoices.filter(
      ch => ch.text.includes(clickOnText))

    if (filteredChoices.length !== 1) {
      throw new Error(`${filteredChoices.length} choices matched text "${clickOnText}"`)
    }

    const selectedChoice = filteredChoices[0]

    if (!selectedChoice.choiceIndex && selectedChoice.choiceIndex !== 0) {
      console.log("SELECTED CHOICE", selectedChoice)
      throw new Error(`Choice index is ${selectedChoice.choiceIndex}.`)
    }

    runner.chooseChoice(selectedChoice.choiceIndex)

  }

  // and finally, check the final result:

  for (const shouldAppear of appears) {
    if (!(collectedTexts.map(t => t.text)).includes(shouldAppear)) {
      throw new Error(`The text "${shouldAppear}" was never encountered, although it should.`)
    }
  }

  for (const shouldntAppear of doesNotAppear) {
    if ((collectedTexts.map(t => t.text)).includes(shouldntAppear)) {
      throw new Error(`The text "${shouldntAppear}" was encountered, although it shouldn't.`)
    }
  }

  return true
}

