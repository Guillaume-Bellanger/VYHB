-- ============================================================
-- Migration 015 — Table encadrement (CMS admin)
-- À exécuter dans Supabase SQL Editor
--
-- Bucket Storage "encadrement" : créé manuellement côté Dashboard
-- (public, comme demandé) — pas de INSERT INTO storage.buckets ici.
-- Les policies storage.objects ci-dessous restent nécessaires car le
-- flag "public" d'un bucket ne couvre que la lecture, pas les écritures.
--
-- Écart avec la demande initiale : `prenom` a été rendu NULLABLE
-- (au lieu de NOT NULL). Les données réelles de src/data/bureau.ts
-- contiennent des postes sans titulaire ("Vice-Président", "Secrétaire",
-- "Resp. Matériel", "Resp. Communication") — imposer NOT NULL aurait
-- forcé soit à inventer un nom, soit à faire échouer l'INSERT.
-- ============================================================

-- ── Table ───────────────────────────────────────────────────

CREATE TABLE encadrement (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL CHECK (type IN ('entraineur', 'bureau', 'pole')),
  prenom      TEXT,
  nom         TEXT,
  role        TEXT,           -- "Président", "Trésorière", "Resp. Matériel"...
  categories  TEXT[],         -- pour les entraîneurs
  photo_url   TEXT,
  ordre       INTEGER NOT NULL DEFAULT 0,
  actif       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE encadrement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "encadrement: lecture publique"
  ON encadrement FOR SELECT USING (actif = TRUE);

CREATE POLICY "encadrement: admins gerent"
  ON encadrement FOR ALL
  USING (get_my_role() IN ('super_admin', 'president'));

-- ── Trigger updated_at (réutilise set_updated_at() de schema.sql) ─

CREATE TRIGGER trg_encadrement_updated_at
  BEFORE UPDATE ON encadrement
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Storage policies bucket "encadrement" (bucket créé côté Dashboard) ─

CREATE POLICY "encadrement objects: lecture publique"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'encadrement');

CREATE POLICY "encadrement objects: admins upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'encadrement' AND get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "encadrement objects: admins update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'encadrement' AND get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "encadrement objects: admins delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'encadrement' AND get_my_role() IN ('super_admin', 'president'));

-- ── Données — reprises telles quelles de src/data/entraineurs.ts et src/data/bureau.ts ─
-- `ordre` est scopé par section (0-based au sein de chaque `type`).
-- Les catégories d'entraîneur sont dérivées du champ `role` texte actuel
-- (ex. "-11F / -15F" → ARRAY['-11F','-15F']) ; certaines valeurs ("-15M/-18M",
-- "-18F") ne correspondent à aucune catégorie canonique de src/data/categories.ts
-- mais sont conservées telles quelles (aucune donnée inventée ni corrigée).

-- Entraîneurs
INSERT INTO encadrement (type, prenom, categories, photo_url, ordre) VALUES
('entraineur', 'Véronique', ARRAY['Baby', '-7', '-9/-11'], '/images/Vero.jpeg', 0),
('entraineur', 'Alexandre', ARRAY['-7'], '/images/Alexandre.jpeg', 1),
('entraineur', 'Céline', ARRAY['-9/-11'], '/images/Celine.jpeg', 2),
('entraineur', 'Fred', ARRAY['-11F', '-15F'], '/images/Fred.jpeg', 3),
('entraineur', 'Jérémy', ARRAY['-13M'], '/images/Jeremy.jpeg', 4),
('entraineur', 'Guillaume', ARRAY['-15M/-18M', 'Seniors Masculins'], '/images/Guillaume.jpeg', 5),
('entraineur', 'Lénaïck', ARRAY['-15M/-18M'], '/images/Lenaick.jpeg', 6),
('entraineur', 'Ronan', ARRAY['-18F'], '/images/Ronan.jpeg', 7),
('entraineur', 'Sofian', ARRAY['Seniors Féminines'], '/images/Sophian%20handball.jpeg', 8),
('entraineur', 'Sylvain', ARRAY['Seniors Masculins'], 'https://ui-avatars.com/api/?name=Sylvain&background=cc0000&color=fff&size=128&bold=true', 9),
('entraineur', 'Lydie', ARRAY['Loisirs'], '/images/Lydie.jpeg', 10),
('entraineur', 'Michel', ARRAY['Loisirs'], '/images/Michel.jpeg', 11);

-- Le Bureau
INSERT INTO encadrement (type, prenom, role, photo_url, ordre) VALUES
('bureau', 'Fred', 'Président', '/images/Fred.jpeg', 0),
('bureau', NULL, 'Vice-Président', NULL, 1),
('bureau', 'Véronique', 'Trésorière', '/images/Vero.jpeg', 2),
('bureau', NULL, 'Secrétaire', NULL, 3);

-- Responsables de Pôles
INSERT INTO encadrement (type, role, ordre) VALUES
('pole', 'Resp. Matériel', 0),
('pole', 'Resp. Communication', 1);
