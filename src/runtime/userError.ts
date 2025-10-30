

export function userError(text: string, lineNo: number) {  
  try {
    (window as any)?.parent?.$_onErrorFromIFrame(text, lineNo)
  } catch {
    // If we cannot pass the error up to the editor, 
    // the story is probably not running inside the editor:
    // ignore.
  }

  // always display error inside story as well:
  document.body.innerHTML = `<div class="user-error">LINE ${lineNo}: ${text}</div>`
}

