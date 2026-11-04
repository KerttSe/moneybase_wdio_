import { getMalteseIbanForTest, isValidIban } from './ibans'

export function beneficiaryValidationData() {
  const iban = getMalteseIbanForTest()
  const invalidChecksum = `${iban.slice(0, -1)}${(Number(iban.at(-1)) + 1) % 10}`
  const foreignIban = 'DE89370400440532013000'
  if (iban.length !== 31 || !isValidIban(iban) || isValidIban(invalidChecksum) || !isValidIban(foreignIban)) {
    throw new Error('CONFIGURATION_ERROR: invalid beneficiary validation fixtures')
  }
  return {
    name: 'Automation', surname: 'Validation', iban, bic: 'CCUHMTMTXXX',
    shortIban: iban.slice(0, -1), invalidChecksum, foreignIban,
  }
}
