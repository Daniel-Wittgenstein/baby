
# Developing

Work on the app:

  npm run dev

Live reloads on changes.

HOWEVER: any time you make a change to a file inside ./src/runtime, you ALSO need to
manually rebuild the runtime with:

  npm run build-runtime

It's recommended to set this to a keyboard shortcut for convenience.

For example in VS codium you can set a keybaord shortcut (leave terminal open):

  {
    "key": "ctrl+n",
    "command": "workbench.action.terminal.sendSequence",
    "args": {
      "text": "npm run build-runtime\u000D"
    }
  }

This allows us to store the entire runtime code inside a string, so
it can be injected into the exported story.


# Deploying / Building

Do:

  npm run build

  npm run build-runtime

In this exact order.

Build will appear in dist folder.

# Test the build locally:

The simplest option is (inside "./dist"):

  npx http-server . 

# deploy to itch.io

  npm run deploy:itch

(Works if itch io's butler is installed and authenticated and if you are on Linux, because
it uses a Linux command to zip up the app.)

# test on mobile

  npm run test-mobile

(Works like a charm if both PC and mobile phone are on the same network.)

