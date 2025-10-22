
export enum AbstractRenderElType {
  Text = "Text",
  Choice = "Choice"
}


export type AbstractRenderText = {
  type: AbstractRenderElType.Text,
  text: string,
}


export type AbstractRenderChoice = {
  type: AbstractRenderElType.Choice,
  text: string,
  index: number,
}

export type AbstractRenderEl = AbstractRenderText | AbstractRenderChoice


export type Command = {
  name: string,
  text: string
}

export type TargetTable = Record<string, number>

export type CommandTable = Command[]

export enum ActionType {
  Text = "Text",
  Choice = "Choice",
  Command = "Command", // command is not handled by the Runner. just return text of command
    // and the caller can do whatever with it.
  Nothing = "Nothing", // command was already handled by the Runner. nothing to do
  EndOfTurn = "EndOfTurn",
  StoryFlowRunsOut = "StoryFlowRunsOut"
}

export type Action = {
  type: ActionType,
  text: string,
  choiceIndex?: number,
  commandName?: string,
  lineNo: number,
}
