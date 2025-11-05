
import { appRunsInsideIframe } from "./environmentDetection"

import { fixHeader } from "./fixHeader"

import docs from "../help/authorHelp"

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
        <button id="sm_write" class="tab">Write</button>
        <button id="sm_play" class="tab">Play</button>
        <button id="sm_help" class="tab">Help</button>
        <button id="sm_css" class="tab">CSS</button>
        <button id="sm_js" class="tab">JS</button>
        <div class="spacer"></div>
        <button id="save">Save</button>
      </div>

      <div>
        <button id="more-menu-button" class="hamclose">☰</button>
      </div>
    </div>
    
    <div id="sm_main">

      <div id="sm_code-wrapper" class="sm_tab-area sm_tab-area-write">

        <div id="code-editor"
          class = "editors"
          contenteditable="true" autocapitalize="off"
          spellcheck="false">
        </div>

      </div>
      
      <div class="sm_tab-area sm_tab-area-play">
        <iframe id="iframe-preview"></iframe>
      </div>
      
      <div class="sm_tab-area sm_tab-area-play">
        <iframe id="iframe-preview"></iframe>
      </div>
      
      <div class="sm_tab-area sm_tab-area-help">
      </div>

      <div class="sm_tab-area sm_tab-area-css">
        <div id="css-editor"
          class = "editors"
          contenteditable="true" autocapitalize="off"
          spellcheck="false">
        </div>
      </div>

      <div class="sm_tab-area sm_tab-area-js">
        <div id="js-editor"
          class = "editors"
          contenteditable="true" autocapitalize="off"
          spellcheck="false">
        </div>
      </div>



    </div>
  `
  parent.innerHTML = html

  document.querySelector(".sm_tab-area-help").innerHTML = docs
}

