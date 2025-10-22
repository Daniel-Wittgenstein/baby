export function customConfirm(
  title: string,
  msg: string,
  confirmButtonText: string,
  cancelButtonText: string,
  onConfirm: () => void,
  onCancel: () => void
) {
  const overlay = document.createElement('div')
  overlay.className = 'confirm-overlay show'

  const modal = document.createElement('div')
  modal.className = 'confirm-modal show'

  const titleEl = document.createElement('h2')
  titleEl.textContent = title

  const msgEl = document.createElement('p')
  msgEl.textContent = msg

  const buttonsContainer = document.createElement('div')
  buttonsContainer.className = 'confirm-buttons'

  const confirmBtn = document.createElement('button')
  confirmBtn.textContent = confirmButtonText
  confirmBtn.className = 'confirm-button'

  const cancelBtn = document.createElement('button')
  cancelBtn.textContent = cancelButtonText
  cancelBtn.className = 'cancel-button'

  const closeModal = (callback: () => void) => {
    overlay.classList.remove('show')
    modal.classList.remove('show')
    overlay.classList.add('hide')
    modal.classList.add('hide')
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay)
      }
      callback()
    }, 300)
  }

  confirmBtn.onclick = () => closeModal(onConfirm)
  cancelBtn.onclick = () => closeModal(onCancel)

  buttonsContainer.appendChild(confirmBtn)
  buttonsContainer.appendChild(cancelBtn)

  modal.appendChild(titleEl)
  modal.appendChild(msgEl)
  modal.appendChild(buttonsContainer)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)
}
