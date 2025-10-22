
export function debounce(fn: (...args: any[]) => void, delay: number): (...args: any[]) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
