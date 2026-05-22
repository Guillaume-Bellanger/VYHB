-- ============================================================
-- VYHB — Val d'Yerres Handball — Supabase Schema (v2)
-- ============================================================

-- ── Enum types ──────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('super_admin', 'responsable', 'redacteur');
CREATE TYPE match_type AS ENUM ('championnat', 'coupe', 'amical', 'tournoi');
CREATE TYPE match_statut AS ENUM ('prevu', 'joue', 'publie');

-- ── Table profiles ──────────────────────────────────────────

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role   NOT NULL DEFAULT 'redacteur',
  categorie   TEXT,                       -- NULL pour super_admin et redacteur
  full_name   TEXT        NOT NULL,
  email       TEXT,                       -- copié depuis auth.users pour affichage admin
  disabled    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table matches ───────────────────────────────────────────

CREATE TABLE matches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date        TIMESTAMPTZ NOT NULL,
  adversaire  TEXT        NOT NULL,
  domicile    BOOLEAN     NOT NULL DEFAULT TRUE,
  score_nous  INTEGER,
  score_eux   INTEGER,
  categorie   TEXT        NOT NULL,
  type        match_type  NOT NULL DEFAULT 'championnat',
  statut      match_statut NOT NULL DEFAULT 'prevu',
  resume      TEXT,
  lieu        TEXT,
  created_by  UUID        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table pending_invites ───────────────────────────────────
-- Permet d'assigner un rôle/catégorie avant le 1er login de l'utilisateur invité

CREATE TABLE pending_invites (
  email       TEXT        PRIMARY KEY,
  role        user_role   NOT NULL DEFAULT 'redacteur',
  categorie   TEXT,
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Trigger updated_at automatique ─────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Trigger : créer un profil à l'inscription auth ─────────
-- Lit pending_invites pour assigner le bon rôle au nouvel utilisateur

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role      user_role := 'redacteur';
  v_categorie TEXT      := NULL;
BEGIN
  SELECT role, categorie
  INTO   v_role, v_categorie
  FROM   pending_invites
  WHERE  email = NEW.email;

  INSERT INTO profiles (id, full_name, role, email, categorie)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(v_role, 'redacteur'),
    NEW.email,
    v_categorie
  );

  -- Nettoyer l'invitation utilisée
  DELETE FROM pending_invites WHERE email = NEW.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_invites ENABLE ROW LEVEL SECURITY;

-- ── profiles ─────────────────────────────────────────────────

CREATE POLICY "profiles: lecture propre"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: super_admin lit tout"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "profiles: super_admin update"
  ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- ── pending_invites ───────────────────────────────────────────

CREATE POLICY "pending_invites: super_admin gère tout"
  ON pending_invites FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- ── matches ───────────────────────────────────────────────────

-- Lecture publique : matchs publiés ET prévus (calendrier public)
CREATE POLICY "matches: lecture publique"
  ON matches FOR SELECT
  USING (statut IN ('publie', 'prevu'));

-- super_admin : accès total
CREATE POLICY "matches: super_admin total"
  ON matches FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- responsable : SELECT/INSERT/UPDATE sur sa catégorie
CREATE POLICY "matches: responsable select"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'responsable' AND p.categorie = matches.categorie
    )
  );

CREATE POLICY "matches: responsable insert"
  ON matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'responsable' AND p.categorie = matches.categorie
    )
  );

CREATE POLICY "matches: responsable update"
  ON matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'responsable' AND p.categorie = matches.categorie
    )
  );

-- redacteur : UPDATE uniquement (restriction colonne gérée dans l'app)
CREATE POLICY "matches: redacteur update resume"
  ON matches FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'redacteur')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'redacteur')
  );
