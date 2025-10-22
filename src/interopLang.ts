
/* 

  Some functions that are used by both editor and compiler
  and pertain to features of the script language.

*/


export const MAGIC_STORY_STARTER = "###story###"


export function isGather(str: string, gatherToken: string) : boolean {
  return str.startsWith(gatherToken)
}


export function isChoice(str: string, choiceToken: string) : boolean {
  // note:
  // ".word" is a command
  // ". word" is a choice
  // that is why we check it like this

  let i = -1
  for (const char of str) {
    i++
    if (char.trim() !== "" && char !== choiceToken) {
      const prev = str[i - 1]
      return !!(prev && prev.trim() === "")
    }
  }
  return false
}

