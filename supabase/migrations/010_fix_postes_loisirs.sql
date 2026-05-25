-- ============================================================
-- Migration 010 — Corriger postes Loisirs domicile
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- Supprimer responsable_salle et secretaire pour tous les matchs Loisirs domicile
DELETE FROM match_postes
WHERE poste IN ('responsable_salle', 'secretaire')
AND match_id IN (
  SELECT id FROM matches WHERE categorie = 'Loisirs' AND domicile = true
);
