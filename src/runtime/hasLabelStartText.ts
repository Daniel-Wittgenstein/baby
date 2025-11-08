
export function hasLabelStartText(text: string) {
  return /^label\s/.test(text) || /^l\s/.test(text)
}
