

/*
  Chrome and Safari on mobile break "position: fixed".
  So we have to fix that.
*/


export function keepPinned(el: HTMLElement) {
  if (window.visualViewport) {
    const adjustIt = () => {
      
      // offsetTop moves downward when keyboard appears (esp. iOS Safari):
      const offsetY = window.visualViewport.offsetTop

      // Use translateY to keep it visually pinned to the top of the screen:
      el.style.transform = `translateY(${offsetY}px)`
    }

    window.visualViewport.addEventListener('resize', adjustIt)
    window.visualViewport.addEventListener('scroll', adjustIt)
  }
}

