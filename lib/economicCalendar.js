// Free, no key required. Pulls this week's economic events.
const URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';

export async function getTodaysHighImpactEvents() {
  const res = await fetch(URL);
  if (!res.ok) return [];
  const events = await res.json();

  const today = new Date().toISOString().slice(0, 10);
  return events.filter(e =>
    e.date?.slice(0, 10) === today &&
    (e.impact === 'High' || e.impact === 'Medium')
  );
}
