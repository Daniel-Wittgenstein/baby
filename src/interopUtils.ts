
/* 
  Utility functions that can be used by the compiler, the editor as well as the runtime.

  If a function is here, but is currently not actually used by the runtime,
  do NOT bother moving it to another module. Vite should tree-shake it anyway,
  so unused functions shouldn't end up in the final injected runtime data.
  Also, even if Vite should fail at removing it, it"s not worth the hassle.
  
  Any function that is generic enough can go here.
*/

export function downloadFile(content: string, fileName: string) {
  const blob = new Blob([content], { type: "text/html" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = fileName
  a.click()
}


export function splitOnlyAtFirst(str: string, sep: string): [string, string] {
  const i = str.indexOf(sep)
  return i === -1 ? [str, ""] : [str.slice(0, i), str.slice(i + sep.length)]
}


export function countOccurrences(str: string, subString: string) {
  return str.split(subString).length - 1
}


export function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

