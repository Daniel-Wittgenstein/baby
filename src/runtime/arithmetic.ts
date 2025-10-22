

export type ArithmeticFunc = (val1: any, val2: any) => any

export const arithmeticCommands = {
  set: (a, b) => b,
  incr: (a, b) => a + b,
  decr: (a, b) => a - b,
  mult: (a, b) => a * b,
  div: (a, b) => a / b,
  round: (a, b) => Math.round(a),
  floor: (a, b) => Math.floor(a),
}

