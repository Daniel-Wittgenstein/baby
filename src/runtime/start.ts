
import { loadUserSettings } from "./loadUserSettings"

import { Runner } from "./runner"
import { AbstractRenderEl, AbstractRenderElType, ActionType,
  AbstractRenderChoice, AbstractRenderText, Action, 
  Instruction} from "./runtimeTypes"
import { Scheduler } from "./scheduler"

import { customConfirm } from "./confirm"

import { getRndInt } from "./randomFuncs"

import i18n from "./i18n"

import { CustomCommand } from "./runtimeTypes"

import { userError } from "./userError"
import { setColors, switchTheme, Theme } from "./setColors"

import icons from "./icons"
import { getFirstWordAndRest } from "./utils"

import { arithmeticCommands, ArithmeticFunc } from "./arithmetic"

// "$__$story" window property exists because we inject it directly
// into the generated HTML. it holds the story data
// that the compiler spat out:
const story : any = (window as any).$__$story

// we do not want to modify lines after the compiler created them,
// so things are easier to understand:
for (const storyLine of story.kompilat.lines) {
  Object.freeze(storyLine)
}

document.addEventListener("DOMContentLoaded", startApp)

let settings = null

let runner: Runner

let scheduler: Scheduler

let main: HTMLElement

let animations: boolean = true

let menuOpen = false

let menu: HTMLElement

let customCommands: Record<string, CustomCommand> = {}

type StoryState = {
  varMap: Record<string, any>
}

let storyState: StoryState

let hamburgerImg

function initTopBar() {
  const topBar = document.getElementById("top-box")
  const button = document.createElement("button")
  const img = document.createElement("img")
  button.classList.add("menu-button")
  img.alt = "menu"
  img.src = icons.hamburger
  hamburgerImg = img
  button.append(img)
  topBar.append(button)
  button.addEventListener("click", toggleMenu)
  menu = document.createElement("div")
  menu.classList.add("menu")
  document.body.append(menu)
  menu.innerHTML = `
    <button id="menu-restart">Restart</button>
    <button id="menu-anims">Animations On</button>
    <button id="menu-theme">Light</button>
  `
  
  document.getElementById("menu-restart").addEventListener("click", () => {
    requestRestart()
  })

  document.getElementById("menu-anims").addEventListener("click", () => {
    toggleAnims()
  })

  document.getElementById("menu-theme").addEventListener("click", () => {
    switchTheme()
  })

}


function requestRestart() {
  customConfirm(i18n.rlyRestartTitle, i18n.rlyRestartText,
    i18n.rlyRestartOk, i18n.rlyRestartCancel,
    () => {actuallyRestart()}, () => {}
  )
}


function actuallyRestart() {
  toggleMenu()
  restartStoryFromScratch()
}


function toggleAnims() {
  animations = !animations
  if (animations) {
    enableAnims()
  } else {
    disableAnims()
  }
}

function setHamburgerMenuImg(iconImg) {
  hamburgerImg.src = iconImg
}


function toggleMenu() {
  const cssClass = "menu-out"
  menuOpen = !menuOpen
  if (menuOpen) {
    setHamburgerMenuImg(icons.close)
    menu.style.display = "flex"
    menu.classList.remove(cssClass)

  } else {

    setHamburgerMenuImg(icons.hamburger)
    if (animations === false) {
      menu.style.display = "none"
      menu.classList.remove(cssClass)
      return
    }

    menu.classList.add(cssClass)
    menu.addEventListener("transitionend", () => {
      if (menu.classList.contains(cssClass)) {
        menu.style.display = "none"
      }
    }, { once: true })
  }
}


function startApp() {

  const isExported = (window as any).$__$isExportedStory

  initTopBar()

  const metaData = story.kompilat.metaData || {}

  settings = loadUserSettings()

  setColors(metaData.color, metaData.theme, settings.theme)

  if (metaData["debugfast"] === "yes" && !isExported) {
    disableAnims()
  } else {
    enableAnims()
  }

  const el = document.getElementById("app")
  if (!el) throw new Error("DOM element with id #app not found.")
  main = el

  main = document.getElementById("main")

  initClickHandler()

  const babyApi = createBabyApi()

  if ((window as any).$_onStartApp) {
    // optional custom hook for story author:
    // run this function at app start
    // custom commands get created here:
    if (typeof (window as any).$_onStartApp === "function") {
      ;(window as any).$_onStartApp(babyApi)
    }
  }

  runner = new Runner(story.kompilat.lines, {onCheckIfCond}, customCommands)

  scheduler = new Scheduler(50)

  restartStoryFromScratch()

}


function createCommand(command: CustomCommand) {
  if (!(typeof command.name === "string") || command.name === "") {
    userError(`Commands need a name. ` +
      `"${command.name}" is not a valid name.`, -1)
  }

  customCommands[command.name] = command  
}


function createBabyApi() {
  const baby = {
    name: "Baby API",
    command: createCommand,
    set: varSetValue,
    get: varGetValue,
    roll: getRndInt,
  }
  return baby
}


function restartStoryFromScratch() {
  main.innerHTML = ""
  resetStoryState()
  runner.restartStory()
  takeTurn(null, true)
}


function initClickHandler() {
  document.body.addEventListener('click', e => {
    const el = e.target as HTMLButtonElement
    if (!el.classList.contains('choice')) return
    const index = Number(el.dataset.index)
    if (Number.isNaN(index)) {
      throw new Error('Fatal: choice: non-numeric index')
    }
    clickOnChoice(index, el)
  })
}


function endTheStory() {
  console.log("Story ended.")
}

function clickOnChoice(index: number, choiceButton: HTMLButtonElement) {
  runner.chooseChoice(index)
  takeTurn(choiceButton, false)
}


function dispatchText(el: AbstractRenderEl) {
  const par = document.createElement('p')
  par.classList.add("story-paragraph")
  main.appendChild(par)
  par.innerHTML = el.text
}


function dispatchChoice(el: AbstractRenderEl) {
  const choice = el as AbstractRenderChoice
  const buttonPar = document.createElement('p')
  buttonPar.classList.add("choice-wrapper")
  if (choice.index === 0) {
    // because CSS is garbage and screw CSS selectors:
    buttonPar.classList.add("choice-wrapper-first")
  }
  buttonPar.innerHTML = `
      <button data-index="${choice.index}"
        class="choice"
      >
        ${choice.text}
      </button>`
  main.appendChild(buttonPar)
}


function mergeLinesIntoParagraphs(els: AbstractRenderEl[]) : AbstractRenderEl[] {
  const nuEls = []
  let currentPar = null
  let insidePar = false
  for (const el of els) {
    if (el.type === AbstractRenderElType.Text) {
      
      if (el.text === "") {

        insidePar = false

      } else {
        if (insidePar) {
          // add to current paragraph:
          currentPar.text += el.text + " "
        } else {
          // start new paragraph:
          insidePar = true
          currentPar = {
            type: AbstractRenderElType.Text,
            text: el.text + " ",
          }
          nuEls.push(currentPar)
        }
      }

    } else {
      nuEls.push(el)
    }
  }
  return nuEls
}


function disableAnims() {
  document.body.classList.add('no-anims')
  animations = false
  document.getElementById("menu-anims").innerHTML = i18n.animsOff
}


function enableAnims() {
  document.body.classList.remove('no-anims')
  animations = true
  document.getElementById("menu-anims").innerHTML = i18n.animsOn
}


function takeTurn(choiceButton: HTMLButtonElement | null, firstTurn: boolean) : void {
  let els = callRunnerUntilNoMoreContent()
  els = removeSomeEmptyLines(els)
  const els2 = mergeLinesIntoParagraphs(els)

  // now we render:

  if (!firstTurn && animations) {

    const others = Array.from(main.children).filter(
      (el: HTMLElement) => !el.children[0]?.classList.contains('choice'));

    for (const other of Array.from(others)) {
      ;(other as HTMLElement).classList.add("non-choice-out")
    }

    const choices = document.querySelectorAll(".choice")
    for (const ch of Array.from(choices)) {
      const choice = ch as HTMLButtonElement 
      choice.disabled = true
      const cls = choiceButton === choice ? "selected-choice" : "discarded-choice"
      choice.classList.add(cls)
    }

    // wait a bit until transitions are finished, then flush the div:

    scheduler.addToQueue(() => {
      main.innerHTML = ""
    }, 700)
  }

  if (!animations) {
    main.innerHTML = ""
  }

  // and only now add new elements:

  let i = -1
  for (const el of els2) {
    i++

    if (el.type === AbstractRenderElType.Text) {
      if (el.text === "") continue
      const func = () => dispatchText(el)
      if (animations) {
        scheduler.addToQueue(func, i === 0 ? 0 : 200)
      } else {
        func()
      }
    } else if (el.type === AbstractRenderElType.Choice) {
      const func = () => dispatchChoice(el)
      if (animations) {
        scheduler.addToQueue(func, i === 0 ? 0 : 200)
      } else {
        func()
      }
    }
  }
}


function removeSomeEmptyLines(els: AbstractRenderEl[]) {
  // remove empty lines from start and end, and transform multiple empty lines
  // into a single empty line
  const nuEls : AbstractRenderEl[] = []
  let prevLineWasEmpty = false
  let firstNonEmptyLineEncountered = false

  // remove empty lines at beginning and duplicate empty lines:
  for (const el of els) {
    if (el.type === AbstractRenderElType.Text && el.text === "") {
      //line is empty:
      if (!firstNonEmptyLineEncountered) continue
      if (prevLineWasEmpty) continue
      prevLineWasEmpty = true
      nuEls.push(el)
    } else {
      //line is non-empty:
      firstNonEmptyLineEncountered = true
      prevLineWasEmpty = false
      nuEls.push(el)
    }
  }

  // and now remove empty lines at the end: (doesn't even work?)
  while(true) {
    const last = nuEls[nuEls.length - 1]
    if (!last) break
    if (last.type === AbstractRenderElType.Text && last.text === "") {
      nuEls.pop()
    } else {
      break
    }
  }

  return nuEls
}


function dispatchArithmetic(action: Action, arithFunc: ArithmeticFunc) {
  const text = action.text
  const lineNo = action.lineNo
  let [varName, rest] = getFirstWordAndRest(text)
  rest = rest.trim()
  if (isFiniteNumber(rest)) {
    dispatchVarEventArithmetic(varName, Number(rest), action.lineNo, arithFunc)
    return
  }
  if (rest.startsWith('"')) {
    if (!rest.endsWith('"')) {
      userError(`Text string must end with "`, action.lineNo)
    }
    rest = rest.substring(1, rest.length - 1)
    dispatchVarEventArithmetic(varName, rest, action.lineNo, arithFunc)
    return
  }
  dispatchVarEventArithmetic(varName, varGetValue(rest),
    action.lineNo, arithFunc)
}


function getVarOrNumberVal(str: string) {
  if (isFiniteNumber(str)) return Number(str)
  return varGetValue(str)
}


function onCheckIfCond(left: string, operator: string, right: string) {
  let leftE = getVarOrNumberVal(left)
  let rightE = getVarOrNumberVal(right)
  if (operator === "=") return leftE === rightE
  if (operator === ">") return leftE > rightE
  if (operator === "<") return leftE < rightE
  if (operator === ">=") return leftE >= rightE
  if (operator === "<=") return leftE <= rightE
  if (operator === "!=" || operator === "<>") return leftE !== rightE
  throw new Error(`Invalid operator. Should not happen.`)
}


function resetStoryState() {
  storyState = {
    varMap: {},
  }
}


function varGetValue(varName: string) {
  varName = varName.toLowerCase()
  const val = storyState.varMap[varName]
  return val
}


function varSetValue(varName: string, newVal: any, lineNo: number) {
  varName = varName.toLowerCase()
  storyState.varMap[varName] = newVal
  console.log(`I SET VAR ${varName} to ${newVal}`)
}


function dispatchVarEventArithmetic(varName: string, val: any, lineNo: number,
    arithFunc: ArithmeticFunc) {
  const oldValue = varGetValue(varName)
  const result = arithFunc(oldValue, val)
  varSetValue(varName, result, lineNo)
}


function isFiniteNumber(value: string): boolean {
  const num = Number(value)
  return Number.isFinite(num)
}


function dispatchCommand(action: Action) : ActionType | null {

  if (arithmeticCommands[action.commandName]) {
    dispatchArithmetic(action, arithmeticCommands[action.commandName])
    return
  }

  if (action.commandName === "quit") {
    return ActionType.EndOfStory
  }

}


function execCustomInstructions(instructions: Instruction[], 
    addEl: (el: AbstractRenderEl) => void) {

  for (const instr of instructions) {
    console.log("perform instruction:", instr)
    const action = instr.action
    
    if (action === "js") {
      instr?.run()

    } else if (action === "text") {
      addEl({
        type: AbstractRenderElType.Text,
        text: instr.text,
      })
    }

  }
}



function callRunnerUntilNoMoreContent() {

  function addEl(el: AbstractRenderEl) {
    els.push(el)
  }

  let safeGuard = 0
  const els: AbstractRenderEl[] = []

  while (true) {
    safeGuard++
    if (safeGuard >= 20_000) {
      userError("Endless loop?", -1)
    }
    const action = runner.processNextLine()

    if (action.type === ActionType.EndOfTurn) {
      break
    }

    if (action.type === ActionType.StoryFlowRunsOut) {
      console.log("Reached end of script")
      endTheStory()
      break
    }

    if (action.type === ActionType.Nothing) {
      continue
    }

    if (action.type === ActionType.Command) {

      if (action.customInstructions) {
        execCustomInstructions(action.customInstructions, addEl)
        continue
      }

      const result = dispatchCommand(action)
      if (result === ActionType.EndOfStory) {
        endTheStory()
        break
      }
      continue
    }

    if (action.type === ActionType.Choice) {
      addEl({
        type: AbstractRenderElType.Choice,
        text: action.text,
        index: action.choiceIndex as number,
      })
      continue
    }

    if (action.type === ActionType.Text) {
      addEl({
        type: AbstractRenderElType.Text,
        text: action.text,
      })
      continue
    }

  }

  return els

}

