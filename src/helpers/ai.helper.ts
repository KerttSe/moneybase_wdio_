import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const CACHE_FILE = resolve(process.cwd(), '.heal-cache.json')
const HEAL_REPORT_FILE = resolve(process.cwd(), 'heal-report.json')
const sessionCache = new Map<string, string>()

export type HealEvent = {
  originalSelector: string
  healedSelector: string
  platform: string
  method: 'vision' | 'pageSource'
  timestamp: string
}

const sessionHeals: HealEvent[] = []

function loadFileCache(): Record<string, string> {
  if (!existsSync(CACHE_FILE)) return {}
  try { return JSON.parse(readFileSync(CACHE_FILE, 'utf-8')) } catch { return {} }
}

function saveToFileCache(key: string, selector: string) {
  try {
    const cache = loadFileCache()
    cache[key] = selector
    writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
  } catch {}
}

export function saveHealReport() {
  if (sessionHeals.length === 0) return
  try {
    writeFileSync(HEAL_REPORT_FILE, JSON.stringify(sessionHeals, null, 2))
    console.log(`\n[AI Heal] 📊 Heal report saved → heal-report.json (${sessionHeals.length} heals)`)
    console.log('[AI Heal] Update these page object selectors:')
    sessionHeals.forEach(h => {
      console.log(`  ${h.platform}: "${h.originalSelector}"  →  "${h.healedSelector}"`)
    })
  } catch {}
}

export function getSessionHeals(): HealEvent[] {
  return [...sessionHeals]
}

const IOS_GUIDE = `iOS WebdriverIO selectors (pick best fit):
- ~accessibilityId                                           e.g. ~submit_button
- -ios predicate string:name == "x"                         e.g. -ios predicate string:name == "submit_button"
- -ios predicate string:type == "XCUIElementTypeButton" AND label == "x"
- //XCUIElementType...[@name="x"]                           XPath fallback`

const ANDROID_GUIDE = `Android WebdriverIO selectors (pick best fit):
- android=new UiSelector().resourceId("com.pkg:id/name")
- android=new UiSelector().text("Exact text")
- android=new UiSelector().description("content-desc")
- //android.widget.Button[@text="x"]                        XPath fallback`

async function healViaVision(
  client: Anthropic,
  originalSelector: string,
  screenshot: string,
  platform: 'ios' | 'android'
): Promise<string | null> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 128,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/png', data: screenshot }
        },
        {
          type: 'text',
          text: `You are a test automation expert. An element with selector "${originalSelector}" was not found.

Look at the screenshot and find the element that the selector was trying to target.
Return ONLY the WebdriverIO selector string — no explanation, no quotes, no markdown.

${platform === 'ios' ? IOS_GUIDE : ANDROID_GUIDE}`
        }
      ]
    }]
  })
  return (response.content[0] as { type: 'text'; text: string }).text.trim() || null
}

async function healViaPageSource(
  client: Anthropic,
  originalSelector: string,
  pageSource: string,
  platform: 'ios' | 'android'
): Promise<string | null> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 128,
    messages: [{
      role: 'user',
      content: `Find the element in page source. Return ONLY the WebdriverIO selector string — no explanation, no quotes, no markdown.

Failed selector: ${originalSelector}
Platform: ${platform}

${platform === 'ios' ? IOS_GUIDE : ANDROID_GUIDE}

Page source (first 6000 chars):
${pageSource.slice(0, 6000)}`
    }]
  })
  return (response.content[0] as { type: 'text'; text: string }).text.trim() || null
}

export async function healSelector(
  originalSelector: string,
  pageSource: string,
  platform: 'ios' | 'android',
  screenshot?: string
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null

  const cacheKey = `${platform}:${originalSelector}`

  if (sessionCache.has(cacheKey)) {
    console.log(`[AI Heal] 💾 session cache: ${originalSelector}`)
    return sessionCache.get(cacheKey)!
  }

  const fileCache = loadFileCache()
  if (fileCache[cacheKey]) {
    console.log(`[AI Heal] 📁 file cache: ${originalSelector}`)
    sessionCache.set(cacheKey, fileCache[cacheKey])
    return fileCache[cacheKey]
  }

  console.log(`[AI Heal] 🤖 asking Claude for: ${originalSelector}`)

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    let healed: string | null = null
    let method: HealEvent['method'] = 'pageSource'

    // Vision first — more accurate if screenshot available
    if (screenshot) {
      healed = await healViaVision(client, originalSelector, screenshot, platform).catch(() => null)
      if (healed && healed !== originalSelector) {
        method = 'vision'
      } else {
        healed = null
      }
    }

    // Fallback to page source
    if (!healed) {
      healed = await healViaPageSource(client, originalSelector, pageSource, platform).catch(() => null)
    }

    if (!healed || healed === originalSelector) return null

    sessionCache.set(cacheKey, healed)
    saveToFileCache(cacheKey, healed)

    const event: HealEvent = {
      originalSelector,
      healedSelector: healed,
      platform,
      method,
      timestamp: new Date().toISOString(),
    }
    sessionHeals.push(event)

    console.log(`[AI Heal] ✅ [${method}] ${originalSelector}  →  ${healed}`)
    return healed
  } catch (err) {
    console.warn('[AI Heal] ⚠️ Claude call failed:', (err as Error).message)
    return null
  }
}
