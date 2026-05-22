-- ENUM catégorie
DO $$ BEGIN
  CREATE TYPE evenement_categorie AS ENUM ('recrutement', 'evenement', 'tournoi', 'info', 'autre');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Table
CREATE TABLE IF NOT EXISTS evenements (
  id          UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  titre       TEXT                 NOT NULL,
  categorie   evenement_categorie  NOT NULL DEFAULT 'evenement',
  date_debut  DATE                 NOT NULL,
  date_fin    DATE,
  lieu        TEXT,
  description TEXT                 NOT NULL,
  photo_url   TEXT,
  lien_cta    TEXT,
  label_cta   TEXT,
  publie_le   DATE                 NOT NULL DEFAULT CURRENT_DATE,
  expire_le   DATE,
  actif       BOOLEAN              NOT NULL DEFAULT TRUE,
  ordre       INTEGER              NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ          DEFAULT NOW(),
  updated_at  TIMESTAMPTZ          DEFAULT NOW()
);

-- RLS
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;

-- Lecture publique : actif + non expiré
CREATE POLICY "evenements_public_select" ON evenements
  FOR SELECT
  USING (actif = TRUE AND (expire_le IS NULL OR expire_le >= CURRENT_DATE));

-- super_admin : accès total
CREATE POLICY "evenements_admin_all" ON evenements
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_evenements_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS evenements_updated_at ON evenements;
CREATE TRIGGER evenements_updated_at
  BEFORE UPDATE ON evenements
  FOR EACH ROW EXECUTE FUNCTION update_evenements_updated_at();
