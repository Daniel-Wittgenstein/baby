import { getRndInt } from "./randomFuncs"


export type ArithmeticFunc = (...args: any[]) => any

export const arithmeticCommandHasThreeParams = (name: string) => {
  if (name === "roll") return true
  return false
}


export const arithmeticCommands = {
  set: (a, b) => b,
  incr: (a, b) => a + b,
  decr: (a, b) => a - b,
  mult: (a, b) => a * b,
  div: (a, b) => a / b,
  round: (a, b) => Math.round(a),
  floor: (a, b) => Math.floor(a),
  roll: (a, b, c) => getRndInt(b, c),
}


export const arithmeticToInk = {
  set: (a, b) => `${a} = ${b}`,
  incr: (a, b) => `${a} += ${b}`,
  decr: (a, b) =>  `${a} -= ${b}`,
  mult: (a, b) => `${a} *= ${b}`,
  div: (a, b) => `${a} /= ${b}`,
  round: (a, _) => `${a} = round(a)`,
  floor: (a, _) => `${a} = FLOOR(a)`,
  roll: (a, b, c) => `${a} = RANDOM(${b}, ${c})`,
}

