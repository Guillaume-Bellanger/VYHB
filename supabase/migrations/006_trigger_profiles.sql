-- Trigger : création automatique du profil à l'invitation
-- Lit pending_invites pour assigner le bon rôle/catégorie

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role      user_role := 'entraineur';
  v_categorie TEXT      := NULL;
BEGIN
  SELECT role, categorie
  INTO   v_role, v_categorie
  FROM   pending_invites
  WHERE  email = NEW.email;

  INSERT INTO profiles (id, full_name, role, email, categorie)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(v_role, 'entraineur'),
    NEW.email,
    v_categorie
  )
  ON CONFLICT (id) DO NOTHING;

  DELETE FROM pending_invites WHERE email = NEW.email;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;

CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
