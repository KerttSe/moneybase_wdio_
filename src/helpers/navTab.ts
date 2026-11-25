import { browser, $ } from '@wdio/globals'
// Bottom navigation tab. App 2.28 renders the Android tabs as Compose items with a testTag
// (navigation_button_<tab>) and a text label but no content-desc, so "~Invest" no longer matches.
export type NavTabName = 'Home' | 'Pay' | 'Cards' | 'Invest'

export function navTab(name: NavTabName) {
  if (browser.isIOS) return $(`~${name}`)
  const id = `navigation_button_${name.toLowerCase()}`
  return $(`(//*[contains(@resource-id,"${id}")] | //*[@content-desc="${name}"])[1]`)
}
