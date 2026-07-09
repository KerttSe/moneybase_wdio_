export const getUSAccountNumberForTest = (): string => {
  const length = 10
  return String(Math.floor(Math.random() * Math.pow(10, length))).padStart(length, '0')
}
