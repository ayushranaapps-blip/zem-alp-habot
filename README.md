# Zem Bot — Setup

A separate bot from Paysy. Commands: /forexprice, /forexalert, /ask — plus it auto-replies whenever someone types "zem" in chat.

## 1\. Database

In Supabase SQL Editor, run schema.sql (just adds one new table, safe to run even though you already have other tables from Paysy).

## 2\. Deploy on Render (same as Paysy)

1. Create a new GitHub repo, upload this whole folder
2. Render → New + → Web Service → Free plan → connect the repo
3. Build command: npm install / Start command: npm start
4. Add these Environment Variables:

DISCORD\_TOKEN=DISCORD\_CLIENT\_ID=GUILD\_ID=FOREX\_ALERTS\_CHANNEL\_ID=1550462727988977815
ECONOMIC\_CALENDAR\_CHANNEL\_ID=NVIDIA\_API\_KEY=R6
SUPABASE\_URL=SUPABASE\_SECRET\_KEY=(your Supabase secret key from before)

5. Deploy, watch logs for "Logged in as ..." and "Slash commands registered."
6. Set up a second UptimeRobot monitor pinging THIS bot's Render URL too (separate from Paysy's), so it doesn't sleep.

## 3\. Invite the bot

Developer Portal → your Zem app → OAuth2 → URL Generator → check "bot" + "applications.commands" → permission "Send Messages" → open link → add to Cryptoarea.

