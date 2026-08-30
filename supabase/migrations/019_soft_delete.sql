-- ============================================================
-- Migration 019 — Suppression réversible (corbeille) pour
-- encadrement, collectifs, evenements, tarifs
-- À exécuter dans Supabase SQL Editor
--
-- Chaque table gagne supprime_le/supprime_par. Le bouton "Supprimer" des
-- pages admin devient un UPDATE (soft delete) ; la suppression définitive
-- (DELETE réel) reste possible depuis la corbeille mais est réservée à
-- super_admin — appliqué au niveau RLS, pas seulement caché côté UI.
--
-- Postgres ne permet pas de retirer uniquement DELETE d'une policy FOR ALL :
-- l'ancienne policy admin "FOR ALL" de chaque table est donc remplacée par
-- 4 policies dédiées (SELECT/INSERT/UPDATE pour super_admin+président,
-- DELETE pour super_admin seul). Pour evenements, la policy d'origine
-- ("evenements: gestionnaires") inclut aussi evenements_com : ce rôle est
-- conservé sur SELECT/INSERT/UPDATE mais pas sur DELETE définitif.
-- ============================================================

-- ── collectifs ──────────────────────────────────────────────

ALTER TABLE collectifs
  ADD COLUMN supprime_le  TIMESTAMPTZ,
  ADD COLUMN supprime_par UUID REFERENCES profiles(id);

DROP POLICY IF EXISTS "collectifs: lecture publique" ON collectifs;
CREATE POLICY "collectifs: lecture publique"
  ON collectifs FOR SELECT USING (actif = TRUE AND supprime_le IS NULL);

DROP POLICY IF EXISTS "collectifs: admins gerent" ON collectifs;

CREATE POLICY "collectifs: admins lisent tout"
  ON collectifs FOR SELECT
  USING (get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "collectifs: admins inserent"
  ON collectifs FOR INSERT
  WITH CHECK (get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "collectifs: admins modifient"
  ON collectifs FOR UPDATE
  USING (get_my_role() IN ('super_admin', 'president'))
  WITH CHECK (get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "collectifs: super_admin supprime"
  ON collectifs FOR DELETE
  USING (get_my_role() = 'super_admin');

-- ── encadrement ─────────────────────────────────────────────

ALTER TABLE encadrement
  ADD COLUMN supprime_le  TIMESTAMPTZ,
  ADD COLUMN supprime_par UUID REFERENCES profiles(id);

DROP POLICY IF EXISTS "encadrement: lecture publique" ON encadrement;
CREATE POLICY "encadrement: lecture publique"
  ON encadrement FOR SELECT USING (actif = TRUE AND supprime_le IS NULL);

DROP POLICY IF EXISTS "encadrement: admins gerent" ON encadrement;

CREATE POLICY "encadrement: admins lisent tout"
  ON encadrement FOR SELECT
  USING (get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "encadrement: admins inserent"
  ON encadrement FOR INSERT
  WITH CHECK (get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "encadrement: admins modifient"
  ON encadrement FOR UPDATE
  USING (get_my_role() IN ('super_admin', 'president'))
  WITH CHECK (get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "encadrement: super_admin supprime"
  ON encadrement FOR DELETE
  USING (get_my_role() = 'super_admin');

-- ── tarifs ──────────────────────────────────────────────────

ALTER TABLE tarifs
  ADD COLUMN supprime_le  TIMESTAMPTZ,
  ADD COLUMN supprime_par UUID REFERENCES profiles(id);

DROP POLICY IF EXISTS "tarifs: lecture publique" ON tarifs;
CREATE POLICY "tarifs: lecture publique"
  ON tarifs FOR SELECT USING (actif = TRUE AND supprime_le IS NULL);

DROP POLICY IF EXISTS "tarifs: admins gerent" ON tarifs;

CREATE POLICY "tarifs: admins lisent tout"
  ON tarifs FOR SELECT
  USING (get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "tarifs: admins inserent"
  ON tarifs FOR INSERT
  WITH CHECK (get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "tarifs: admins modifient"
  ON tarifs FOR UPDATE
  USING (get_my_role() IN ('super_admin', 'president'))
  WITH CHECK (get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "tarifs: super_admin supprime"
  ON tarifs FOR DELETE
  USING (get_my_role() = 'super_admin');

-- ── evenements ──────────────────────────────────────────────

ALTER TABLE evenements
  ADD COLUMN supprime_le  TIMESTAMPTZ,
  ADD COLUMN supprime_par UUID REFERENCES profiles(id);

DROP POLICY IF EXISTS "evenements_public_select" ON evenements;
CREATE POLICY "evenements_public_select"
  ON evenements FOR SELECT
  USING (actif = TRUE AND supprime_le IS NULL AND (expire_le IS NULL OR expire_le >= CURRENT_DATE));

DROP POLICY IF EXISTS "evenements: gestionnaires" ON evenements;
DROP POLICY IF EXISTS "evenements: super_admin total" ON evenements;
DROP POLICY IF EXISTS "evenements_admin_all" ON evenements;

CREATE POLICY "evenements: admins lisent tout"
  ON evenements FOR SELECT
  USING (get_my_role() IN ('super_admin', 'president', 'evenements_com'));

CREATE POLICY "evenements: admins inserent"
  ON evenements FOR INSERT
  WITH CHECK (get_my_role() IN ('super_admin', 'president', 'evenements_com'));

CREATE POLICY "evenements: admins modifient"
  ON evenements FOR UPDATE
  USING (get_my_role() IN ('super_admin', 'president', 'evenements_com'))
  WITH CHECK (get_my_role() IN ('super_admin', 'president', 'evenements_com'));

CREATE POLICY "evenements: super_admin supprime"
  ON evenements FOR DELETE
  USING (get_my_role() = 'super_admin');
