
import { isSmallScreen } from "./environmentDetection"

import { MAGIC_STORY_STARTER } from "../interopLang"

import { generateDemoJsCode } from "./generateDemoJsCode"

import { createSwipeDrawer } from "./createSwipeDrawer"

import { compile, Kompilat, compilerSetOnError } from "../compiler/compiler"
import { Line, LineType } from "../interopTypes"
import { downloadFile, escapeHtml } from "../interopUtils"
import { notify } from "./notify"
import { generateDemoCode } from "./generateDemoCode"

import { getTimestampForFileName, sanitizeCurrentProjectNameForFileName }
  from "./fileNameHandling"

import { isChromeMobile } from "./detectChrome"

import { constructLayoutSmall } from "./constructLayoutSmall"

import { CodeJar } from "../../node_modules/codejar/dist/codejar"
import { highlight } from "./syntaxHighlight"

// prism uses an outdated module system, so that's why these imports look
// weird, although they are correct:
// @ts-ignore
import Prism from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/themes/prism.css"
import "prismjs/components/prism-css"

import { debounce } from "./debounce"

const SAVE_KEY = "BuffySummers"
const MAGIC_PROJECT_SAVE_STATE_KEY = "§_%&" as const

const debug = {
  showCompilationResult: true,
}

const PREVIEW_DELAY = 300

let smallMode = false

let currentProjectName: string = ""

let codeJar, codeJarJs, codeJarCss

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

  initJsEditor()

  initCssEditor()

  ;(window as any).$_onErrorFromIFrame = $_onErrorFromIFrame

  initHandlersForSmallScreenView()

  iframe = document.getElementById("iframe-preview")

  initGotoErrorButtons()

  compilerSetOnError(onCompilerError)

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

  const drawerContent = document.createElement("div")
  drawerContent.innerHTML = "fuck you"
  drawerContent.classList.add("drawer-content")
  document.body.append(drawerContent)
  
  createSwipeDrawer(document.querySelector("#app"), drawerContent, () => {
    //codeJar.editor.blur()
  })

  //// selectTab("sm_js") // testing

})


function $_onErrorFromIFrame(text: string, lineNo: number) {
  onStoryError(text, lineNo)
}


function initHandlersForSmallScreenView() {
  const buttonPlay = document.getElementById("sm_play")
  const buttonEdit = document.getElementById("sm_write")
  const buttonHelp = document.getElementById("sm_help")
  const buttonCss = document.getElementById("sm_css")
  const buttonJs = document.getElementById("sm_js")
  // buttons do not exist, so we are not in small view and they do
  // not matter, so just return:
  if (!buttonPlay) return
  buttonPlay.addEventListener("click", switchToPlayView)
  buttonEdit.addEventListener("click", switchToEditView)
  buttonHelp.addEventListener("click", switchToHelpView)
  buttonCss.addEventListener("click", switchToCssView)
  buttonJs.addEventListener("click", switchToJsView)
  switchToEditView()
}


function switchToHelpView() {
  selectTab("sm_help")
}


function switchToCssView() {
  selectTab("sm_css")
}


function switchToJsView() {
  selectTab("sm_js")
}


function switchToPlayView() {
  selectTab("sm_play")
}


function switchToEditView() {
  selectTab("sm_write")
}

function selectTab(id: string) {
  const el = document.getElementById(id)
  document.querySelectorAll(".tab").forEach(el => el.classList.remove("tab-selected"))
  el.classList.add("tab-selected")

  document.querySelectorAll(".sm_tab-area").forEach(
    el => (el as HTMLElement).style.display = "none")

  const acc = ".sm_tab-area-" + id.replace("sm_", "")
  ;(document.querySelector(acc) as HTMLElement).style.display = "block"
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



function initJsEditor() {

  const editor = document.querySelector('#js-editor') as HTMLElement
  editor.classList.add("language-javascript")

  const highlight = (element: HTMLElement) => {
    Prism.highlightElement(element);
  }

  const codeJar = CodeJar(editor, highlight, {tab: "  "})

  codeJar.updateCode(generateDemoJsCode())

  codeJarJs = codeJar

  const debounced = debounce(updatePreview, PREVIEW_DELAY)
  codeJar.onUpdate(() => {
    debounced()
  })

}

function initCssEditor() {

  const editor = document.querySelector('#css-editor') as HTMLElement
  editor.classList.add("language-css")

  const highlight = (element: HTMLElement) => {
    Prism.highlightElement(element);
  }

  const codeJar = CodeJar(editor, highlight, {tab: "  "})

  codeJar.updateCode(`

/* CUSTOM CSS GOES HERE: */

body {
  /* ... */
}


  `)

  codeJarCss = codeJar

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


function onCompilerError(text: string, line: Line) {
  onStoryError(text, line.orgCodeLineNo)
}


function onStoryError(text: string, lineNo: number) {
  codeJarAddError(lineNo, text)
  document.getElementById("error-displayer").innerHTML = 
    text + `<button class="goto-error" 
    data-index="${lineNo}">GO TO ERROR</button>`
  
  document.getElementById("error-displayer").style.display = "flex"
}


function clearErrors() {
  codeJarClearErrors()
  document.getElementById("error-displayer").innerText = ""
  document.getElementById("error-displayer").style.display = "none"
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
  let name = sanitizeCurrentProjectNameForFileName(currentProjectName)
  if (!name) {
    name = "my-project" //fallback file name
  }

  const date = getTimestampForFileName()

  const suggestedFileName = name + "-" + date + ".json"
  let fileName = prompt("Enter file name", suggestedFileName)
  if (fileName === null) {
    return
  }

  if (!fileName) fileName = suggestedFileName

  try {
    const json = JSON.stringify(state)
    // use .json as file ending, otherwise inconsistent handling by browsers
    downloadFile(json, fileName, "application/json")
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
  name: string,
  code: string,
  js: string,
  css: string,
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
  codeJarJs.updateCode(state.js)
  codeJarCss.updateCode(state.css)
}


function getProjectState(): ProjectState {
  const code = codeJarGet()
  const js = codeJarJs.toString()
  const css = codeJarCss.toString()
  return {
    name: currentProjectName,
    code,
    js,
    css,
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
  const res = generateHtmlPage()
  if (res === "Error" || typeof res === "string") { // second check is for the typechecker
    console.warn(`Could not generate HTML page.`)
    return
  }

  const meta = res.metaData || {}
  currentProjectName = meta.title || ""
  
  injectIntoIframe(res.html)
}


function exportStory() {
  try {
    const res = generateHtmlPage(true)
    if (res === "Error" || typeof res === "string") { // second check is for the typechecker
      throw(`Could not generate HTML page.`)
    }
    downloadFile(res.html, "index.html", "text/html")
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

  const customAuthorCss = codeJarCss.toString() 

  const customAuthorJs = codeJarJs.toString()

  let html: string = runtimeData.files["index.html"]
  html = html.replace("</body>",
    `
      <script>${exportedCode}</script>
      <script>window.$__$story = ${JSON.stringify(story)};</script>
      <script>${runtimeData.code}</script>
      <script>${customAuthorJs}</script>
      </body>
    `).replace("</head>", 
    `
      <style>${runtimeData.files["resets.css"]}</style>
      <style>${runtimeData.files["confirm.css"]}</style>
      <style>${runtimeData.files["animation-killer.css"]}</style>
      <style>${runtimeData.files["style.css"]}</style>

      <style>${customAuthorCss}</style>
      </head>
    `).replace("<head>", 
    `
      <head>
        <title>${escapeHtml(kompilat.metaData.title || "")}</title>
        <meta name="author" content="${escapeHtml(kompilat.metaData.author || "")}">
        ${ifIdLine}
    `)
  return {
    html,
    metaData: kompilat.metaData,
  }
}


function injectIntoIframe(html: string) {
  iframe.srcdoc = html
}