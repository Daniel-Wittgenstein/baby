
import { isSmallScreen } from "./environmentDetection"

import { MAGIC_STORY_STARTER } from "../interopLang"

import { compile, Kompilat, compilerSetOnError } from "../compiler/compiler"
import { Line, LineType } from "../interopTypes"
import { downloadFile, escapeHtml } from "../interopUtils"
import { notify } from "./notify"
import { generateDemoCode } from "./generateDemoCode"

import { isChromeMobile } from "./detectChrome"

import { constructLayoutSmall } from "./constructLayoutSmall"

import { CodeJar } from "../../node_modules/codejar/dist/codejar"

import { highlight } from "./syntaxHighlight"

import { debounce } from "./debounce"

const SAVE_KEY = "BuffySummers"
const MAGIC_PROJECT_SAVE_STATE_KEY = "§_%&" as const

const debug = {
  showCompilationResult: true,
}

const PREVIEW_DELAY = 300

let smallMode = false

let codeJar

let leftPane: any
let rightPane: any
let paneSwitcher: any
let iframe: any
let moreMenu: any

let runtimeData: any


document.addEventListener("DOMContentLoaded", () => {

  if (isSmallScreen()) {
    constructLayoutSmall()
  } else {
    console.warn(`Big screen, but big layout is not supported yet. Defaulting to small layout for now.`)
    constructLayoutSmall()
  }

  constructMoreMenu()

  initCodeEditor()

  initHandlersForSmallScreenView()

  iframe = document.getElementById("iframe-preview")

  initGotoErrorButtons()

  compilerSetOnError(onStoryError)

  runtimeData = (window as any).$__$runtimeData
  if (!runtimeData) {
    const msg = "Fatal. Runtime data could not be loaded."
    alert(msg)
    document.body.innerHTML = msg
    return
  }

  const success = loadProjectFromLocalStorage()
  if (success) {
    //todo: reenable. temporarily disabled bc pisses me off while testing.
    //cannot see errors immediately bc they are shown below tooltip
    //notify("Loaded last project from browser local storage.", "notification", true)
  }
  

  updatePreview()


  document.getElementById("save")?.addEventListener("click", () => {
    autoIndent() //yes, we enforce this
    saveProjectToLocalStorage()
    notify("Saved to browser local storage!")
  })


  document.getElementById("load-from-disk")?.addEventListener("click", () => {
    loadProjectFromFile()
  })


  document.getElementById("save-to-disk")?.addEventListener("click", () => {
    downloadProjectSaveFile()
  })


  document.getElementById("export-story")?.addEventListener("click", () => {
    exportStory()
    if (isChromeMobile()) {
      setTimeout(() => {
        const info = `Hint: If Chrome mobile asks you whether you want to keep the file, click <b>Keep</b>.`
        notify(info, "notification", 7000)
      }, 2000)
    }
  })


})


function initHandlersForSmallScreenView() {
  const buttonPlay = document.getElementById("sm_play")
  const buttonEdit = document.getElementById("sm_edit")
  // buttons do not exist, so we are not in small view and they do
  // not matter, so just return:
  if (!buttonPlay) return
  buttonPlay.addEventListener("click", switchToPlayView)
  buttonEdit.addEventListener("click", switchToEditView)
  switchToEditView()
}


function switchToPlayView() {
  const buttonPlay = document.getElementById("sm_play")
  const buttonEdit = document.getElementById("sm_edit")
  const code = document.getElementById("sm_code-wrapper")
  const play = document.getElementById("sm_play-wrapper")

  buttonEdit.style.display = "block"
  buttonPlay.style.display = "none"
  code.style.display = "none"
  play.style.display = "block"
}


function switchToEditView() {
  const buttonPlay = document.getElementById("sm_play")
  const buttonEdit = document.getElementById("sm_edit")
  const code = document.getElementById("sm_code-wrapper")
  const play = document.getElementById("sm_play-wrapper")

  buttonEdit.style.display = "none"
  buttonPlay.style.display = "block"
  code.style.display = "block"
  play.style.display = "none"
}


function initMoreMenu() {
  moreMenu = document.getElementById("more-menu")

  document.getElementById("close-more-menu")?.addEventListener("click", () => {
    closeMoreMenu()
  })

  document.getElementById("more-menu-button")?.addEventListener("click", () => {
    openMoreMenu()
  })
}


function constructMoreMenu() {
  const el = document.createElement("div")
  el.id = "more-menu"
  el.innerHTML = `
    <div id="more-menu-top">
      <button id="close-more-menu" class="hamclose">✖</button>
    </div>
    
    <div id="more-menu-main">
      <button id="load-from-disk">Load Project from Device</button>
      <button id="save-to-disk">Save Project to Device</button>
      <button id="export-story">Export Story</button>
    </div>
  `
  document.body.append(el)
  initMoreMenu()
  closeMoreMenu()
}


function openMoreMenu() {
  moreMenu.style.display = "flex"
}


function closeMoreMenu() {
  moreMenu.style.display = "none"
}




function initGotoErrorButtons() {
  document.addEventListener("click", e => {
    const target = e.target as HTMLElement
    if (!target) return

    if (target.classList.contains("goto-error")) {
      const indexAttr = target.getAttribute("data-index")
      if (!indexAttr) return

      const lineNo = Number(indexAttr)
      if (isNaN(lineNo)) return

      scrollLineIntoView(lineNo)
    }
  })
}


function initCodeEditor() {
  const code = generateDemoCode()
  const editor = document.querySelector('#code-editor') as HTMLElement
  codeJar = CodeJar(editor, highlight, {tab: ""})
  codeJarSet(code)
  const debounced = debounce(updatePreview, PREVIEW_DELAY)
  codeJar.onUpdate(() => {
    debounced()
  })
}


function scrollLineIntoView(lineNo: number) {
  const editor = document.querySelector('#code-editor') as HTMLElement
  const lines = editor.querySelectorAll(".line")
  if (lineNo < 1 || lineNo > lines.length) return
  const line = lines[lineNo - 1] as HTMLElement
  line.scrollIntoView({ behavior: "auto", block: "start" })
}


function codeJarAddError(lineNo: number, text: string) {
  const editor = document.querySelector('#code-editor') as HTMLElement
  const lines = editor.querySelectorAll(".line")
  if (lineNo <= 0 || lineNo > lines.length) return
  const line = lines[lineNo - 1] as HTMLElement
  line.classList.add("error-line")
  line.setAttribute("data-error", text)
}


function codeJarClearErrors() {
  const editor = document.querySelector('#code-editor') as HTMLElement
  const errorLines = editor.querySelectorAll(".line.error")
  errorLines.forEach(line => {
    line.classList.remove("error")
    line.removeAttribute("data-error")
  })
}


function onStoryError(text: string, line: Line) {
  codeJarAddError(line.orgCodeLineNo, text)
  document.getElementById("error-displayer").innerHTML = 
    text + `<button class="goto-error" 
    data-index="${line.orgCodeLineNo}">GO TO ERROR</button>`
}


function clearErrors() {
  codeJarClearErrors()
  document.getElementById("error-displayer").innerText = ""
}


function autoIndent() {
  const code = codeJarGet()
  if (!code) return ""

  let nu = ""
  const indentBy = 2

  const res = compileTheCode(code)
  if (!res.success) {
    console.log("auto-indent failed. compiler error.")
    return
  }
  const kompilat = res.kompilat

  let ifIndent = 0
  for (const line of kompilat.lines) {
    if (line.isEnd) ifIndent--
    
    nu += " ".repeat((line.level - 1 + ifIndent
      + (line.isElse ? -1 : 0)
    ) * indentBy) + line.orgText.trim() + "\n"

    if (line.isIfCondition) ifIndent++

  }

  nu = kompilat.metaDataOrg + MAGIC_STORY_STARTER + nu

  codeJarSet(nu)
}


function downloadProjectSaveFile() {
  const state = getProjectState()
  try {
    const json = JSON.stringify(state)
    // use .json as file ending, otherwise inconsistent handling by browsers
    downloadFile(json, "project-save-file.json", "application/json")
  } catch(e) {
    notify("Failed downloading file.", "error")
    return
  }
  if (isChromeMobile()) {
    setTimeout(() => {
      const info = `Hint: if Chrome mobile shows an annoying notification, try
      closing it by <b>tapping on it and swiping up</b>.`
      notify(info, "notification", 7000)
    }, 2000)
  }
}


function loadProjectFromFile() {
  readJsonFile((data: any) => {
    if (!isProjectState(data)) {
      notify(`Not a valid project save file?`, "error")
      return
    }
    setProjectState(data)
    notify(`Loaded project from save file.`)
    closeMoreMenu()
  })
}


function readJsonFile(onSuccess: (data: any) => void) : void {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = () => {
    try {
      const file = input.files?.[0]
      if (!file) {
        notify("No file selected.", "error")
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string)
          onSuccess(data)
        } catch (e) {
          notify("Not a valid JSON file?", "error")
        }
      }
      reader.readAsText(file)
    } catch (e) {
      console.error(e)
    }
  }
  input.click()
}


function saveProjectToLocalStorage() {
  const state = getProjectState()
  const str = JSON.stringify(state)
  try {
    localStorage.setItem(SAVE_KEY, str)
  } catch (e) {
    console.error('Failed to save', e)
    notify("Could not save to local storage.", "error")
    return
  }
}


function loadProjectFromLocalStorage() {
  const str = localStorage.getItem(SAVE_KEY)
  if (!str) return false
  let state = null
  try {
    state = JSON.parse(str)
  } catch(e) {
    return false
  }
  setProjectState(state)
  return true
}


type ProjectState = {
  code: string,
  magicKey: typeof MAGIC_PROJECT_SAVE_STATE_KEY,
}


function isProjectState(obj: any) {
  // after JSON-parsing a file, we can end up
  // with an object with pretty much any properties,
  // so we need some way to make sure it's actually a project save state:
  return obj.magicKey === MAGIC_PROJECT_SAVE_STATE_KEY
}


function setProjectState(state: ProjectState) {
  codeJarSet(state.code)
}


function getProjectState(): ProjectState {
  const code = codeJarGet()
  return {
    code,
    magicKey: MAGIC_PROJECT_SAVE_STATE_KEY,
  }
}


function toggleDebugPanel() {
  const el = document.getElementById("debug-compilation-result")
  if (!el) return
  el.style.display = el.style.display === 'none' ? '' : 'none'
}




function codeJarSet(newContent: string) {
  codeJar.updateCode(newContent)
}


function codeJarGet() {
  return codeJar.toString()
}

function populateCompilationResult(kompilat: Kompilat) {

  function print(text: string, className: string) {
    txt += `<p class="debug-${className}">${text}</p>`
  }

  function renderLine(line: Line) {
    if (line.text.trim() === "" && line.nextLineIndex === 0) {
      // empty line, not that interesting, do not show it for debugging purposes:
      return
    }
    let indent = "&nbsp;".repeat((line.level - 1) * 4 + 1)
    const next = line.nextLineIndex === 0 ? "" : "-> " + kompilat.lines[line.nextLineIndex].text
    let text = `${line.orgCodeLineNo}${indent}${line.text} ${next}`
    let cls = ""
    if (line.type === LineType.Choice) cls = "choice"
    if (line.type === LineType.Gather) cls = "gather"
    print(text, cls)
  }

  const el = document.getElementById("debug-compilation-result")
  if (!el) return
  let txt = ""

  for (const line of kompilat.lines) {
    renderLine(line)
  }

  el.innerHTML = txt
}


function updatePreview() {
  clearErrors()
  const html = generateHtmlPage()
  injectIntoIframe(html)
}


function exportStory() {
  try {
    const html = generateHtmlPage(true)
    downloadFile(html, "index.html", "text/html")
  } catch(e) {
    notify("Failed exporting.", "error")
    return
  }
}


function compileTheCode(code: string) {
  let kompilat: Kompilat
  try {
    kompilat = compile(code)
  } catch {
    return {
      success: false,
    }
  }
  return {
    success: true,
    kompilat,
  }
}


function generateHtmlPage(exported: boolean = false) {

  const code = codeJarGet()
  if (!code) return ""

  const res = compileTheCode(code)
  if (!res.success) return "Error"
  const kompilat = res.kompilat

  if (debug.showCompilationResult) {
    populateCompilationResult(kompilat)
  }

  const story = {
    kompilat,
  }

  const exportedCode = exported ? "window.$__$isExportedStory = true" : ""

  const ifIdLine = kompilat.metaData.ifid ? `<meta property="ifiction:ifid" content="${kompilat.metaData.ifid}">` : ""

  let html: string = runtimeData.files["index.html"]
  html = html.replace("</body>",
    `
      <script>${exportedCode}</script>
      <script>window.$__$story = ${JSON.stringify(story)};</script>
      <script>${runtimeData.code}</script>
      </body>
    `).replace("</head>", 
    `
      <style>${runtimeData.files["resets.css"]}</style>
      <style>${runtimeData.files["confirm.css"]}</style>
      <style>${runtimeData.files["animation-killer.css"]}</style>
      <style>${runtimeData.files["style.css"]}</style>
      </head>
    `).replace("<head>", 
    `
      <head>
        <title>${escapeHtml(kompilat.metaData.title || "")}</title>
        <meta name="author" content="${escapeHtml(kompilat.metaData.author || "")}">
        ${ifIdLine}
    `)
  return html
}


function injectIntoIframe(html: string) {
  iframe.srcdoc = html
}