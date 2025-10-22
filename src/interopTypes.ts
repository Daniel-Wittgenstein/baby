/* types used by both compiler and runtime */

export type Line = {
  orgText: string,
  orgCodeLineNo: number,
  text: string,
  index: number,
  level: number,
  nextLineIndex: number,
  type: LineType,
  deadEnd: boolean,

  isIfCondition?: boolean,
  isElse?: boolean,
  isEnd?: boolean,
  correspondingElseLine?: Line,
  ifProps?: {
    left: string,
    operator: string,
    right: string,
  },
}


export enum LineType {
  Gather = "Gather",
  Choice = "Choice",
  Undecided = "Undecided",
}


export type MetaData = Record<string, string>

