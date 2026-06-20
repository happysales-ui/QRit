import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_GATE_COOKIE = "qrit_admin_gate";
const ADMIN_GATE_SALT = "qrit-admin-gate-v1";

export function getAdminPagePassword(): string | null {
  const password = process.env.ADMIN_PAGE_PASSWORD?.trim();
  return password ? password : null;
}

export function isAdminPasswordConfigured(): boolean {
  return getAdminPagePassword() !== null;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function gateTokenForPassword(password: string): string {
  return createHmac("sha256", password).update(ADMIN_GATE_SALT).digest("hex");
}

export function verifyAdminPagePassword(input: string): boolean {
  const password = getAdminPagePassword();
  if (!password) {
    return false;
  }

  return safeEqual(input, password);
}

export function createAdminGateCookieValue(): string | null {
  const password = getAdminPagePassword();
  if (!password) {
    return null;
  }

  return gateTokenForPassword(password);
}

export async function hasValidAdminGateCookie(): Promise<boolean> {
  const expected = createAdminGateCookieValue();
  if (!expected) {
    return false;
  }

  const cookieStore = await cookies();
  const actual = cookieStore.get(ADMIN_GATE_COOKIE)?.value;
  if (!actual) {
    return false;
  }

  return safeEqual(actual, expected);
}

export const adminGateCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8,
};
