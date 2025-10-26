
export function isChromeMobile(): boolean {
  const uaData: any = (navigator as any).userAgentData
  if (uaData) {
    if (uaData.mobile) {
      return uaData.brands.some((b: any) => /Chrome/i.test(b.brand))
    }
    return false
  }

  const ua = navigator.userAgent || ""
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua)
  const isChrome = /Chrome/i.test(ua) && !/Edg|OPR|Brave|Chromium/i.test(ua)
  return isMobile && isChrome
}
