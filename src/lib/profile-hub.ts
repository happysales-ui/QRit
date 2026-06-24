export const PROFILE_HUB_QUERY_PARAM = "hub";

export function isProfileHubView(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  const hub = searchParams[PROFILE_HUB_QUERY_PARAM];

  if (hub === "1" || hub === "true") {
    return true;
  }

  if (Array.isArray(hub)) {
    return hub.some((value) => value === "1" || value === "true");
  }

  return false;
}

export function getProfileHubHref(username: string): string {
  return `/${username}?${PROFILE_HUB_QUERY_PARAM}=1`;
}
