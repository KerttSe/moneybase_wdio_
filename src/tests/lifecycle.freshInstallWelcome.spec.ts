import { browser } from '@wdio/globals'
import AppLifecyclePage from '../pages/AppLifecyclePage'

describe('App lifecycle - fresh installation', function () {
  it('[TC2845] Shows the Welcome carousel on first launch without a stored mobile number', async function () {
    this.timeout(60000)
    if (process.env.MB_FRESH_INSTALL_WELCOME !== 'true') return this.skip()
    if (!browser.isAndroid) throw new Error('TC2845 currently uses the Android Welcome carousel locator')
    await AppLifecyclePage.verifyWelcomeCarousel()
  })
})
