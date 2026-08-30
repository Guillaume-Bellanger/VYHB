-- ============================================================
-- Migration 016 — Table tarifs (CMS admin)
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- ── Table ───────────────────────────────────────────────────

CREATE TABLE tarifs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle     TEXT NOT NULL,   -- "Baby Hand / -7"
  montant     NUMERIC(6,2) NOT NULL,
  saison      TEXT NOT NULL,   -- "2026/2027"
  note        TEXT,
  ordre       INTEGER NOT NULL DEFAULT 0,
  actif       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE tarifs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tarifs: lecture publique"
  ON tarifs FOR SELECT USING (actif = TRUE);

CREATE POLICY "tarifs: admins gerent"
  ON tarifs FOR ALL
  USING (get_my_role() IN ('super_admin', 'president'));

-- ── Trigger updated_at (réutilise set_updated_at() de schema.sql) ─

CREATE TRIGGER trg_tarifs_updated_at
  BEFORE UPDATE ON tarifs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Données — tarifs actuels, saison 2026/2027 ─────────────

INSERT INTO tarifs (libelle, montant, saison, ordre) VALUES
('Baby Hand / -7', 110, '2026/2027', 0),
('-9 / -11 / -13', 120, '2026/2027', 1),
('-15 / -18', 130, '2026/2027', 2),
('Seniors', 150, '2026/2027', 3),
('Loisirs', 120, '2026/2027', 4);
