
export interface AuthData {
  country: string
  phone: string
  pin: string
}

export const AUTH: AuthData = {
  country: process.env.MB_COUNTRY || 'Malta',
  phone: process.env.MB_PHONE || '99011190',
  pin: process.env.MB_PIN || '2468',
}
