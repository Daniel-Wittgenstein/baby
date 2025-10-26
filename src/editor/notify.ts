
export function notify(text: string, mode: "notification" | "error" = "notification", time: number = -1) {
  const div = document.createElement('div')
  div.className = 'notification'
  if (mode === "error") {
    div.className += " error-notification"
  }
  if (time === -1) {
    time = mode === "error" ? 5000 : 3000
  }
  div.innerHTML = text
  document.body.appendChild(div)
  setTimeout(() => div.remove(), time)
}
