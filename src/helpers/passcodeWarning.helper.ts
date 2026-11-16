import { $, $$, browser } from '@wdio/globals'

const ANDROID_DIALOG = '//*[@resource-id="android:id/parentPanel" or contains(@resource-id,":id/parentPanel") or @class="android.app.Dialog"]'
const lower = (attribute: string) => `translate(${attribute},"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")`

export function passcodeWarning() {
  return browser.isIOS
    ? $('-ios predicate string:type == "XCUIElementTypeAlert"')
    : $(ANDROID_DIALOG)
}

// One full selector per child: a chained `dialog.$()` binds to the dialog found when it was created,
// which is empty if the dialog had not appeared yet, so later waits fail with "Can't call $".
export function passcodeWarningAction(label: 'ok' | 'change it' | 'keep it') {
  return browser.isIOS
    ? $(`-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeButton[\`label ==[c] "${label}"\`]`)
    : $(`(${ANDROID_DIALOG})//*[${lower('@text')}="${label}"]`)
}

function passcodeWarningMessage(text: string) {
  return browser.isIOS
    ? $(`-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText[\`label CONTAINS[c] "${text}"\`]`)
    : $(`(${ANDROID_DIALOG})//*[contains(${lower('@text')},"${text}")]`)
}

export async function dismissTooEasyPasscodeWarning() {
  const alert = passcodeWarning()
  await alert.waitForDisplayed({ timeout: 10000 })
  await passcodeWarningMessage('too easy').waitForDisplayed({ timeout: 10000 })

  const buttons = browser.isIOS
    ? $$('-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeButton')
    : $$(`(${ANDROID_DIALOG})//android.widget.Button`)
  const labels = await buttons.map(button => browser.isIOS ? button.getAttribute('label') : button.getText())
  if (labels.length !== 1 || labels[0].toLowerCase() !== 'ok') {
    throw new Error(`A too-easy passcode must expose only OK, got: ${labels.join(', ') || 'no buttons'}`)
  }
  await passcodeWarningAction('ok').click()
  await alert.waitForDisplayed({ reverse: true, timeout: 10000 })
}
