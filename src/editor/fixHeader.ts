

/*
  Chrome and Safari on mobile break "position: fixed".
  So we have to fix that.
*/

export function fixHeader() {
  const header = document.querySelector('#sm_top') as HTMLElement;

  if (window.visualViewport) {
    const adjustHeader = () => {
      // offsetTop moves downward when keyboard appears (esp. iOS Safari)
      const offsetY = window.visualViewport.offsetTop;

      // Use translateY to keep it visually pinned to the top of the screen
      header.style.transform = `translateY(${offsetY}px)`;
    };

    // Listen for both resize and scroll of the visual viewport
    window.visualViewport.addEventListener('resize', adjustHeader);
    window.visualViewport.addEventListener('scroll', adjustHeader);
  }
}

