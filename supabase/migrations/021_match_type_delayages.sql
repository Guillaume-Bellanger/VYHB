-- ============================================================
-- Migration 021 — Nouveau type de rencontre : « Delayages »
-- À exécuter dans Supabase SQL Editor
--
-- Ajoute la valeur 'delayages' à l'enum match_type.
-- Idempotente (IF NOT EXISTS) : peut être relancée sans erreur.
-- Doit être exécutée AVANT le déploiement du front, sinon
-- l'enregistrement d'un match de ce type est rejeté par Postgres.
-- ============================================================

ALTER TYPE match_type ADD VALUE IF NOT EXISTS 'delayages';
