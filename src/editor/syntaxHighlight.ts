
// @ts-ignore
import { CodeJar } from "codejar"

import { isChoice } from "../interopLang"

export function highlight(editor: HTMLElement) {
  const lines = editor.innerText.split("\n")

  editor.innerHTML = lines
    .map(line => {
      const text = line.trim()
      let className = ""

      if (text.startsWith("###story###")) {
        className = "section-start"
      } else if (text.startsWith("#")) {
        className = "line-comment"
      } else if (text.startsWith(".label")) {
        className = "label"
      } else if (text.startsWith(".")) {
        className = isChoice(text, ".") ? "line-choice" : "line-command"
      } else if (text.startsWith("if ") || text === "else" || text.startsWith("end")) {
        className = "if-else-end"
      }

      return className
        ? `<span class="line ${className}">${line}</span>`
        : `<span class="line">${line}</span>`
    })
    .join("\n")
}
