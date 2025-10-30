import { generateIfId, isCryptoAvailable } from "./ifid"



export function generateDemoCode() {

  /* const ifId = isCryptoAvailable() ? 
    `# Unique id, do not change:\n` +
    `ifid: ${generateIfId()}\n\n`
    : "" */

  let code =

`
# Your story's title:
title: Untitled Story

# Your name:
author: Anonymous

# Start with this theme: light/dark
theme: light

# Accent color. Allowed values:
# red, blue, green, pink or monochrome
color: monochrome

# Turn off animations while testing? yes/no
debugfast: no

###story###

.set x 5+4

You are in a forest.

There are two paths here,
one leasing left, one right.

What will you choose?

. Go left.
  You reach the beach.

  Good choice!

. Go right.
  You reach the hills.

  .. Go into the mountains.

    You go into the mountains.
    
    You freeze to
    death.

  .. Stay here.

    You live in the hills.
    
    Then you die.
  

-
The End

`

  return code //.split("\n").map(n => n.trim()).join("\n")
}


