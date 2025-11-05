

export function generateDemoJsCode() {
  return `

// CUSTOM JS GOES HERE:

$_onStartApp = (baby) => {
  
  // when the app starts:

  // ############################
  // ############################
  //   .log command
  // ############################
  // ############################

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

  // ############################
  // ############################
  //   .death command
  // ############################
  // ############################

  // This example command shows that custom commands
  // can jump to a label.

  baby.command(
    {
      name: "death",

      onStart: (parts, text, name) => {
      },

      onExec: (parts, text, name) => {

        return {

          do: [

            // say game over:

            { action: "text", text: "GAME OVER!" },

          ],

          // and jump to the label named "death":
          target: "death",
        }

      },
    }
  )

  // ############################
  // ############################
  //   .chance command
  // ############################
  // ############################

  // This is an example of a slightly more involved command:
  
  // example usage:
  
  // .set health 100
  // .set fear = 0
  // .chance 50% - Heads! - Tails!
  // .chance 75% - You jump over the fence! - You hurt yourself while trying to jump! - health - minus 20
  // .chance 66% - You open the box. It's empty. - You open the box and see a huge spider inside. - fear - plus 10
  
  // The percentage gives the likelihood of succeeding.

  // If we succeed, the first text is shown, otherwise 
  // the second text.

  // If we fail, a variable is changed, as well (this is optional).

  // Note how the parameters are always separated by a "-" character
  // that has to be preceded and followed by a space.

  baby.command(
    {
      name: "chance",

      onStart: (parts, text, name) => {
        console.log("parts", parts)
        if (parts.length !== 3 && parts.length !== 5) {
          return "chance command: expected 3 or 5 parameters"
        }
      },

      onExec: (parts, text, name) => {

        const percentage = Number(parts[0].replace("%", ""))

        const successText = parts[1]

        const failText = parts[2]

        const varName = parts[3]

        let changeString = parts[4]

        const diceRoll = baby.roll(1, 100)

        const success = diceRoll <= percentage

        const actions = []

        if (success) {
          actions.push({action: "text", text: successText})  
        } else {
          actions.push({action: "text", text: failText})  
        }


        let func

        if (varName) {

          // varName is optional.
          // if it was specified, do this:
          
          if (!changeString) {
            return "Exepcted 5th parameter"
          }

          const originalValue = baby.get(varName)
          if (changeString.startsWith("minus")) {
            changeString = changeString.replace("minus", "").trim()
            console.log(222, changeString)
            const num = Number(changeString)
            func = () => baby.set(varName, originalValue - num)

          } else {
            changeString = changeString.replace("plus", "").trim()
            console.log(222, changeString)
            const num = Number(changeString)
            func = () => baby.set(varName, originalValue + num)

          }
          
          actions.push({
            action: "js",
            run: func,
          })

        }

        return {
          do: actions,
        }

      },
    }
  )


}
  
  `
}
