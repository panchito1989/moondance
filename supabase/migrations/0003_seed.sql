-- Conceptos iniciales (la dueña ajusta precios después).
-- Idempotente: re-aplicar no duplica (nombre es unique).
insert into public.payment_concepts (nombre, precio, tipo) values
  ('Clase', 150, 'clase'),
  ('Anualidad', 500, 'anualidad'),
  ('Vestuario', 800, 'vestuario')
on conflict (nombre) do nothing;
