import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import crypto from '../../../pages/CryptoPage'
import { AUTH } from '../../../data/credentials'

describe('Crypto (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 900000))
  const step = stopAfterFailedStep()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
    await crypto.openCryptoTab()
    await crypto.clearWatchlist()
  })

  it('CR-1 [CRYPTO-009/014] Empty portfolio hides holdings and shows the empty watchlist', step(async function () {
    await crypto.verifyEmptyPortfolioState()
    await crypto.verifyEmptyWatchlistWidget()
  }))

  it('CR-2 [CRYPTO-012/013] Trade widget switches and Trending shows five assets', step(async function () {
    await crypto.verifyTradeWidgetSwitches()
    await crypto.verifyTrendingTopFive()
  }))

  it('CR-3 [CRYPTO-007/024] Valuation currency picker offers EUR, GBP and USD', step(async function () {
    await crypto.verifyValuationCurrencies()
  }))

  it('CR-4 [CRYPTO-019/020] All Crypto search matches code or name and shows nothing for nonsense', step(async function () {
    await crypto.openAllCrypto()
    await crypto.verifyAllCryptoSearch()
  }))

  it('CR-4b [CRYPTO-021] All Crypto sorts by Volume by default and by Price both ways', step(async function () {
    await crypto.verifyAllCryptoSort()
  }))

  it('CR-5 [CRYPTO-022/027] Details has no My Holding and Buy opens the Buy screen', step(async function () {
    await crypto.openBitcoinDetailsWithoutHolding()
    await crypto.openBuyFromDetails()
  }))

  it('CR-6 [CRYPTO-032] Buy estimate and swap', step(async function () {
    await crypto.verifyBuyEstimateAndSwap()
  }))

  it('CR-7 [CRYPTO-044/045] Settlement wallet picker selects USD and All Wallets', step(async function () {
    await crypto.verifySettlementWalletPicker()
    await crypto.closeBuy()
  }))

  it('CR-8 [CRYPTO-023] Watchlist star adds and removes the asset', step(async function () {
    await crypto.openAllCrypto()
    await crypto.verifyWatchlistStarToggle()
  }))

  it('CR-9 [CRYPTO-048/049] Watchlist search filters and swipe removes the asset', step(async function () {
    await crypto.verifyWatchlistSearchAndSwipeDelete()
  }))
})
