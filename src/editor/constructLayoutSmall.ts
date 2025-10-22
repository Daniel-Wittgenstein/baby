
import { appRunsInsideIframe } from "./environmentDetection"

import { fixHeader } from "./fixHeader"

let parent

export function constructLayoutSmall() {
  parent = document.getElementById("app")

  if (!parent) {
    throw new Error(`Cannot start. No #app element.`)
  }

  constructIt()

  handleMobileCloseButton()

  fixHeader()
}


function constructIt() {
  const html = `
    <div id="sm_top">
      <div>
        <button id="sm_play">Play</button>
        <button id="sm_edit">Edit</button>
      </div>

      <div id="error-displayer"></div>

      <div>
        <button id="more-menu-button">☰</button>
        <button id="sm_close-for-mobile">✖</button>
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


function handleMobileCloseButton() {
  if (appRunsInsideIframe()) {
    document.getElementById("sm_close-for-mobile")?.addEventListener("click", () => {
      // for itch.io: bc android mobile back button does exactly nothing on itch.io
      // so we need a way to exit the fullscreenified app
      // (all other native ways suck ass and are also
      // cumbersome for testing - or at least the ways I found)
      mobileClose()
    })
  } else {
    if (document.getElementById("sm_close-for-mobile")) {
      //always show - at least for now - helps us test layout better and is harmless
      //document.getElementById("sm_close-for-mobile").style.display = "none"
    }
  }
}


function mobileClose() {
  if (!appRunsInsideIframe()) return
  if (document.referrer) {
    window.parent.location.href = document.referrer
  } else {
    window.parent.location.reload()
  }
}

