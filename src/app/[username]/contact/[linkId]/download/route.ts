import { NextResponse } from "next/server";
import { RESERVED_USERNAMES } from "@/lib/auth/validation";
import {
  buildVcf,
  buildVcfFilename,
} from "@/lib/contact-vcf";
import {
  isContactLink,
  resolveLinkContact,
} from "@/lib/contact-link";
import { getMockProfileByUsername } from "@/lib/mock-profile";
import { getProfileByUsername } from "@/lib/profile";
import { isProfileExpired } from "@/lib/service-expiry";

interface ContactDownloadRouteProps {
  params: Promise<{ username: string; linkId: string }>;
}

async function resolveProfile(username: string) {
  const normalized = username.toLowerCase();

  if (RESERVED_USERNAMES.has(normalized)) {
    return null;
  }

  if (normalized === "demo") {
    return getMockProfileByUsername("demo");
  }

  return getProfileByUsername(normalized);
}

/** Fallback `.vcf` attachment route — used by iframe / direct fetch when blob save fails. */
export async function GET(
  request: Request,
  { params }: ContactDownloadRouteProps,
) {
  const { username, linkId } = await params;
  const data = await resolveProfile(username);

  if (!data) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (isProfileExpired(data.profile.expired_at)) {
    return NextResponse.redirect(
      new URL(`/${data.profile.username}/expired`, request.url),
    );
  }

  const link = data.links.find((item) => item.id === linkId);

  if (!link || !link.is_active || !isContactLink(link)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const contact = resolveLinkContact(link);

  if (!contact) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const vcf = buildVcf(contact);
  const filename = buildVcfFilename(contact.name);
  const encodedFilename = encodeURIComponent(filename);

  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
      "Cache-Control": "private, no-cache",
    },
  });
}
