const normalizeIban = (iban: string) => String(iban || '').replace(/\s+/g, '').toUpperCase()

const ibanToNumeric = (value: string) =>
  value
    .toUpperCase()
    .replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55))

const mod97 = (numeric: string) => {
  let remainder = 0
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97
  }
  return remainder
}

export const isValidIban = (iban: string) => {
  const normalized = normalizeIban(iban)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(normalized)) return false
  if (normalized.length < 15 || normalized.length > 34) return false

  const rearranged = `${normalized.slice(4)}${normalized.slice(0, 4)}`
  return mod97(ibanToNumeric(rearranged)) === 1
}

export const getMalteseIbanForTest = (): string => {
  const country = 'MT'
  const bank = 'CCUH'
  const sortCode = '32001'
  const accountLength = 18

  for (let attempt = 0; attempt < 1000; attempt++) {
    const account = String(Math.floor(Math.random() * Math.pow(10, accountLength))).padStart(accountLength, '0')
    const rearranged = `${bank}${sortCode}${account}${country}00`
    const numeric = ibanToNumeric(rearranged)
    const mod = mod97(numeric)
    const checkDigits = String(98 - mod).padStart(2, '0')
    const iban = normalizeIban(`${country}${checkDigits}${bank}${sortCode}${account}`)
    if (isValidIban(iban)) return iban
  }

  throw new Error('Failed to generate a valid Maltese IBAN')
}
