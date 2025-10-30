
import { Theme } from "./setColors"

const USER_SETTINGS_KEY = "user-settings"

type Settings = {
}

const DEFAULT_SETTINGS = {
}


export function loadUserSettings() : Settings {
  let data = localStorage.getItem(USER_SETTINGS_KEY)
  if (data) {
    try {
      data = JSON.parse(data)
    } catch {
      console.log("No user settings stored.")
      data = null
    }
  }
  if (data) {
    return JSON.parse(data) as Settings
  } else {
    return DEFAULT_SETTINGS
  }
}


export function saveUserSettings(settings: Settings) {
  localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings))
}

