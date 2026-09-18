import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

export const supabase = createClient(config.supabaseUrl, config.supabaseKey);

export async function createForexAlert({ discordId, base, quote, condition, targetPrice }) {
  const { error } = await supabase
    .from('forex_alerts')
    .insert({ discord_id: discordId, base, quote, condition, target_price: targetPrice, status: 'active' });
  if (error) throw error;
}
