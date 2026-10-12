import { MODELS } from "./gateway";

/**
 * IMAGE GENERATION — spoken to the gateway directly.
 *
 * The AI SDK's gateway provider cannot read this endpoint's image responses: it
 * expects `data: { type: "data" | "url", ... }` and the gateway returns a bare
 * base64 string. `generateText` therefore throws while converting the file part,
 * after the model has already been paid for. So the one call that matters is
 * made here by hand, with the same protocol headers the SDK sends.
 */

const PROTOCOL_VERSION = "0.0.1";
const SPEC_VERSION = "4";

export interface GeneratedImage {
  bytes: Uint8Array;
  mediaType: string;
}

function baseURL(): string {
  const url = process.env.AI_GATEWAY_BASE_URL;
  if (!url) throw new Error("AI_GATEWAY_BASE_URL is not set.");
  return url.replace(/\/$/, "");
}

/** Sniff the format rather than trusting a media type the gateway does not send. */
function sniff(bytes: Uint8Array): string {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes[0] === 0x52 && bytes[1] === 0x49) return "image/webp";
  return "image/png";
}

function asBase64(data: unknown): string | null {
  if (typeof data === "string" && data.length > 64) return data;
  if (data && typeof data === "object") {
    const d = data as { type?: string; data?: unknown; url?: string };
    if (typeof d.data === "string" && d.data.length > 64) return d.data;
    if (typeof d.url === "string" && d.url.startsWith("data:")) return d.url.slice(d.url.indexOf(",") + 1);
  }
  return null;
}

/**
 * One image, from the model, as bytes. Throws with a human sentence on failure —
 * the caller turns that into a message the player can read.
 */
export async function generateImage(prompt: string, model = MODELS.image): Promise<GeneratedImage> {
  const key = process.env.AI_GATEWAY_API_KEY;
  if (!key) throw new Error("AI_GATEWAY_API_KEY is not set.");

  const res = await fetch(`${baseURL()}/language-model`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
      "ai-gateway-auth-method": "api-key",
      "ai-gateway-protocol-version": PROTOCOL_VERSION,
      "ai-language-model-id": model,
      "ai-language-model-specification-version": SPEC_VERSION,
      "ai-language-model-streaming": "false",
      "user-agent": "ilvaris/1.0",
    },
    body: JSON.stringify({
      toolChoice: { type: "auto" },
      prompt: [{ role: "user", content: [{ type: "text", text: prompt }] }],
      providerOptions: { google: { responseModalities: ["TEXT", "IMAGE"] } },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`The plate would not develop (${res.status}). ${detail.slice(0, 180)}`);
  }

  const body = (await res.json()) as { content?: { type?: string; data?: unknown }[]; error?: { message?: string } };
  if (body.error?.message) throw new Error(`The plate would not develop: ${body.error.message}`);

  const part = body.content?.find((p) => p.type === "file" && asBase64(p.data));
  const b64 = part ? asBase64(part.data) : null;
  if (!b64) throw new Error("The plate came back empty. Try again.");

  const bytes = new Uint8Array(Buffer.from(b64, "base64"));
  return { bytes, mediaType: sniff(bytes) };
}
