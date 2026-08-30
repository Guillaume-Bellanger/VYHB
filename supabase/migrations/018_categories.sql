-- ============================================================
-- Migration 018 — Réalignement des catégories (ÉTAPE 1/2 : DIAGNOSTIC)
-- À exécuter dans Supabase SQL Editor
--
-- Ce fichier ne contient QUE des requêtes de lecture (aucun UPDATE).
-- Nouvelle liste canonique (src/data/categories.ts) :
--   Baby Hand, -7, -9, -11 Mixte, -11F, -13M, -13F, -15M/-18M, -15F/-18F,
--   Séniors Masculins, Séniors Féminines, Loisirs
--
-- Mapping prévu pour l'étape 2 (UPDATE, pas encore dans ce fichier) :
--   '-9/-11'    → '-9'          (à reclasser manuellement ensuite en -9 / -11 Mixte)
--   '-15M'      → '-15M/-18M'
--   '-15F'      → '-15F/-18F'
--   '-15/-18M'  → '-15M/-18M'
--   '-15/-18F'  → '-15F/-18F'
--   '-18F'      → '-15F/-18F'
--   '-13H'      → '-13M'
--   'Loisir'    → 'Loisirs'
--
-- Exécutez les deux requêtes ci-dessous et collez-moi le résultat.
-- Je complèterai ce fichier avec les UPDATE (matches.categorie et
-- encadrement.categories[] via array_replace) uniquement pour les valeurs
-- couvertes par le mapping ci-dessus, et je vous signalerai explicitement
-- toute valeur qui n'y correspond pas plutôt que de la corriger d'autorité.
--
-- `collectifs` n'est volontairement PAS concerné par cette migration
-- (décision actée : pas de colonne categorie sur cette table, seul `nom`
-- y ressemble ; un renommage/scission de collectif est une décision
-- métier à faire manuellement depuis /admin/collectifs).
-- ============================================================

SELECT categorie, count(*) AS nb
FROM matches
GROUP BY categorie
ORDER BY 1;

SELECT unnest(categories) AS categorie, count(*) AS nb
FROM encadrement
GROUP BY 1
ORDER BY 1;
