// Free, no key required. Rates update once a day (not real-time tick data).
const BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';

export async function getFxRate(from, to) {
  const res = await fetch(`${BASE}/${from.toLowerCase()}.json`);
  if (!res.ok) return null;
  const data = await res.json();
  const rate = data[from.toLowerCase()]?.[to.toLowerCase()];
  return rate || null;
}
