const DEFAULT_MT_TEST_IBANS = [
  'MT31MALT01100000000000000000123',
  'MT66CCUH32001100300020001099989',
  'MT27MMEB44060000000006029946050'
]

// Генерація валідного Maltese IBAN, який не входить у списки вже створених/виключених
function generateRandomMalteseIban(exclude: Set<string>): string {
  // MT IBAN: MTkk + 4-char bank code + 5-digit sort code + 18-char account.
  // Keep the bank/sort stable and randomize only the account part.
  const country = 'MT'
  const bank = 'CCUH'
  const sortCode = '32001'
  const accountLength = 18
  let attempt = 0
  while (attempt < 1000) {
    const account = String(Math.floor(Math.random() * Math.pow(10, accountLength))).padStart(accountLength, '0')
    // Рахуємо контрольне число
    const rearranged = `${bank}${sortCode}${account}${country}00`
    const numeric = ibanToNumeric(rearranged)
    const mod = mod97(numeric)
    const checkDigits = String(98 - mod).padStart(2, '0')
    const iban = `${country}${checkDigits}${bank}${sortCode}${account}`
    const normalized = normalizeIban(iban)
    if (isValidIban(normalized) && !exclude.has(normalized)) {
      return normalized
    }
    attempt++
  }
  throw new Error('Не вдалося згенерувати унікальний валідний Maltese IBAN')
}

const ALREADY_CREATED_IBANS = new Set([
 'MT31MALT01100000000000000000123',
  'MT66CCUH32001100300020001099989',
  'MT27MMEB44060000000006029946050'
])

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

export const getMalteseIbanForTest = () => {
  // Використовуємо IBAN із змінної середовища, якщо він валідний і не виключений
  const envExcluded = new Set(
    String(process.env.TEST_MT_IBANS_EXCLUDE || '')
      .split(',')
      .map((v) => normalizeIban(v.trim()))
      .filter((v) => v.length > 0)
  )
  const isAllowed = (iban: string) => {
    const normalized = normalizeIban(iban)
    return !ALREADY_CREATED_IBANS.has(normalized) && !envExcluded.has(normalized)
  }
  const fromSingleEnv = normalizeIban(String(process.env.TEST_MT_IBAN || '').trim())
  if (fromSingleEnv && isValidIban(fromSingleEnv) && isAllowed(fromSingleEnv)) {
    return fromSingleEnv
  }
  const fromListEnv = String(process.env.TEST_MT_IBANS || '')
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
    .filter(isValidIban)
    .map(normalizeIban)
    .filter(isAllowed)
  const source = (fromListEnv.length ? fromListEnv : DEFAULT_MT_TEST_IBANS)
    .map(normalizeIban)
    .filter(isValidIban)
    .filter(isAllowed)
  const uniqueSource = Array.from(new Set(source))
  if (uniqueSource.length) {
    const forcedIndexRaw = String(process.env.TEST_MT_IBAN_INDEX || '').trim()
    if (forcedIndexRaw.length > 0) {
      const indexRaw = Number(forcedIndexRaw)
      const index = Math.abs(Number.isFinite(indexRaw) ? indexRaw : 0) % uniqueSource.length
      return uniqueSource[index]
    }
    const index = Math.floor(Math.random() * uniqueSource.length)
    return uniqueSource[index]
  }
  // Якщо пул IBAN-ів вичерпано — генеруємо новий
  const exclude = new Set([
    ...ALREADY_CREATED_IBANS,
    ...envExcluded,
    ...DEFAULT_MT_TEST_IBANS.map(normalizeIban),
    ...fromListEnv,
  ])
  return generateRandomMalteseIban(exclude)
}
