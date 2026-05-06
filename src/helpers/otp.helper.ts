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
		const timeoutMs = params.timeoutMs ?? Number(process.env.OTP_TIMEOUT_MS || 90000)
		const intervalMs = params.intervalMs ?? Number(process.env.OTP_POLL_INTERVAL_MS || 2000)
		const requestDelayMsRaw = Number(process.env.OTP_REQUEST_DELAY_MS || Math.max(intervalMs, 8000))
		const requestDelayMs = Number.isFinite(requestDelayMsRaw) && requestDelayMsRaw > 0
			? Math.floor(requestDelayMsRaw)
			: Math.max(intervalMs, 8000)
		const maxAgeSeconds = this.normalizeOtpMaxAgeSeconds(process.env.OTP_MAX_AGE_SECONDS || 60)
		const maxRequestsRaw = params.maxRequests ?? Number(process.env.OTP_MAX_REQUESTS || 0)
		const maxRequests = Number.isFinite(maxRequestsRaw) && maxRequestsRaw > 0 ? Math.floor(maxRequestsRaw) : Number.POSITIVE_INFINITY
		const requestHeaders = this.buildRequestHeaders()

		const phoneCandidate = this.buildPhoneCandidate(params.phone)
		const url = this.buildUrl(phoneCandidate)

		const deadline = Date.now() + timeoutMs
		let lastStatus: number | undefined
		let lastBody = ''
		let lastUrl = ''
		let requestCount = 0
		let lastRequestAt = 0

		while (Date.now() < deadline && requestCount < maxRequests) {
			if (requestCount >= maxRequests) break

			const now = Date.now()
			if (lastRequestAt > 0) {
				const elapsed = now - lastRequestAt
				if (elapsed < requestDelayMs) {
					await new Promise((resolve) => setTimeout(resolve, requestDelayMs - elapsed))
				}
			}
			lastRequestAt = Date.now()

			requestCount += 1

			try {
				const response = await axios.get(url, {
					headers: requestHeaders,
					responseType: 'text',
					transformResponse: [(data) => data],
					timeout: Math.min(intervalMs, 10000),
					validateStatus: () => true,
				})

				const bodyText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data ?? '')
				lastStatus = response.status
				lastBody = bodyText
				lastUrl = url

				let payload: unknown = bodyText
				try {
					payload = JSON.parse(bodyText)
				} catch {
					// Keep raw text when response is not JSON
				}

				const otp = this.extractOtp(payload, maxAgeSeconds)
				if (otp) {
					return otp
				}
			} catch (error) {
				lastUrl = url
				if (axios.isAxiosError(error)) {
					lastStatus = error.response?.status
					lastBody = String(error.response?.data ?? error.message)
				} else {
					lastBody = String((error as Error)?.message || error)
				}
			}

			if (requestCount >= maxRequests) break
			await new Promise((resolve) => setTimeout(resolve, intervalMs))
		}

		throw new Error(
			`OTP token was not received in ${timeoutMs}ms after ${requestCount} request(s). Max age: ${maxAgeSeconds}s. Last URL: ${lastUrl}. Last status: ${String(lastStatus)}. Last body: ${lastBody.slice(0, 500)}`
		)
	}
}

export default OtpHelper
