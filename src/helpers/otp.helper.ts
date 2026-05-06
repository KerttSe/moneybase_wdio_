import axios from 'axios'

type OtpFetchParams = {
	phone: string
	timeoutMs?: number
	intervalMs?: number
	maxRequests?: number
}

export class OtpHelper {
	private static normalizeOtpMaxAgeSeconds(value: unknown) {
		const parsed = Number(value)
		if (!Number.isFinite(parsed)) return 60
		return Math.min(60, Math.max(30, Math.floor(parsed)))
	}

	private static parseTimestamp(value: unknown): number | null {
		if (value == null) return null

		if (typeof value === 'number') {
			if (!Number.isFinite(value)) return null
			const ms = value > 1e12 ? value : value * 1000
			return Number.isFinite(ms) ? ms : null
		}

		if (typeof value === 'string') {
			const trimmed = value.trim()
			if (!trimmed) return null

			if (/^\d{10,13}$/.test(trimmed)) {
				const numeric = Number(trimmed)
				if (Number.isFinite(numeric)) {
					const ms = numeric > 1e12 ? numeric : numeric * 1000
					return Number.isFinite(ms) ? ms : null
				}
			}

			const iso = Date.parse(trimmed)
			if (!Number.isNaN(iso)) return iso
		}

		return null
	}

	private static normalizeDigits(value: string) {
		return String(value ?? '').replace(/\D/g, '')
	}

	private static buildRequestHeaders(): Record<string, string> {
		const headers: Record<string, string> = {
			'cache-control': 'no-cache',
			pragma: 'no-cache',
			accept: '*/*',
		}

		const authToken = String(process.env.OTP_API_AUTH_TOKEN || '').trim()
		if (authToken) {
			headers.authorization = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`
		}

		const cookie = String(process.env.OTP_API_COOKIE || '').trim()
		if (cookie) {
			headers.cookie = cookie
		}

		const headersJsonRaw = String(process.env.OTP_API_HEADERS_JSON || '').trim()
		if (headersJsonRaw) {
			try {
				const parsed = JSON.parse(headersJsonRaw) as Record<string, unknown>
				for (const [key, value] of Object.entries(parsed)) {
					if (value == null) continue
					headers[key.toLowerCase()] = String(value)
				}
			} catch {
				// Ignore malformed JSON; defaults still apply
			}
		}

		return headers
	}

	private static buildPhoneCandidate(rawPhone: string) {
		const countryCode = this.normalizeDigits(process.env.OTP_COUNTRY_CODE || '356')

		const source = String(process.env.OTP_PHONE || rawPhone || '')
			.trim()
			.replace(/^\+/, '')
		const digits = this.normalizeDigits(source)

		const withCountry = digits.startsWith(countryCode) ? digits : `${countryCode}${digits}`
		const localPart = withCountry.startsWith(countryCode) ? withCountry.slice(countryCode.length) : digits
		const groupedLocal4 = localPart.length >= 8 ? `${localPart.slice(0, 4)} ${localPart.slice(4)}`.trim() : localPart

		// Strict single format to match working curl endpoint: "356 9901 1190"
		return `${countryCode} ${groupedLocal4}`.trim()
	}

	private static buildUrl(phoneCandidate: string) {
		const template = String(process.env.OTP_GET_LATEST_URL || '').trim()
		const baseUrl = String(process.env.OTP_API_BASE_URL || '').trim().replace(/\/$/, '')

		if (!template && !baseUrl) {
			throw new Error('OTP endpoint is not configured. Set OTP_GET_LATEST_URL or OTP_API_BASE_URL')
		}

		const encodedPhone = encodeURIComponent(phoneCandidate)

		if (template) {
			return template.includes('{phone}')
				? template.replace('{phone}', encodedPhone)
				: template
		}

		return `${baseUrl}/otp/otp/getLatest/${encodedPhone}`
	}

	private static extractOtp(payload: unknown, maxAgeSeconds: number) {
		const normalizeSixDigits = (value: unknown) => {
			const digits = String(value ?? '').replace(/\D/g, '')
			return digits.length === 6 ? digits : null
		}

		type OtpCandidate = {
			code: string
			timestampMs: number | null
		}

		const candidates: OtpCandidate[] = []

		const collectFromObject = (obj: Record<string, unknown>) => {
			const otpKeys = [/^token$/i, /^otp$/i, /^otpCode$/i, /^verificationCode$/i, /^code$/i]
			const tsKeys = [
				/^createdAt$/i,
				/^created_at$/i,
				/^creationDateUtc$/i,
				/^createdDateUtc$/i,
				/^timestamp$/i,
				/^timeStamp$/i,
				/^sentAt$/i,
				/^sent_at$/i,
				/^expiryDateUtc$/i,
				/^updatedAt$/i,
				/^updated_at$/i,
			]

			let timestampMs: number | null = null
			for (const [key, value] of Object.entries(obj)) {
				if (tsKeys.some((rx) => rx.test(key))) {
					const parsedTs = this.parseTimestamp(value)
					if (parsedTs != null) {
						timestampMs = parsedTs
						break
					}
				}
			}

			for (const [key, value] of Object.entries(obj)) {
				if (otpKeys.some((rx) => rx.test(key))) {
					const direct = normalizeSixDigits(value)
					if (direct) {
						candidates.push({ code: direct, timestampMs })
					}
				}
			}
		}

		const textCandidates: string[] = []

		const visit = (node: unknown): void => {
			if (node == null) return

			if (typeof node === 'string') {
				const lower = node.toLowerCase()
				if (lower.includes('<html') || lower.includes('<!doctype html')) return

				const keyed = node.match(/["']?token["']?\s*[:=]\s*["']?(\d{6})["']?/i)
				if (keyed?.[1]) textCandidates.push(keyed[1])

				const otpLike = node.match(/["']?(otp|code|verificationCode)["']?\s*[:=]\s*["']?(\d{6})["']?/i)
				if (otpLike?.[2]) textCandidates.push(otpLike[2])

				return
			}

			if (Array.isArray(node)) {
				for (const item of node) {
					visit(item)
				}
				return
			}

			if (typeof node === 'object') {
				const obj = node as Record<string, unknown>
				collectFromObject(obj)

				for (const value of Object.values(obj)) {
					visit(value)
				}
			}
		}

		visit(payload)

		const withTimestamp = candidates.filter((c) => c.timestampMs != null) as Array<{ code: string; timestampMs: number }>
		if (withTimestamp.length === 0) {
			const lastCandidate = candidates[candidates.length - 1]
			if (lastCandidate?.code) return lastCandidate.code

			const lastTextCandidate = textCandidates[textCandidates.length - 1]
			return lastTextCandidate ?? null
		}

		withTimestamp.sort((a, b) => b.timestampMs - a.timestampMs)

		const latest = withTimestamp[0]
		if (!latest) {
			const lastTextCandidate = textCandidates[textCandidates.length - 1]
			return lastTextCandidate ?? null
		}

		// Time freshness check is intentionally disabled: always use latest available token.
		return latest.code
	}

	static async getLatestOtp(params: OtpFetchParams): Promise<string> {
		const timeoutMs = params.timeoutMs ?? Number(process.env.OTP_TIMEOUT_MS || 15000)
		const requestHeaders = this.buildRequestHeaders()

		const phoneCandidate = this.buildPhoneCandidate(params.phone)
		const url = this.buildUrl(phoneCandidate)

		const response = await axios.get(url, {
			headers: requestHeaders,
			timeout: Math.max(1000, timeoutMs),
			validateStatus: () => true,
		})

		if (response.status !== 200) {
			throw new Error(`OTP request failed. URL: ${url}. Status: ${response.status}`)
		}

		const token = String((response.data as Record<string, unknown> | undefined)?.token ?? '').replace(/\D/g, '')
		if (token.length !== 6) {
			throw new Error(`OTP token is missing or invalid in response. URL: ${url}`)
		}

		return token
	}
}

export default OtpHelper
