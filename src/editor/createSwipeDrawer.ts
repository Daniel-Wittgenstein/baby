import TinyGesture from "../../node_modules/tinygesture/dist/TinyGesture"

export function createSwipeDrawer(parent: HTMLElement, content: string | HTMLElement) {
  // Create the drawer div
  const drawer = document.createElement("div")
  drawer.className = "drawer"

  // Insert content
  if (typeof content === "string") drawer.textContent = content
  else drawer.appendChild(content)

  // Append drawer to the parent container
  parent.appendChild(drawer)

  // Variables for tracking swipe
  let startX = 0       // initial X position when swipe starts
  let currentX = 0     // current X distance moved during swipe
  let open = false     // is the drawer currently open?

  // Initialize TinyGesture on the parent container
  const gesture = new TinyGesture(parent)


  gesture.on("panstart", (e: any) => {

  })


  gesture.on("panmove", (e: any) => {
    if (gesture.swipingDirection === 'horizontal') {
      console.log("swiping horizontally")

      const amountMoved = gesture.touchMoveX

      const movePercent = Math.round(amountMoved / 10)

      drawer.style.transform = `translateX(${movePercent}%)`

      console.log(amountMoved)

    }
  })


  gesture.on("panend", () => {

  })
}
