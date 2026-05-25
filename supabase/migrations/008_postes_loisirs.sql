-- ============================================================
-- Migration 008 — Chronométreur + postes Loisirs simplifiés
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- Renommer table → chronometreur dans l'enum
ALTER TYPE poste_nom ADD VALUE IF NOT EXISTS 'chronometreur';
UPDATE match_postes SET poste = 'chronometreur' WHERE poste = 'table';

-- Supprimer postes inutiles pour Loisirs
DELETE FROM match_postes
WHERE poste IN ('responsable_salle', 'secretaire')
AND match_id IN (SELECT id FROM matches WHERE categorie = 'Loisirs');
