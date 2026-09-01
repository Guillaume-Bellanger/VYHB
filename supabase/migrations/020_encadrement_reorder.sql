-- ============================================================
-- Migration 020 — Réordonnancement stable de l'encadrement
-- À exécuter dans Supabase SQL Editor
--
-- Contexte du bug :
--   Les boutons ↑↓ de la page admin Encadrement produisaient des
--   doublons de `ordre` (constaté en base : 3 entraîneurs à ordre=11,
--   valeurs 9 et 10 disparues). Cause : le déplacement émettait deux
--   PATCH REST concurrents et non transactionnels sur des valeurs
--   `ordre` déjà dé-densifiées — un ex-aequo suffit alors à rendre
--   la permutation inopérante (on échange deux valeurs identiques).
--
-- Apporté ici :
--   1. renumber_encadrement(p_type)      — réassigne 0..N-1 pour un type
--                                          (séquence dense, ordre stable)
--   2. reorder_encadrement(p_id, p_dir)  — densifie PUIS échange p_id
--                                          avec son voisin, le tout dans
--                                          UNE transaction => atomique,
--                                          aucun doublon possible
--   3. Nettoyage unique des doublons déjà en base (les 3 types)
--
-- security invoker (défaut) : les UPDATE restent soumis à la RLS de
-- la table `encadrement` (policy "encadrement: admins modifient",
-- get_my_role() IN ('super_admin','president')). Le nettoyage final
-- s'exécute, lui, avec le rôle du SQL Editor (hors RLS).
--
-- Idempotente : CREATE OR REPLACE FUNCTION + le nettoyage réassigne
-- toujours la même séquence déterministe — rejouable sans effet de bord.
-- ============================================================

-- ── 1. Renumérotation dense d'un type ───────────────────────
-- Réassigne ordre = 0..N-1 aux fiches non supprimées d'un `type`,
-- dans l'ordre (ordre, created_at, id) — donc stable et reproductible.
CREATE OR REPLACE FUNCTION public.renumber_encadrement(p_type text)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE encadrement e
  SET ordre = s.rn
  FROM (
    SELECT id,
           (ROW_NUMBER() OVER (ORDER BY ordre ASC, created_at ASC, id ASC) - 1) AS rn
    FROM encadrement
    WHERE type = p_type
      AND supprime_le IS NULL
  ) s
  WHERE e.id = s.id
    AND e.ordre IS DISTINCT FROM s.rn;
$$;

-- ── 2. Déplacement atomique (↑ = -1, ↓ = +1) ────────────────
CREATE OR REPLACE FUNCTION public.reorder_encadrement(p_id uuid, p_direction int)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_type     text;
  v_ordre    int;
  v_neighbor uuid;
BEGIN
  IF p_direction NOT IN (-1, 1) THEN
    RAISE EXCEPTION 'direction invalide: % (attendu -1 ou 1)', p_direction;
  END IF;

  SELECT type INTO v_type
  FROM encadrement
  WHERE id = p_id AND supprime_le IS NULL;

  IF v_type IS NULL THEN
    RAISE EXCEPTION 'fiche encadrement introuvable: %', p_id;
  END IF;

  -- Densifie la section d'abord : garantit une séquence 0..N-1 sans
  -- trou ni doublon, donc un voisin unique dans chaque direction.
  PERFORM public.renumber_encadrement(v_type);

  SELECT ordre INTO v_ordre FROM encadrement WHERE id = p_id;

  SELECT id INTO v_neighbor
  FROM encadrement
  WHERE type = v_type
    AND supprime_le IS NULL
    AND ordre = v_ordre + p_direction;

  IF v_neighbor IS NULL THEN
    RETURN;  -- déjà en bout de liste : rien à faire
  END IF;

  -- Échange des deux `ordre` en un seul UPDATE => atomique,
  -- aucun état intermédiaire avec doublon.
  UPDATE encadrement
  SET ordre = CASE id
                WHEN p_id       THEN v_ordre + p_direction
                WHEN v_neighbor THEN v_ordre
              END
  WHERE id IN (p_id, v_neighbor);
END;
$$;

GRANT EXECUTE ON FUNCTION public.renumber_encadrement(text)     TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_encadrement(uuid, int) TO authenticated;

-- ── 3. Nettoyage unique des doublons existants ─────────────────
-- Rejouable : réassigne toujours 0..N-1 par type dans l'ordre
-- (ordre, created_at, id). Équivalent à appeler renumber_encadrement
-- sur chaque type, mais autonome (ne dépend pas des fonctions ci-dessus).
WITH ranked AS (
  SELECT id,
         (ROW_NUMBER() OVER (
            PARTITION BY type
            ORDER BY ordre ASC, created_at ASC, id ASC
         ) - 1) AS rn
  FROM encadrement
  WHERE supprime_le IS NULL
)
UPDATE encadrement e
SET ordre = ranked.rn
FROM ranked
WHERE e.id = ranked.id
  AND e.ordre IS DISTINCT FROM ranked.rn;
