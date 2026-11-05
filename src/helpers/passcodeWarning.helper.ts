import { $, browser } from '@wdio/globals'

export function passcodeWarning() {
  return browser.isIOS
    ? $('-ios predicate string:type == "XCUIElementTypeAlert"')
    : $('//*[@resource-id="android:id/parentPanel" or @class="android.app.Dialog"]')
}

export function passcodeWarningAction(label: 'ok' | 'change it' | 'keep it') {
  const attribute = browser.isIOS ? '@label' : '@text'
  const tag = browser.isIOS ? 'XCUIElementTypeButton' : '*'
  const normalized = `translate(${attribute},"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")`
  return passcodeWarning().$(`.//${tag}[${normalized}="${label}"]`)
}

export async function dismissTooEasyPasscodeWarning() {
  const alert = passcodeWarning()
  const attribute = browser.isIOS ? '@label' : '@text'
  const message = alert.$(`.//*[contains(translate(${attribute},"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"too easy")]`)
  await message.waitForDisplayed({ timeout: 10000 })

  const buttons = alert.$$(browser.isIOS ? './/XCUIElementTypeButton' : './/android.widget.Button')
  const labels = await buttons.map(button => browser.isIOS ? button.getAttribute('label') : button.getText())
  if (labels.length !== 1 || labels[0].toLowerCase() !== 'ok') {
    throw new Error('A too-easy passcode must expose only OK')
  }
  await passcodeWarningAction('ok').click()
  await alert.waitForDisplayed({ reverse: true, timeout: 10000 })
}
