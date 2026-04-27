-- Spusti v learning Supabase (SQL Editor), ak máš pôvodné politiky len pre `seybo`.
-- Nahradí ich jednou sadou pre oboch používateľov a vloží riadok pre potkan.

insert into learning_progress (id, data)
values ('potkan', '{}'::jsonb)
on conflict (id) do nothing;

drop policy if exists "anon read seybo" on learning_progress;
drop policy if exists "anon insert seybo" on learning_progress;
drop policy if exists "anon update seybo" on learning_progress;

create policy "anon read learning users"
  on learning_progress for select to anon
  using (id in ('seybo', 'potkan'));

create policy "anon insert learning users"
  on learning_progress for insert to anon
  with check (id in ('seybo', 'potkan'));

create policy "anon update learning users"
  on learning_progress for update to anon
  using (id in ('seybo', 'potkan'))
  with check (id in ('seybo', 'potkan'));
