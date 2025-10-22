

export function userError(text: string, lineNo: number) {
  document.body.innerHTML = `<div class="user-error">LINE ${lineNo}: ${text}</div>`
  throw new Error (text)
}

