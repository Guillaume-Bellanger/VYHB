-- Corrige la récursion infinie dans les policies profiles
-- Remplace EXISTS(...FROM profiles...) par (SELECT role FROM profiles WHERE id = auth.uid())

DROP POLICY IF EXISTS "profiles: super_admin lit tout" ON profiles;
DROP POLICY IF EXISTS "profiles: super_admin update" ON profiles;

CREATE POLICY "profiles: admins lisent tout"
  ON profiles FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid())
    IN ('super_admin', 'president')
  );

CREATE POLICY "profiles: admins update"
  ON profiles FOR UPDATE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid())
    IN ('super_admin', 'president')
  );
