-- ── Nouveaux rôles ──────────────────────────────────────────────────────────

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'president';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'entraineur';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'evenements_com';

-- ── Migration des données existantes ────────────────────────────────────────

UPDATE profiles SET role = 'entraineur'     WHERE role = 'responsable';
UPDATE profiles SET role = 'evenements_com' WHERE role = 'redacteur';

-- ── Policies matches ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "matches: responsable select" ON matches;
DROP POLICY IF EXISTS "matches: responsable insert" ON matches;
DROP POLICY IF EXISTS "matches: responsable update" ON matches;
DROP POLICY IF EXISTS "matches: redacteur update resume" ON matches;

CREATE POLICY "matches: president total"
  ON matches FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'president')
  );

CREATE POLICY "matches: entraineur select"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'entraineur' AND p.categorie = matches.categorie
    )
  );

CREATE POLICY "matches: entraineur insert"
  ON matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'entraineur' AND p.categorie = matches.categorie
    )
  );

CREATE POLICY "matches: entraineur update"
  ON matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'entraineur'
      AND p.categorie = matches.categorie
    )
  );

CREATE POLICY "matches: evenements_com update"
  ON matches FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'evenements_com')
  );

-- ── Policies postes ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "postes: responsable" ON match_postes;

CREATE POLICY "postes: tous authentifiés"
  ON match_postes FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ── Policies evenements ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "evenements: super_admin total" ON evenements;

CREATE POLICY "evenements: gestionnaires"
  ON evenements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'president', 'evenements_com')
    )
  );

-- ── Policies ticker ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "ticker: super_admin gère tout" ON ticker_messages;

CREATE POLICY "ticker: gestionnaires"
  ON ticker_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'president', 'evenements_com')
    )
  );
