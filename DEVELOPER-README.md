
# Developing / Work on the app

Do:

  npm run dev

This live reloads on changes.

HOWEVER: any time you make a change to a file inside ./src/runtime, you ALSO need to
manually rebuild the runtime with:

  npm run build-runtime

It's recommended to set this to a keyboard shortcut for convenience.

For example in VS code/codium you can set a keyboard shortcut (only works if you leave the terminal open):

  {
    "key": "ctrl+n",
    "command": "workbench.action.terminal.sendSequence",
    "args": {
      "text": "npm run build-runtime\u000D"
    }
  }

This allows us to store the entire runtime code inside a string, so
it can be injected into the exported story.


# OBSOLETE deploy to itch.io

OBSOLETE. The app does not work well with itch's fullscreen thing at all.
Do not use this.

  npm run deploy:itch

(Works if itch io's butler is installed and authenticated and if you are on Linux, because
it uses a Linux command to zip up the app.)

# test on mobile

  npm run test-mobile

(Works like a charm if both PC and mobile phone are on the same network.
Find the localhost URL that is shown in the terminal and open it on your mobile phone.)

# deploy to github pages

  npm run deploy

Wait a bit. Navigate to "https://daniel-wittgenstein.github.io/baby/"

NEVER CHANGE the contents of the branch "gh-pages" manually!
It's only there so the gh-pages command can do its thing.

