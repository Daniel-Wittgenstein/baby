
export function isSmallScreen() {
  // if we are on a smartphone:
  // (or inside a browser window that was resized to be rather small,
  // but if the user does that, it's their fault)
  return window.matchMedia("(max-width: 767px)").matches 
}


export function appRunsInsideIframe() {
  return window !== window.parent
}

