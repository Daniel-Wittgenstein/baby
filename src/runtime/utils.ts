
export function getFirstWordAndRest(str: string): [string, string] {
  const index = str.search(/\s/)
  if (index === -1) return [str.trim(), ""]
  return [str.slice(0, index).trim(), str.slice(index + 1).trim()]
}


export function removeFirstChar(str: string): string {
  return str.slice(1)
}
