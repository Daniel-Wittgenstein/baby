



# Using JS

## baby api functions

### roll

Returns a random integer.

  ```
  baby.roll(1, 100)
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

