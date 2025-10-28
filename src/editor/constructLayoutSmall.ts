
import { appRunsInsideIframe } from "./environmentDetection"

import { fixHeader } from "./fixHeader"

let parent

export function constructLayoutSmall() {
  parent = document.getElementById("app")

  if (!parent) {
    throw new Error(`Cannot start. No #app element.`)
  }

  constructIt()

  fixHeader()
}


function constructIt() {
  const html = `
    <div id="sm_top">
      
      <div id="error-displayer"></div>

      <div id="sm_top-button-wrapper">
        <button id="sm_play">Play</button>
        <button id="sm_edit">Edit</button>
        <button id="save">Save</button>
      </div>

      <div>
        <button id="more-menu-button" class="hamclose">☰</button>
      </div>
    </div>
    
    <div id="sm_main">

      <div id="sm_code-wrapper">

        <div id="code-editor"
          contenteditable="true" autocapitalize="off"
          spellcheck="false">
        </div>

      </div>
      
      <div id="sm_play-wrapper">
        <iframe id="iframe-preview"></iframe>
      </div>

    </div>
  `
  parent.innerHTML = html
}

