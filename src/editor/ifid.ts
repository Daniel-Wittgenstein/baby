

export function generateIfId() {
  return crypto.randomUUID().toUpperCase()
}


export function isCryptoAvailable() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
}

