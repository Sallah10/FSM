export const PAGE_SIZE = 10;

type SearchParamsInput = Record<string, string | string[] | undefined>;

export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

export function parseSearch(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? '').trim().slice(0, 80);
}

export function toParamRecord(input: SearchParamsInput): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') out[key] = value;
    else if (Array.isArray(value) && value[0]) out[key] = value[0];
  }
  return out;
}
