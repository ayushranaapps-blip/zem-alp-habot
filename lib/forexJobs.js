import { config } from './config.js';
import { getFxRate } from './forex.js';
import { getTodaysHighImpactEvents } from './economicCalendar.js';
import { supabase } from './db.js';

export async function checkForexAlerts(client) {
  const { data: alerts, error } = await supabase.from('forex_alerts').select('*').eq('status', 'active');
  if (error || !alerts || alerts.length === 0) return;

  const channel = config.forexAlertsChannelId
    ? await client.channels.fetch(config.forexAlertsChannelId).catch(() => null)
    : null;

  for (const alert of alerts) {
    const rate = await getFxRate(alert.base, alert.quote).catch(() => null);
    if (rate == null) continue;

    const triggered = alert.condition === 'above' ? rate >= alert.target_price : rate <= alert.target_price;
    if (!triggered) continue;

    await supabase.from('forex_alerts').update({ status: 'triggered' }).eq('id', alert.id);

    const msg = `📈 **${alert.base.toUpperCase()}/${alert.quote.toUpperCase()}** is now ${rate} — alert set by <@${alert.discord_id}> (${alert.condition} ${alert.target_price}) has triggered.`;
    if (channel) channel.send(msg);
  }
}

export async function postEconomicCalendar(client) {
  if (!config.economicCalendarChannelId) return;
  const channel = await client.channels.fetch(config.economicCalendarChannelId).catch(() => null);
  if (!channel) return;

  const events = await getTodaysHighImpactEvents();
  if (events.length === 0) {
    channel.send('📅 No major economic events today.');
    return;
  }

  const lines = events.map(e => `**${e.time || 'TBD'}** — ${e.country || ''} ${e.title} (${e.impact} impact)`);
  channel.send(`📅 **Today's Economic Calendar**\n\n${lines.join('\n')}`);
}
