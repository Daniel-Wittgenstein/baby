
export function notify(text: string, mode: "notification" | "error" = "notification", long = false) {
  const div = document.createElement('div')
  div.className = 'notification'
  if (mode === "error") {
    div.className += " error-notification"
  }
  let time = mode === "error" ? 5000 : 3000
  if (long) {
    time = 5000
  }
  div.innerHTML = text
  document.body.appendChild(div)
  setTimeout(() => div.remove(), time)
}
