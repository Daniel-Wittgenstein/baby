
// @ts-ignore
import { defineConfig } from "vite"

const GITHUB_URL = "/baby/"

export default defineConfig({
  /* for itch. io deployment, use:      base: './'    
  But itch.io is not good for this, because you have to run it fullscreen
  and then file open dialogues are pretty much unusable on mobile.
  */ 

  base: process.env.NODE_ENV === "production" ? GITHUB_URL : "", // we deploy to Github
  test: {
    include: ["**/*.test.ts"], 
    globals: true,             // so we can use stuff without import
    environment: "node",
  },
})
