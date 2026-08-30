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
-- ✅ ÉTAPE 3 (UPDATE encadrement.categories[]) : ci-dessous, confirmée
--    par l'utilisateur — distribution identique à matches (13 occurrences).
--    Cas particulier : un encadrant peut suivre plusieurs groupes, donc
--    '-9/-11' est éclaté en DEUX valeurs ('-9' ET '-11 Mixte') au lieu
--    d'un remplacement 1:1 comme sur matches.categorie (scalaire, lui,
--    un match n'a qu'une seule catégorie). Reconstruction complète du
--    tableau par ligne (pas un simple array_replace en chaîne) pour
--    dédupliquer '-15F'/'-18F' qui convergent vers la même valeur
--    '-15F/-18F' — un encadrant portant les deux ne doit pas se retrouver
--    avec un doublon. Ordre d'origine préservé (première occurrence de
--    chaque valeur finale détermine sa position ; en cas d'ex-aequo sur
--    un même élément source éclaté en deux, "-9" passe avant "-11 Mixte").
-- ✅ ÉTAPE 4 (UPDATE collectifs.nom, typo d'accent uniquement) : ci-dessous,
--    confirmée par l'utilisateur. Correction orthographique pure — slug,
--    horaires, entraîneurs et photo inchangés. La scission de la fiche
--    "-9/-11" en deux collectifs reste explicitement hors périmètre
--    (l'utilisateur la fera lui-même depuis /admin/collectifs).
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

-- ── DIAGNOSTIC encadrement.categories[] (13 occurrences, exécuté) ─
--   -11F                1        -15M/-18M           2
--   -13M                1        -18F                1
--   -15F                1        -7                  1
--   -9/-11              1        Loisirs              2
--   Seniors Féminines   1        Seniors Masculins    2
-- Distribution identique à matches.categorie — confirmé par l'utilisateur
-- que le marqueur source de la requête affiche bien "encadrement".

-- ── ÉTAPE 3 : UPDATE encadrement.categories[] ───────────────
-- Reconstruction complète du tableau par ligne (unnest → mapping →
-- regroupement par valeur finale avec MIN(ordinalité) → ré-agrégation
-- triée) plutôt qu'un array_replace en chaîne, pour :
--  1. Dédupliquer '-15F'/'-18F' → même valeur '-15F/-18F' (sinon un
--     encadrant portant les deux se retrouverait avec un doublon)
--  2. Éclater '-9/-11' en DEUX valeurs '-9' + '-11 Mixte' (un encadrant
--     peut suivre les deux groupes, contrairement à un match qui n'a
--     qu'une seule catégorie)
--  3. Préserver l'ordre d'origine (première occurrence de chaque valeur
--     finale détermine sa position ; "-9" passe avant "-11 Mixte" quand
--     les deux proviennent du même élément source "-9/-11")
-- N'affecte que les lignes ayant réellement une des valeurs du mapping ;
-- toute autre valeur (-7, -11F, -13M, -15M/-18M, Loisirs...) traverse
-- inchangée via la branche ELSE. Les lignes à categories IS NULL
-- (bureau/pole) ne sont pas concernées (unnest(NULL) ne produit aucune ligne).

UPDATE encadrement e
SET categories = grouped.new_categories
FROM (
  SELECT id, array_agg(val ORDER BY min_ord, min_sub_ord) AS new_categories
  FROM (
    SELECT
      e2.id,
      mapped.val,
      MIN(u.ord) AS min_ord,
      MIN(mapped.sub_ord) AS min_sub_ord
    FROM encadrement e2
    CROSS JOIN LATERAL unnest(e2.categories) WITH ORDINALITY AS u(elem, ord)
    CROSS JOIN LATERAL unnest(
      CASE u.elem
        WHEN '-15F' THEN ARRAY['-15F/-18F']
        WHEN '-18F' THEN ARRAY['-15F/-18F']
        WHEN 'Seniors Féminines' THEN ARRAY['Séniors Féminines']
        WHEN 'Seniors Masculins' THEN ARRAY['Séniors Masculins']
        WHEN '-9/-11' THEN ARRAY['-9', '-11 Mixte']
        ELSE ARRAY[u.elem]
      END
    ) WITH ORDINALITY AS mapped(val, sub_ord)
    WHERE e2.categories IS NOT NULL
    GROUP BY e2.id, mapped.val
  ) per_value
  GROUP BY id
) grouped
WHERE e.id = grouped.id;

-- ── Vérification (à lancer après l'ÉTAPE 3, avant de considérer la
--    migration close) ────────────────────────────────────────────
SELECT prenom, role, categories
FROM encadrement
WHERE type = 'entraineur'
ORDER BY ordre;

-- ── ÉTAPE 4 : UPDATE collectifs.nom (typo d'accent) ─────────
-- Ne touche que `nom` — slug, horaires, lieux, entraineurs, photo_url
-- restent identiques. Ne reclasse ni ne scinde aucune fiche.

UPDATE collectifs SET nom = 'Séniors Féminines' WHERE nom = 'Seniors Féminines';
UPDATE collectifs SET nom = 'Séniors Masculins' WHERE nom = 'Seniors Masculins';
