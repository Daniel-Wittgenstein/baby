

export function generateDemoJsCode() {
  return `

// CUSTOM JS GOES HERE:

$_onStartApp = (baby) => {
  
  // when the app starts, add a new command:

  // A simple example custom command that allows you to do:
  // .log Some Text!
  // to log to the browser console.

  baby.command(
    {
      name: "log",

      onStart: (parts, text, name) => {
        // onStart function runs at app start
        // for each line with a command:

        if (text === "error") {
          // you can do any checks you want to reject 
          // malformed commands:
          // return a string to throw an error:
          return "writing 'log error' is not allowed"
        }
      },

      onExec: (parts, text, name) => {
        // onExec function runs when the line 
        // with the command is encountered:

        // return an array containing 
        // instructions to perform:

        return {
          do: [
            // the action "js" simply runs 
            // a JS function when the command
            // is encountered. We log 
            // the text of the line to the browser console:
            { action: "js", run: () => {console.log(text)} },
          ]
        }
      },
    }
  )



}
  
  `
}
