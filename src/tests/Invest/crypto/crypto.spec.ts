import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import crypto from '../../../pages/CryptoPage'
import { AUTH } from '../../../data/credentials'

// One login runs the whole tab in order: each block leaves the app where the next one starts.
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

  describe('Crypto Home', function () {
    it('Avatar opens the account menu [CRYPTO-001]', step(async function () {
      await crypto.verifyAccountMenuFromAvatar(AUTH.individualAccountCode || 'VEG40002')
    }))

    it('No crypto: holdings are hidden and the watchlist is empty [CRYPTO-009, CRYPTO-014]', step(async function () {
      await crypto.verifyEmptyPortfolioState()
      await crypto.verifyEmptyWatchlistWidget()
    }))

    it('Trade widget switches Gainers/Losers and 1H/24H; Trending shows 5 assets [CRYPTO-012, CRYPTO-013]', step(async function () {
      await crypto.verifyTradeWidgetSwitches()
      await crypto.verifyTrendingTopFive()
    }))

    it('Valuation currency picker offers only EUR, GBP and USD [CRYPTO-007, CRYPTO-024]', step(async function () {
      await crypto.verifyValuationCurrencies()
    }))
  })

  describe('All Crypto list', function () {
    it('Search finds Bitcoin by code or name in any case, and nothing for nonsense [CRYPTO-019, CRYPTO-020]', step(async function () {
      await crypto.openAllCrypto()
      await crypto.verifyAllCryptoSearch()
    }))

    it('Sort is Volume descending by default; Price reorders both ways [CRYPTO-021]', step(async function () {
      await crypto.verifyAllCryptoSort()
    }))
  })

  describe('Asset details and Buy', function () {
    it('Bitcoin details show no My Holding; Buy opens "Buy Bitcoin" [CRYPTO-022, CRYPTO-027]', step(async function () {
      await crypto.openBitcoinDetailsWithoutHolding()
      await crypto.openBuyFromDetails()
    }))

    it('€100 shows a BTC estimate; swap moves the estimate into the input [CRYPTO-032]', step(async function () {
      await crypto.verifyBuyEstimateAndSwap()
    }))

    it('Amount keeps 2 decimals in EUR and 8 decimals in BTC [CRYPTO-035]', step(async function () {
      await crypto.verifyAmountPrecision()
    }))

    it('Settlement wallet picker selects USD, then All Wallets [CRYPTO-044, CRYPTO-045]', step(async function () {
      await crypto.verifySettlementWalletPicker()
      await crypto.closeBuy()
    }))
  })

  describe('Watchlist', function () {
    it('Star on Bitcoin details adds it to the watchlist and removes it again [CRYPTO-023]', step(async function () {
      await crypto.openAllCrypto()
      await crypto.verifyWatchlistStarToggle()
    }))

    it('Add to watchlist screen adds and removes Ethereum / Euro [CRYPTO-047]', step(async function () {
      await crypto.verifyAddToWatchlistToggle()
    }))

    it('Search filters the watchlist; swipe and OK removes Bitcoin [CRYPTO-048, CRYPTO-049]', step(async function () {
      await crypto.verifyWatchlistSearchAndSwipeDelete()
    }))
  })
})
