import axios from 'axios'
import { $, browser } from '@wdio/globals'
import { randomUUID } from 'node:crypto'
import BasePage from './BasePage'

export default class ThreeDSPage extends BasePage {
  // ─── SOAP trigger ───────────────────────────────────────────────

  private buildSoapBody(matchKey: string, nrn: string, tranId: string, amount: string): string {
    const contractExtRid = process.env.TDS_CONTRACT_EXT_RID
    const cardId         = process.env.TDS_CARD_ID          || '17528'
    const acquirerRid    = process.env.TDS_ACQUIRER_RID     || '840109112768'
    const currency       = process.env.TDS_CURRENCY         || 'EUR'
    const localTime      = new Date().toISOString().replace(/\.\d{3}Z$/, '')

    if (!contractExtRid) {
      throw new Error('[3DS2] TDS_CONTRACT_EXT_RID env var is required for the active card account')
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope
    xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns="http://schemas.tranzaxis.com/tran.wsdl">
    <SOAP-ENV:Body>
        <Tran>
            <t:Request
                xmlns:ct="http://schemas.tranzaxis.com/common-types.xsd"
                xmlns:t="http://schemas.tranzaxis.com/tran.xsd"
                xmlns:tc="http://schemas.tranzaxis.com/tran-common.xsd" InitiatorRid="FS_Auth" Kind="TdsProcessAuth" LifePhase="Single" LocalTime="${localTime}" UndoState="Normal" OriginatorDay="2024-03-25T00:00:00.000" Version="3.2.35.10.10">
                <t:Parties>
                    <t:Cust Presence="true" ContractExtRid="${contractExtRid}">
                        <t:Token Kind="ExtAuthApp" ExtRid="${contractExtRid}">
                            <tc:ExtAuthApp/>
                        </t:Token>
                        <t:Token Kind="Card" Id="${cardId}"/>
                    </t:Cust>
                    <t:Term AcquirerRid="${acquirerRid}">
                        <t:Caps Interactive="true"/>
                        <t:Owner Country="470" Rid="${acquirerRid}004271594" Title="NDM" Url="https://example.com/3ds-requestor-url"/>
                    </t:Term>
                </t:Parties>
                <t:Match LinkageKind="Normal" Key="${matchKey}" Rrn="240325434964481163" Nrn="${nrn}" AcquirerRid="${acquirerRid}"/>
                <t:Moneys>
                    <t:Cust Amt="${amount}" Ccy="${currency}"/>
                </t:Moneys>
                <t:Specific>
                    <t:Tds Version="2.2.0">
                        <t:TranDetails TdsReqAppUrl="https://ndm-app.netcetera.com/store?transID=${tranId}"/>
                        <t:Extensions>
                            <t:Extension criticalityIndicator="false" id="A000000004-merchantData" name="Merchant Data">{"A000000004-merchantData":{"acquirerCountryCode":"528"}}</t:Extension>
                            <t:Extension criticalityIndicator="false" id="A000000004-acsRBA" name="ACS RBA">{"A000000004-acsRBA":{"status":"Success","decision":"Low Risk","score":"250","reasonCode1":"O","reasonCode2":"GG"}}</t:Extension>
                        </t:Extensions>
                    </t:Tds>
                </t:Specific>
            </t:Request>
        </Tran>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`
  }

  public async triggerChallenge(): Promise<{ matchKey: string; amount: string }> {
    const url = process.env.TDS_SOAP_URL
    if (!url) throw new Error('[3DS2] TDS_SOAP_URL env var is not set')

    const matchKey = randomUUID()
    const nrn      = randomUUID()
    const tranId   = randomUUID()
    const amount   = (1 + Math.floor(Math.random() * 100) / 100).toFixed(2)

    const headers: Record<string, string> = {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: '',
    }
    const auth = process.env.TDS_SOAP_AUTH
    if (auth) headers['Authorization'] = `Basic ${auth}`

    const timeoutMs = Number(process.env.TDS_SOAP_TIMEOUT_MS || 30000)
    const safeUrl = this.safeUrlForLogs(url)

    console.log(`[3DS2] Sending SOAP trigger request to ${safeUrl} — matchKey: ${matchKey}, amount: ${amount} EUR`)

    let response
    try {
      response = await axios.post(url, this.buildSoapBody(matchKey, nrn, tranId, amount), {
        headers,
        timeout: timeoutMs,
      })
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error(`[3DS2] SOAP trigger request timed out after ${timeoutMs}ms: ${safeUrl}`)
      }

      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const body = error.response?.data
        throw new Error(
          `[3DS2] SOAP trigger request failed${status ? ` with status ${status}` : ''}: ${
            typeof body === 'string' ? body : error.message
          }`
        )
      }

      throw error
    }

    console.log(`[3DS2] SOAP response status: ${response.status}`)
    console.log(`[3DS2] SOAP response body: ${typeof response.data === 'string' ? response.data : JSON.stringify(response.data)}`)

    if (response.status !== 200) {
      throw new Error(`[3DS2] SOAP trigger failed with status ${response.status}: ${response.data}`)
    }

    console.log(`[3DS2] Challenge triggered — matchKey: ${matchKey}, amount: ${amount} EUR`)
    return { matchKey, amount }
  }

  private safeUrlForLogs(url: string) {
    try {
      const parsed = new URL(url)
      parsed.username = ''
      parsed.password = ''
      parsed.search = ''
      parsed.hash = ''
      return parsed.toString()
    } catch {
      return '<invalid TDS_SOAP_URL>'
    }
  }

  // ─── Push notification ───────────────────────────────────────────

  public async openChallengeFromNotification(timeoutMs = 45000): Promise<void> {
    if (browser.isAndroid) {
      await browser.execute('mobile: openNotifications')
      const notification = await browser.waitUntil(
        async () => {
          for (const sel of [
            'android=new UiSelector().textContains("3DS")',
            'android=new UiSelector().textContains("authentication")',
            'android=new UiSelector().textContains("Moneybase")',
          ]) {
            const el = $(sel)
            if (await el.isDisplayed().catch(() => false)) return el
          }
          return undefined
        },
        { timeout: timeoutMs, interval: 1000, timeoutMsg: '[3DS2] Push notification not visible in notification drawer' },
      )
      await notification.click()
      // wait until notification drawer closes and app comes to foreground
      await browser.waitUntil(
        async () => {
          const pkg = await browser.execute('mobile: getCurrentPackage') as string
          return pkg === (process.env.BS_ANDROID_APP_PACKAGE || 'com.moneybase.qa')
        },
        { timeout: 15000, interval: 500, timeoutMsg: '[3DS2] App did not come to foreground after tapping notification' },
      )
      return
    }

    // iOS: pull down notification centre from top edge
    const { width, height } = await browser.getWindowRect()
    await browser.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: Math.round(width / 2), y: 2 },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 600, x: Math.round(width / 2), y: Math.round(height * 0.6) },
        { type: 'pointerUp', button: 0 },
      ],
    }])
    await browser.releaseActions().catch(() => {})

    const iosNotification = await browser.waitUntil(
      async () => {
        for (const text of ['3DS', 'authentication', 'Moneybase']) {
          const el = $(`-ios predicate string:label CONTAINS "${text}" OR name CONTAINS "${text}"`)
          if (await el.isDisplayed().catch(() => false)) return el
        }
        return undefined
      },
      { timeout: timeoutMs, interval: 1000, timeoutMsg: '[3DS2] Push notification not visible in iOS notification centre' },
    )
    await iosNotification.click()
  }

  // ─── 3DS2 screen locators ────────────────────────────────────────
  // NOTE: text-based until page source is available

  private get rejectBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Reject"]]')
  }

  private get approveBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Approve"]]')
  }

  private get mastercardLogoAndroid() {
    return $('android=new UiSelector().descriptionContains("Mastercard")')
  }

  private get pendingTransactionMsgAndroid() {
    return $('android=new UiSelector().textContains("pending")')
  }

  private get cardNumberMaskedAndroid() {
    return $('android=new UiSelector().textMatches(".*\\*{4}.*")')
  }

  private get countdownTimerAndroid() {
    return $('android=new UiSelector().textMatches("[0-9]+:[0-5][0-9]")')
  }

  private get rejectBtnIOS() { return $('~Reject') }
  private get approveBtnIOS() { return $('~Approve') }

  private get rejectBtn()  { return browser.isIOS ? this.rejectBtnIOS  : this.rejectBtnAndroid  }
  private get approveBtn() { return browser.isIOS ? this.approveBtnIOS : this.approveBtnAndroid }

  // ─── Verification methods ────────────────────────────────────────

  public async waitForChallengeScreen(timeoutMs = 30000): Promise<void> {
    await this.rejectBtn.waitForExist({
      timeout: timeoutMs,
      timeoutMsg: '[3DS2] Challenge screen did not appear — Reject button not found',
    })
  }

  public async verifyChallengeHeader(): Promise<void> {
    await this.rejectBtn.waitForExist({ timeout: 5000 })
    if (browser.isAndroid) {
      const logoVisible = await this.mastercardLogoAndroid.isDisplayed().catch(() => false)
      if (!logoVisible) console.warn('[3DS2] Mastercard ID Check logo not found — update locator after page source')
    }
  }

  public async verifyPendingTransactionMessage(): Promise<void> {
    if (browser.isAndroid) {
      await this.pendingTransactionMsgAndroid.waitForExist({
        timeout: 5000,
        timeoutMsg: '[3DS2] Pending transaction message not displayed',
      })
    }
  }

  public async verifyCardSection(): Promise<void> {
    if (browser.isAndroid) {
      const visible = await this.cardNumberMaskedAndroid.isDisplayed().catch(() => false)
      if (!visible) console.warn('[3DS2] Masked card number not found — update locator after page source')
    }
  }

  public async verifyTransactionDetails(amount: string): Promise<void> {
    if (!amount) throw new Error('[3DS2] Cannot verify transaction amount before SOAP trigger succeeds')

    const amountEl = browser.isIOS
      ? $(`-ios predicate string:label CONTAINS "${amount}"`)
      : $(`android=new UiSelector().textContains("${amount}")`)
    await amountEl.waitForExist({
      timeout: 5000,
      timeoutMsg: `[3DS2] Amount ${amount} not visible in transaction details`,
    })
  }

  public async verifyCountdownTimer(): Promise<void> {
    if (browser.isAndroid) {
      await this.countdownTimerAndroid.waitForExist({
        timeout: 10000,
        timeoutMsg: '[3DS2] Countdown timer not displayed',
      })
    }
  }

  public async verifyActionButtons(): Promise<void> {
    await this.approveBtn.waitForExist({ timeout: 5000, timeoutMsg: '[3DS2] Approve button not visible' })
    await this.rejectBtn.waitForExist({ timeout: 5000, timeoutMsg: '[3DS2] Reject button not visible' })
  }

  public async approve(): Promise<void> {
    await this.tap(this.approveBtn, 10000)
  }

  public async reject(): Promise<void> {
    await this.tap(this.rejectBtn, 10000)
  }
}
