-- ============================================================
-- Migration 022 — Entraîneurs des collectifs -15/-18
-- À exécuter dans Supabase SQL Editor
--
-- Contexte :
--   Un entraîneur est rattaché à un COLLECTIF (profiles.categorie, liste
--   CATEGORIES : "-15M/-18M", "-15F/-18F"…) alors qu'un match porte une
--   catégorie de MATCH (liste MATCH_CATEGORIES : "-15M", "-18M", "-15F",
--   "-18F"…). Les policies comparaient les deux par égalité stricte : un
--   entraîneur "-15M/-18M" ne pouvait ni voir, ni créer, ni modifier
--   aucun match -15M ou -18M.
--
-- Apporté ici :
--   1. match_categories_for(p_categorie) — catégories de match couvertes
--      par un collectif (miroir de matchCategoriesFor() côté front,
--      src/data/categories.ts)
--   2. Les 3 policies "matches: entraineur *" recréées avec
--      matches.categorie = ANY(match_categories_for(p.categorie))
--
-- Idempotente : peut être relancée sans erreur.
-- ============================================================

CREATE OR REPLACE FUNCTION match_categories_for(p_categorie TEXT)
RETURNS TEXT[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_categorie
    WHEN '-15M/-18M' THEN ARRAY['-15M', '-18M']
    WHEN '-15F/-18F' THEN ARRAY['-15F', '-18F']
    ELSE ARRAY[p_categorie]
  END
$$;

DROP POLICY IF EXISTS "matches: entraineur select" ON matches;
DROP POLICY IF EXISTS "matches: entraineur insert" ON matches;
DROP POLICY IF EXISTS "matches: entraineur update" ON matches;

CREATE POLICY "matches: entraineur select"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'entraineur'
      AND matches.categorie = ANY(match_categories_for(p.categorie))
    )
  );

CREATE POLICY "matches: entraineur insert"
  ON matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'entraineur'
      AND matches.categorie = ANY(match_categories_for(p.categorie))
    )
  );

CREATE POLICY "matches: entraineur update"
  ON matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'entraineur'
      AND matches.categorie = ANY(match_categories_for(p.categorie))
    )
  );
