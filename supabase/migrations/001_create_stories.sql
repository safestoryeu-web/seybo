-- Tabuľka stories pre ukladanie vygenerovaných rozprávok
-- Spusti v Supabase SQL Editore (Dashboard → SQL Editor → New query)

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  child_names text[] not null default '{}',
  topic text not null,
  lesson text not null default '',
  full_text text not null,
  created_at timestamptz not null default now()
);

-- Index pre rýchlejšie zoraďovanie podľa dátumu
create index if not exists stories_created_at_idx on public.stories (created_at desc);

-- RLS (Row Level Security): povoľ anonymné čítanie a vkladanie pre anon key
alter table public.stories enable row level security;

create policy "Allow anonymous insert"
  on public.stories for insert
  to anon
  with check (true);

create policy "Allow anonymous select"
  on public.stories for select
  to anon
  using (true);

-- Voliteľne: ak budeš neskôr používať auth, môžeš pridať policy pre update/delete len pre vlastníka
-- create policy "Users can update own stories" on public.stories for update using (auth.uid() = user_id);

comment on table public.stories is 'Uložené rozprávky vygenerované cez Gemini';
comment on column public.stories.child_names is 'Mená detí v rozprávke';
comment on column public.stories.topic is 'Téma rozprávky';
comment on column public.stories.lesson is 'Ponaučenie';
comment on column public.stories.full_text is 'Plný text prvej kapitoly (alebo celého príbehu)';
