import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

export type VopResult = 'Match' | 'Close Match' | 'No Match' | 'Unavailable'

class VopPage extends BasePage {
  /* =========================
   * ANDROID LOCATORS
   * ========================= */

  private get vopScreenAndroid() {
    return $('android=new UiSelector().resourceId("verificationOfPayee_screen")')
  }

  private get vopScreenAndroidTypo() {
    return $('android=new UiSelector().resourceId("varificationOfPayee_screen")')
  }

  private get vopCloseBtnAndroid() {
    return $('android=new UiSelector().resourceId("verificationOfPayee_button_close")')
  }

  private get vopConfirmBtnAndroid() {
    return $('android=new UiSelector().resourceId("verificationOfPayee_button_confirm")')
  }

  private get vopConfirmBtnAndroidTypo() {
    return $('android=new UiSelector().resourceId("varificationOfPayee_button_confirm")')
  }

  private get vopConfirmBtnAndroidByText() {
    return $('android=new UiSelector().text("Confirm")')
  }

  private async getVopResultFromSourceAndroid(): Promise<string> {
    const src = await browser.getPageSource()
    for (const result of ['Close Match', 'No Match', 'Match', 'Unavailable'] as VopResult[]) {
      if (src.includes(`text="${result}"`)) return result
    }
    throw new Error('VOP result label not found in page source')
  }

  private get vopSeekBarAndroid() {
    return $(
      '//*[contains(@resource-id,"verificationOfPayee_slider_confirm")]//android.widget.SeekBar'
    )
  }

  /* =========================
   * IOS LOCATORS
   * ========================= */

  private get vopScreenIOS() {
    return $('~verificationOfPayee_screen')
  }

  private get vopCloseBtnIOS() {
    return $('~verificationOfPayee_button_close')
  }

  private get vopResultLabelIOS() {
    return $(
      '-ios predicate string:name == "Match" OR name == "Close Match" OR name == "No Match" OR name == "Unavailable"'
    )
  }

  private get vopSliderIOS() {
    return $('~makePayment_slider_pay')
  }

  /* =========================
   * PUBLIC METHODS
   * ========================= */

  public async isCloseBtnVisible(): Promise<boolean> {
    const btn = browser.isIOS ? this.vopCloseBtnIOS : this.vopCloseBtnAndroid
    return btn.isExisting().catch(() => false)
  }

  public async isVopScreenVisible(): Promise<boolean> {
    if (browser.isIOS) return this.vopScreenIOS.isExisting().catch(() => false)
    return (
      (await this.vopScreenAndroid.isExisting().catch(() => false)) ||
      (await this.vopScreenAndroidTypo.isExisting().catch(() => false))
    )
  }

  public async waitForVopScreen(timeout = 15000) {
    if (browser.isIOS) {
      await this.vopScreenIOS.waitForExist({ timeout, timeoutMsg: 'VOP screen did not appear' })
      return
    }
    await browser.waitUntil(
      () => this.isVopScreenVisible(),
      { timeout, interval: 500, timeoutMsg: 'VOP screen did not appear' }
    )
  }

  public async tapConfirm() {
    if (browser.isIOS) {
      await this.tap(this.vopScreenIOS)
      return
    }
    const candidates = [this.vopConfirmBtnAndroid, this.vopConfirmBtnAndroidTypo, this.vopConfirmBtnAndroidByText]
    for (const btn of candidates) {
      if (await btn.isExisting().catch(() => false)) {
        await this.tap(btn)
        return
      }
    }
    throw new Error('VOP confirm button not found')
  }

  public async getVopResult(): Promise<string> {
    if (browser.isIOS) {
      await this.vopResultLabelIOS.waitForExist({ timeout: 10000, timeoutMsg: 'VOP result label not found' })
      return this.vopResultLabelIOS.getText()
    }
    return this.getVopResultFromSourceAndroid()
  }

  public async assertVopResult(expected: VopResult) {
    const actual = await this.getVopResult()
    if (actual !== expected) throw new Error(`VOP result mismatch: expected "${expected}", got "${actual}"`)
  }

  public async assertPayeeName(expected: string) {
    const src = await browser.getPageSource()
    if (!src.includes(expected)) {
      throw new Error(`Payee name "${expected}" not found on VOP screen`)
    }
  }

  public async slideToConfirm() {
    if (browser.isIOS) {
      await this.slideToConfirmIOS()
    } else {
      await this.slideToConfirmAndroid()
    }
  }

  public async close() {
    const btn = browser.isIOS ? this.vopCloseBtnIOS : this.vopCloseBtnAndroid
    await this.tap(btn)
  }

  /* =========================
   * PRIVATE HELPERS
   * ========================= */

  private async slideToConfirmAndroid() {
    await this.vopSeekBarAndroid.waitForExist({ timeout: 15000, timeoutMsg: 'VOP SeekBar not found' })

    const seekBar = this.vopSeekBarAndroid
    const loc = await seekBar.getLocation()
    const size = await seekBar.getSize()
    const { width } = await browser.getWindowRect()

    const y = Math.round(loc.y + size.height * 0.5)
    const startX = Math.round(loc.x + size.width * 0.1)
    const endX = Math.max(startX + 260, Math.round(width - 30))

    for (let i = 0; i < 3; i++) {
      try {
        await browser.performActions([
          {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x: startX, y },
              { type: 'pointerDown', button: 0 },
              { type: 'pause', duration: 250 },
              { type: 'pointerMove', duration: 1100, x: endX, y },
              { type: 'pointerUp', button: 0 },
            ],
          },
        ])
        await browser.releaseActions().catch(() => {})

        const gone = await browser.waitUntil(
          async () => !(await this.vopScreenAndroid.isExisting().catch(() => true)),
          { timeout: 5000, interval: 500 }
        ).catch(() => false)

        if (gone) return
      } catch {
        // retry
      }
    }

    throw new Error('VOP slider: failed to complete after 3 attempts')
  }

  private async slideToConfirmIOS() {
    await this.vopSliderIOS.waitForExist({ timeout: 15000, timeoutMsg: 'VOP slider not found on iOS' })
    await this.vopSliderIOS.click()
  }
}

export default new VopPage()
