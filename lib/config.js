import 'dotenv/config';

export const config = {
  discordToken: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.GUILD_ID,

  forexAlertsChannelId: process.env.FOREX_ALERTS_CHANNEL_ID,
  economicCalendarChannelId: process.env.ECONOMIC_CALENDAR_CHANNEL_ID,

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SECRET_KEY,

  nvidiaApiKey: process.env.NVIDIA_API_KEY
};
