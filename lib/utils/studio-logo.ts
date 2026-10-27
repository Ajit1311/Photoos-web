export function normalizeStudioLogoUrl(
  value:
    string | null | undefined,
): string | null {

  const logoUrl =
    value?.trim();

  if (
    !logoUrl
  ) {
    return null;
  }

  return logoUrl;

}


export function getStudioLogoCacheKey(
  value:
    string | null | undefined,
): string | null {

  const logoUrl =
    normalizeStudioLogoUrl(
      value,
    );

  if (
    !logoUrl
  ) {
    return null;
  }

  return `${logoUrl}${
    logoUrl.includes("?")
      ? "&"
      : "?"
  }v=${Date.now()}`;

}
