import { AUTH } from '../data/credentials'
import { loginPage } from '../pages/LoginPage'
import home from '../pages/HomeScreenPage'
import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'

describe('Signed-in Support', function () {
  const step = stopAfterFailedStep()
  let greeting: string

  before(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('[TC2856] Shows the signed-in Support greeting and options', step(async function () {
    greeting = await home.verifySignedInSupportOptions()
  }))

  it('[TC2871] Shows the same Support options from Cards', step(async function () {
    await home.verifySupportFromCards(greeting)
  }))

  it('[TC2864] Opens FAQ without a Contact Us entry', step(async function () {
    await home.verifySupportFaqOpens()
  }))
})
