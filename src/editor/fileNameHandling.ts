

export function getTimestampForFileName(): string {
  // using locale date/time is just too inconsistent
  // and makes for ultra-long file names

  const now = new Date()
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const year = now.getFullYear()
  const month = months[now.getMonth()]
  const day = now.getDate().toString().padStart(2, "0")
  const hour = now.getHours().toString().padStart(2, "0")
  const minute = now.getMinutes().toString().padStart(2, "0")

  return `${year}-${month}-${day}_${hour}-${minute}`
}


export function sanitizeCurrentProjectNameForFileName(str: string) {
  let result = ""
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    const code = char.charCodeAt(0)
    if (code > 31 && char !== "/" && char !== "\\" 
      && char !== ":" && char !== "*" && char !== "?" && 
      char !== "\"" && char !== "<" && char !== ">" && char !== "|") {
      result += char
    }
  }
  return result
}

