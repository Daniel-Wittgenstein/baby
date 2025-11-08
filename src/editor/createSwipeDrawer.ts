
export function createSwipeDrawer(parent: HTMLElement, content: HTMLElement) {

  const drawer = document.createElement("div")
  drawer.className = "drawer"
  drawer.appendChild(content)

  parent.appendChild(drawer)


}
