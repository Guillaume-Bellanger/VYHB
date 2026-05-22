-- ============================================================
-- Migration 003 — Table ticker_messages
-- À exécuter dans Supabase SQL Editor
-- ============================================================

CREATE TABLE ticker_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message    TEXT NOT NULL,
  actif      BOOLEAN NOT NULL DEFAULT TRUE,
  ordre      INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ticker_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ticker: lecture publique"
  ON ticker_messages FOR SELECT
  USING (actif = TRUE);

CREATE POLICY "ticker: super_admin gère tout"
  ON ticker_messages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- Messages par défaut
INSERT INTO ticker_messages (message, ordre) VALUES
  ('2026/2027 • PORTES OUVERTES MAI 2026', 1),
  ('REJOIGNEZ LA FAMILLE', 2),
  ('ESSAI GRATUIT', 3),
  ('VAL D''YERRES HANDBALL', 4),
  ('RECRUTEMENT OUVERT 2026/2027', 5);
