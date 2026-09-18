import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import cron from 'node-cron';
import http from 'http';
import { config } from './lib/config.js';
import { getFxRate } from './lib/forex.js';
import { createForexAlert } from './lib/db.js';
import { checkForexAlerts, postEconomicCalendar } from './lib/forexJobs.js';
import { askZem } from './lib/zem.js';

// Keeps Render's free tier awake when pinged
http.createServer((req, res) => res.end('Zem bot is running')).listen(process.env.PORT || 3000);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('forexprice')
      .setDescription('Check a forex pair\'s latest rate')
      .addStringOption(opt => opt.setName('base').setDescription('Base currency, e.g. EUR').setRequired(true))
      .addStringOption(opt => opt.setName('quote').setDescription('Quote currency, e.g. USD').setRequired(true)),
    new SlashCommandBuilder()
      .setName('forexalert')
      .setDescription('Get alerted when a forex pair crosses a price')
      .addStringOption(opt => opt.setName('base').setDescription('Base currency, e.g. EUR').setRequired(true))
      .addStringOption(opt => opt.setName('quote').setDescription('Quote currency, e.g. USD').setRequired(true))
      .addStringOption(opt => opt.setName('condition').setDescription('above or below').setRequired(true)
        .addChoices({ name: 'above', value: 'above' }, { name: 'below', value: 'below' }))
      .addNumberOption(opt => opt.setName('price').setDescription('Target price').setRequired(true)),
    new SlashCommandBuilder()
      .setName('ask')
      .setDescription('Ask Zem (AI assistant) a trading question')
      .addStringOption(opt => opt.setName('question').setDescription('Your question').setRequired(true)),
  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(config.discordToken);
  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands }
  );
  console.log('Slash commands registered.');
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  registerCommands().catch(console.error);

  // Rates only update daily, so checking every 30 min is plenty
  cron.schedule('*/30 * * * *', () => checkForexAlerts(client).catch(console.error));
  cron.schedule('0 7 * * *', () => postEconomicCalendar(client).catch(console.error));
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'forexprice') {
    await interaction.deferReply();
    const base = interaction.options.getString('base');
    const quote = interaction.options.getString('quote');
    const rate = await getFxRate(base, quote).catch(() => null);

    if (rate == null) {
      await interaction.editReply('Could not find that pair — check the currency codes (e.g. EUR, USD, GBP, JPY).');
      return;
    }
    await interaction.editReply(`**${base.toUpperCase()}/${quote.toUpperCase()}**: ${rate}\n_Rate updates daily, not real-time._`);
  }

  if (interaction.commandName === 'forexalert') {
    const base = interaction.options.getString('base');
    const quote = interaction.options.getString('quote');
    const condition = interaction.options.getString('condition');
    const price = interaction.options.getNumber('price');

    await createForexAlert({ discordId: interaction.user.id, base, quote, condition, targetPrice: price });

    await interaction.reply({
      content: `Alert set: I'll notify when **${base.toUpperCase()}/${quote.toUpperCase()}** goes ${condition} ${price}. (Checked every 30 min — rate data updates daily, not tick-by-tick.)`,
      ephemeral: true
    });
  }

  if (interaction.commandName === 'ask') {
    await interaction.deferReply();
    const question = interaction.options.getString('question');
    const answer = await askZem(question);
    await interaction.editReply(`🤖 **Zem:** ${answer}`);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!/\bzem\b/i.test(message.content)) return;

  const answer = await askZem(message.content);
  message.reply(`🤖 **Zem:** ${answer}`);
});

client.login(config.discordToken);
