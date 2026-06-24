import { createHash } from "node:crypto";
import { headers } from "next/headers";

export async function getRequestClientIp(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return headersList.get("x-real-ip")?.trim() || "unknown";
}

export function hashRateLimitBucket(parts: string[]): string {
  return createHash("sha256").update(parts.join(":")).digest("hex");
}
