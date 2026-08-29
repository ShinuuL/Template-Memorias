-- ============================================================
-- Site de Memórias — Seed de exemplo (OPCIONAL)
-- Rode APÓS o schema.sql, se quiser já começar com algumas
-- memórias para testar a visualização e o painel.
-- As FOTOS não vêm aqui: adicione pela galeria no painel (/admin).
-- ============================================================

insert into public.memories (title, date, letter, spotify_tracks, theme, sort_order)
values
(
  'Nosso primeiro mês',
  '04/07/2025',
  'Quem diria que depois de tantas complicações finalmente estaríamos juntos né? kkkk
Pô, finalmente estamos tendo um relacionamento normal, e eu posso frequentar sua casa.
Bem, decidi que este vai ser o nosso cantinho. Trate de tirar fotos todo mês pra eu colocar aqui 💛✨',
  '["28jyMOvRd82hQp95Z9ftXw", "6BJHsLiE47Sk0wQkuppqhr", "0B4YX3OMtZSmPm9KpiZKl2"]',
  '{"bg": "#89cff0", "text": "#1a1a1a", "accent": "#e91e63", "fontHeading": "Sofia", "fontBody": "Shadows Into Light", "polaroidBg": "#ffffff"}'::jsonb,
  0
),
(
  'Aquele passeio inesquecível',
  '12/10/2025',
  'Até parece que a gente gosta de lugar assim né? Mas pô, foi muito bom poder ir com você esse ano, ser feliz assim. Mim ama.',
  '["60Jn0ge4EIHRecFarOZ5qn", "6kOdk29M8h6ZfHz4byVG0t", "7kBQS11ThrXE5JC5UqRc7e"]',
  '{"bg": "#f7ecd5", "text": "#3b2f1e", "accent": "#c2410c", "fontHeading": "Great Vibes", "fontBody": "Dancing Script", "polaroidBg": "#fffaf0"}'::jsonb,
  1
),
(
  'Você e eu',
  '25/12/2025',
  'Linda, maravilhosa, gata e minha musa! hihi
Apenas a gente sendo feliz, quem pode nos julgar né. Te amo pra caramba, entendeu?',
  '["0B4YX3OMtZSmPm9KpiZKl2"]',
  '{"bg": "#ffe4ec", "text": "#4a2030", "accent": "#9d174d", "fontHeading": "Dancing Script", "fontBody": "Poppins", "polaroidBg": "#ffffff"}'::jsonb,
  2
);
