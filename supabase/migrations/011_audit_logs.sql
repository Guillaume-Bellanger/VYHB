-- ============================================================
-- Migration 011 — Table audit_logs
-- À exécuter dans Supabase SQL Editor
-- ============================================================

CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name    TEXT,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL, -- 'match', 'evenement', 'poste', 'user'
  entity_id    UUID,
  entity_label TEXT,
  details      JSONB,         -- { avant: {...}, apres: {...} } ou détail libre
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs: super_admin lit tout"
  ON audit_logs FOR SELECT
  USING (get_my_role() = 'super_admin');

CREATE POLICY "audit_logs: insert authentifié"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
