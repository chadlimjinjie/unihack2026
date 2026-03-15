import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * Uses Vercel AI SDK to generate a one-line insight for the busiest court.
 * Falls back to a simple string if OPENAI_API_KEY is missing or the call fails.
 */
export async function getBusiestCourtInsight(
  courtName: string | null,
  playerLive: bigint | number | null
): Promise<string | null> {
  const name = courtName ?? "This court"
  const count = playerLive == null ? 0 : Number(playerLive)
  if (!process.env.OPENAI_API_KEY) {
    return count > 0 ? `${name} — ${count} people on court right now` : null
  }
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `In one short sentence (under 15 words), describe that the court "${name}" is the busiest right now with ${count} people on it. Be casual and friendly. No quotes.`,
      maxOutputTokens: 50,
    })
    return text?.trim() ?? (count > 0 ? `${name} — ${count} people on court right now` : null)
  } catch {
    return count > 0 ? `${name} — ${count} people on court right now` : null
  }
}
