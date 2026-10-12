import { createGateway } from "ai";

export const gateway = createGateway({
  baseURL: process.env.AI_GATEWAY_BASE_URL,
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

export const MODELS = {
  /** the Chorister — structured, fast, cheap. Runs every turn. */
  director: "anthropic/claude-haiku-4.5",
  /** the narrator — prose quality is the product. */
  narrator: "anthropic/claude-sonnet-5",
  /** the registrar — extraction into strict JSON. */
  registrar: "anthropic/claude-haiku-4.5",
  /** image generation for portraits and plates */
  image: "google/gemini-3-pro-image",
} as const;

export type ModelRole = keyof typeof MODELS;
