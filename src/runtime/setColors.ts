
import { userError } from "./userError"

const DEFAULT_COLOR = "monochrome"

import i18n from "./i18n"

export enum Theme {
  Undecided = "Undecided",

  Light = "Light",
  Dark = "Dark",
}


const accentColors = {

  monochrome: {
    [Theme.Light]: {std: "#444"},
    [Theme.Dark]: {std: "#bbb"},
  },

  red: {
    [Theme.Light]: {std: "#9f0712"},
    [Theme.Dark]: {std: "#9f0712"},
  },

  blue: {
    [Theme.Light]: {std: "#0084d1"},
    [Theme.Dark]: {std: "#0084d1"},
  },

  pink: {
    [Theme.Light]: {std: "#e60076"},
    [Theme.Dark]: {std: "#e60076"},
  },

  green: {
    [Theme.Light]: {std: "#008236"},
    [Theme.Dark]: {std: "#008236"},
  },
}


const themes = {
  [Theme.Light]: {
    fg: "#000",
    bg: "#fff",
  },
  [Theme.Dark]: {
    fg: "#fff",
    bg: "#222",
  },
}


let currentAccentColor: string = DEFAULT_COLOR


let currentTheme: Theme = Theme.Light


function prefersDarkMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}


function prefersLightMode() {
  return window.matchMedia("(prefers-color-scheme: light)").matches
}


function decideTheme(authorSetTheme: string, userSettingsTheme: string) {

  if (userSettingsTheme &&
    (userSettingsTheme === Theme.Light || userSettingsTheme === Theme.Dark)) {
      // game has already been played in this browser: set last theme setting:
      return userSettingsTheme
  }

  // use author preference, if it exists:
  if (authorSetTheme && authorSetTheme.toLowerCase() === "light") return Theme.Light
  if (authorSetTheme && authorSetTheme.toLowerCase() === "dark") return Theme.Dark

  // Otherwise, check if the browser has any preferences set.
  // This is not 100% reliable, for example the iframe might report light mode
  // but the editor might report dark mode, which is frankly insane.
  // In general, it's better if story authors add a preference.

  if (prefersLightMode()) return Theme.Light
  if (prefersDarkMode()) return Theme.Dark

  // or just use light mode:
  return Theme.Light
}


function setVar(prop: string, val: string) {
  document.documentElement.style.setProperty("--" + prop, val)
}


export function switchTheme() {
  applyTheme(currentTheme === Theme.Light ? Theme.Dark : Theme.Light)
}


function applyTheme(theme: Theme) {
  const bg = themes[theme].bg
  const fg = themes[theme].fg
  setVar("bg", bg)
  setVar("text", fg)
  
  if (theme === Theme.Dark) {
    document.body.classList.add("dark")
  } else {
    document.body.classList.remove("dark")
  }
  
  currentTheme = theme

  const text = currentTheme === Theme.Light ? i18n.light : i18n.dark
  document.getElementById("menu-theme").innerHTML = text

  refreshAccentColor()
}


function refreshAccentColor() {
  const theme = currentTheme
  const color = currentAccentColor
  let targetCol = ""
  if (!accentColors[color]) {
    targetCol = accentColors[DEFAULT_COLOR][theme].std
  } else {
    targetCol = accentColors[color][theme].std
  }
  setVar("accent", targetCol)
}


export function setColors(
    authorSetColor: string,
    authorSetTheme: string,
    userSettingsTheme: string) {

  currentAccentColor = authorSetColor
  const theme = decideTheme(authorSetTheme, userSettingsTheme)
  applyTheme(theme)

}
