-- ============================================================
-- Migration 018 — Réalignement des catégories
-- À exécuter dans Supabase SQL Editor
--
-- Nouvelle liste canonique (src/data/categories.ts) :
--   Baby Hand, -7, -9, -11 Mixte, -11F, -13M, -13F, -15M/-18M, -15F/-18F,
--   Séniors Masculins, Séniors Féminines, Loisirs
--
-- ── ÉTAT D'AVANCEMENT ───────────────────────────────────────
-- ✅ ÉTAPE 1 (diagnostic matches.categorie) : faite par l'utilisateur.
--    13 lignes obtenues, résumées ci-dessous.
-- ✅ ÉTAPE 2 (UPDATE matches + nettoyage match_postes) : ci-dessous,
--    confirmée par l'utilisateur après relecture du diagnostic.
-- ⏳ ÉTAPE 3 (UPDATE encadrement.categories[]) : EN ATTENTE — le
--    diagnostic `unnest(categories)` (requête tout en bas de ce fichier,
--    déjà présente) n'a pas encore été exécuté. À ajouter dans une
--    prochaine version de ce fichier une fois le résultat communiqué.
-- ⏸️ `collectifs` : toujours volontairement exclu (décision actée) —
--    y compris pour le typo d'accent "Seniors"/"Séniors" repéré dans
--    collectifs.nom (migration 014), qui reste en attente de confirmation
--    explicite avant modification (cf. message de suivi).
--
-- ── DIAGNOSTIC matches.categorie (13 lignes, exécuté) ───────
--   -11F                1        -15M/-18M           2
--   -13M                1        -18F                1
--   -15F                1        -7                  1
--   -9/-11              1        Loisirs              2
--   Seniors Féminines   1        Seniors Masculins    2
--
-- Valeur non couverte par le mapping initial, repérée par l'utilisateur :
-- "Seniors Féminines"/"Seniors Masculins" (SANS accent) ≠ la liste
-- canonique "Séniors Masculins"/"Séniors Féminines" (AVEC accent, cf.
-- src/data/categories.ts et la fonction init_match_postes ci-dessous —
-- le code est cohérent des deux côtés, seule la donnée divergeait).
-- Conséquence corrigée ci-dessous : init_match_postes() (migration
-- 002_match_postes.sql) teste
--   p_categorie NOT IN ('Séniors Masculins', 'Séniors Féminines')
-- pour décider de créer un poste 'arbitre'. Comme ces 3 matchs avaient la
-- variante sans accent, la condition n'a jamais matché : ils ont chacun
-- un poste 'arbitre' créé à tort. Nettoyé par le DELETE ci-dessous, à
-- exécuter APRÈS les UPDATE (il cible la valeur déjà corrigée).
-- ============================================================

-- ── ÉTAPE 2 : UPDATE matches.categorie ──────────────────────

UPDATE matches SET categorie = '-9'                 WHERE categorie = '-9/-11';
UPDATE matches SET categorie = '-15F/-18F'           WHERE categorie = '-15F';
UPDATE matches SET categorie = '-15F/-18F'           WHERE categorie = '-18F';
UPDATE matches SET categorie = 'Séniors Féminines'   WHERE categorie = 'Seniors Féminines';
UPDATE matches SET categorie = 'Séniors Masculins'   WHERE categorie = 'Seniors Masculins';

-- Nettoyage : poste 'arbitre' créé à tort sur les matchs Séniors
-- (catégories qui n'auraient jamais dû déclencher v_need_arbitre = TRUE)
DELETE FROM match_postes
WHERE poste = 'arbitre'
AND match_id IN (
  SELECT id FROM matches
  WHERE categorie IN ('Séniors Masculins', 'Séniors Féminines')
);

-- ── ÉTAPE 3 (EN ATTENTE) : diagnostic encadrement.categories[] ─
-- Exécutez cette requête et communiquez le résultat — je m'attends à y
-- voir 'Seniors Masculins' (×2 : Guillaume, Sylvain) et 'Seniors
-- Féminines' (×1 : Sofian) sans accent, d'après le seed de
-- 015_encadrement.sql, mais je ne l'affirme pas sans l'avoir vu.

SELECT unnest(categories) AS categorie, count(*) AS nb
FROM encadrement
GROUP BY 1
ORDER BY 1;
