const PHOTOOS_SMART_LINK_HOST =
  process.env.NEXT_PUBLIC_PHOTOOS_SMART_LINK_HOST ??
  "https://photoos.app";

export function createClientStudioSmartLink(
  token: string,
): string {
  return `${PHOTOOS_SMART_LINK_HOST}/s/${encodeURIComponent(token)}`;
}
