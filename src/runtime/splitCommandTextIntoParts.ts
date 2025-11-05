
export function splitCommandTextIntoParts(str: string) {
  return str.split(/\s\-\-\s/).map(n => n.trim()).filter(Boolean)
}
