import { headers } from "next/headers";

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteUrlFromEnv(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return url ? stripTrailingSlash(url) : undefined;
}

export async function getSiteUrl(): Promise<string> {
  const fromEnv = getSiteUrlFromEnv();
  if (fromEnv) {
    return fromEnv;
  }

  const headersList = await headers();
  const host = headersList.get("host");
  if (!host) {
    return "http://localhost:3000";
  }

  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}
