create table forex_alerts (
  id uuid primary key default gen_random_uuid(),
  discord_id text not null,
  base text not null,
  quote text not null,
  condition text not null, -- 'above' or 'below'
  target_price numeric not null,
  status text not null default 'active', -- active | triggered
  created_at timestamptz not null default now()
);
