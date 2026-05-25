-- ============================================================
-- Migration 002 — Table match_postes
-- À exécuter dans Supabase SQL Editor
-- ============================================================

CREATE TYPE poste_nom AS ENUM (
  'responsable_salle',
  'secretaire',
  'chronometreur',
  'arbitre',
  'videaste',
  'buvette'
);

CREATE TABLE match_postes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  poste       poste_nom NOT NULL,
  personne    TEXT,
  facultatif  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(match_id, poste)
);

ALTER TABLE match_postes ENABLE ROW LEVEL SECURITY;

-- Lecture publique des postes pour les matchs publiés
CREATE POLICY "postes: lecture publique"
  ON match_postes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.statut IN ('publie', 'prevu')
    )
  );

-- super_admin : accès total
CREATE POLICY "postes: super_admin total"
  ON match_postes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- responsable : gère les postes des matchs de sa catégorie
CREATE POLICY "postes: responsable"
  ON match_postes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN matches m ON m.id = match_id
      WHERE p.id = auth.uid()
      AND p.role = 'responsable'
      AND p.categorie = m.categorie
    )
  );

CREATE TRIGGER trg_postes_updated_at
  BEFORE UPDATE ON match_postes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Fonction pour initialiser les postes d'un match automatiquement
CREATE OR REPLACE FUNCTION init_match_postes(p_match_id UUID, p_categorie TEXT)
RETURNS VOID AS $$
DECLARE
  v_is_loisirs BOOLEAN;
  v_need_arbitre BOOLEAN;
BEGIN
  v_is_loisirs := p_categorie = 'Loisirs';
  v_need_arbitre := p_categorie NOT IN ('Séniors Masculins', 'Séniors Féminines');

  -- Postes obligatoires sauf pour Loisirs
  IF NOT v_is_loisirs THEN
    INSERT INTO match_postes (match_id, poste, facultatif) VALUES
      (p_match_id, 'responsable_salle', FALSE),
      (p_match_id, 'secretaire', FALSE)
    ON CONFLICT (match_id, poste) DO NOTHING;
  END IF;

  -- Chronométreur pour tous
  INSERT INTO match_postes (match_id, poste, facultatif) VALUES
    (p_match_id, 'chronometreur', FALSE)
  ON CONFLICT (match_id, poste) DO NOTHING;

  -- Arbitre selon catégorie
  IF v_need_arbitre THEN
    INSERT INTO match_postes (match_id, poste, facultatif)
    VALUES (p_match_id, 'arbitre', FALSE)
    ON CONFLICT (match_id, poste) DO NOTHING;
  END IF;

  -- Postes facultatifs pour tous
  INSERT INTO match_postes (match_id, poste, facultatif) VALUES
    (p_match_id, 'videaste', TRUE),
    (p_match_id, 'buvette', TRUE)
  ON CONFLICT (match_id, poste) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
