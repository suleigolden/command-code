import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error("Missing ANTHROPIC_API_KEY in environment.");
}

export const anthropic = new Anthropic({ apiKey });

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";