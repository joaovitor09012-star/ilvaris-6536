import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET!;

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return key;
}

export async function getObjectBytes(key: string): Promise<{ body: Uint8Array; contentType: string } | null> {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const bytes = await res.Body!.transformToByteArray();
    return { body: bytes, contentType: res.ContentType ?? "image/png" };
  } catch {
    return null;
  }
}

/** Presigned GET, used only for short-lived server-side fetches — never handed to the client. */
export async function presignGet(key: string, expiresIn = 3600) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}

/** The stable, permanent URL the client uses. Served by /api/media/:key through the API. */
export function mediaUrl(key: string) {
  return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}
