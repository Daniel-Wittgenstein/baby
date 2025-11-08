

const DRAG_SPEED = 20
const MINIMUM_DRAG_AMOUNT_TO_OPEN_OR_CLOSE = 100


function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}


function isDraggingHorizontally(dx: number, dy: number) {
  return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40 //threshold
  // is important, otherwise opening drawer will highlight stuff in the editor
}


export function createSwipeDrawer(parent: HTMLElement, content: HTMLElement,
    onMove: () => void
  ) {

  function openDrawer() {
    drawer.style.transform = `translateX(0%)`
    drawerIsOpen = true
  }


  function closeDrawer() {
    drawer.style.transform = `translateX(100%)`
    drawerIsOpen = false
  }


  const drawer = document.createElement("div")
  drawer.className = "drawer"
  drawer.appendChild(content)
  parent.appendChild(drawer)

  let startX = 0
  let startY = 0
  let drawerIsOpen = false

  parent.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0]
      startX = touch.pageX
      startY = touch.pageY
    },
    { passive: true }
  )

  parent.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0]
      const dx = touch.pageX - startX
      const dy = touch.pageY - startY

      if (isDraggingHorizontally(dx, dy)) {

        // Prevent scrolling if user is dragging horizontally:
        // So the editor does not scroll:
        e.preventDefault()

        onMove()

        if (dx > 0 && !drawerIsOpen) return
        
        if (dx < 0 && drawerIsOpen) return

        let percent = 0

        const draggedBy = clamp(Math.round(Math.abs(dx) / 100 * DRAG_SPEED), 0, 100)

        if (drawerIsOpen) {
          percent = draggedBy
        } else {
          percent = 100 - draggedBy
        }

        drawer.style.transform = `translateX(${percent}%)`

      }
    },
    { passive: false }
  )

  parent.addEventListener(
    "touchend",
    (e) => {
      const touch = e.changedTouches[0]
      const dx = touch.pageX - startX
      const dy = touch.pageY - startY

      if (isDraggingHorizontally(dx, dy)) {


        if (Math.abs(dx) < MINIMUM_DRAG_AMOUNT_TO_OPEN_OR_CLOSE) {
          if (drawerIsOpen) {
            openDrawer()
          } else {
            closeDrawer()
          }
        } else {
          if (dx < 0) {
            openDrawer()
          } else {
            closeDrawer()
          }
        }
        // Prevent scrolling if user is dragging horizontally:
        // So the editor does not scroll:
        onMove()
        e.preventDefault()
      }
    },
    { passive: false }
  )

}
