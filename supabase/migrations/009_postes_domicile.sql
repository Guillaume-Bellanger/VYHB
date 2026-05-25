-- ============================================================
-- Migration 009 — Supprimer postes des matchs extérieurs
-- À exécuter dans Supabase SQL Editor
-- ============================================================

DELETE FROM match_postes
WHERE match_id IN (SELECT id FROM matches WHERE domicile = false);
