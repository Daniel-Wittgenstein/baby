
# BabyScript

## labels

Create a label:

  .label forest

Or shorter:

  .l forest

Label names are case-**in**sensitive.
Lower-case is recommended.

Labels do **not** halt story execution.

## goto

Jump to a label. The story execution will continue from there:

  .goto forest

## choices

Create a choice:

  . Go left!

Note that there has to be a space after the dot.
Otherwise, baby.txt thinks it's a command and gives you an error.

Choices can have levels, like in Ink:

  .. Another choice.

If a choice is supposed to jump to a label, put a "goto" command on the **next line**:

  . Choose this!
  .goto mylabel

## gathers

This is a level 2 gather:

  --

## built-in commands that change variables

### set

Sets the value of a variable.
You can set the variable to a string, not only to a number.
You can also set it to the value of another variable.

  .set x 100

  .set x "A text."

  .set x y

### incr

Increases the value of a variable.

  .incr x 10

  .incr x y

### decr

Decreases the value of a variable.

  .decr x 10

### mult

Multiplies.

  .mult x 2

### div

Divides. (Without rounding or truncating, result may be a floating point number.)

  .div x 2

### round

Round the variable. (3.5 gets rounded up to 4; 3.4 gets rounded down to 3)

  .round x

### floor

Round the variable down. (3.7 becomes 3; 3.2 becomes 3, too)

  .floor x

### roll

Assign a random number from a to b (inclusive) to the variable.

For example, to simulate a die roll:

  .roll x 1 6


# Using JS

## baby api functions

### roll

Returns a random integer.
This has the same behavior, the ".roll" command has.

  ```
  const x = baby.roll(1, 100)
  ```

### set

Sets a variable to a value.

  ```
  baby.set("health", 75)
  ```

### get

Returns a variable's value.

  ```
  baby.get("health")
  ```

## custom commands

### onStart function

Custom commands should have an "onStart" function.

The "onStart" function should return a string to throw a user error.

It should return undefined, if no error occurred.

### onExec function

Custom commands should have an "onExec" function.

#### the onExec function can return actions

The "onExec" function can return a list of actions inside "do":

  ```
    return {
        do: [
          { action: "js", run: () => {console.log("Hi!")} },
          { action: "text", text: "Hello World!" },
        ],
    }
  ```

The allowed actions are listed next.

##### action: js

Runs a JS function.

```
  {
    action: "js",
    run: () => {
      console.log("Hello World!")
    },
  }
```

##### action: text

Outputs text.

```
  { action: "text", text: "GAME OVER!" },
```


#### the onExec function can also return a target

  The onExec function can also return a target property pointing to a label.

  The custom command will jump to that label.

  ```
    return {
      do: [],
      target: "labelName",
    }

  ```

