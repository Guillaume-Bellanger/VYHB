-- ============================================================
-- Migration 014 — Table collectifs (CMS admin)
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- ── Table ───────────────────────────────────────────────────

CREATE TABLE collectifs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  nom          TEXT NOT NULL,
  sous_titre   TEXT,
  tranche_age  TEXT,
  description  TEXT,
  horaires     JSONB,   -- [{ jour, debut, fin }]
  lieux        JSONB,   -- [{ jour, lieu }]
  entraineurs  TEXT[],
  photo_url    TEXT,
  ordre        INTEGER NOT NULL DEFAULT 0,
  actif        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE collectifs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "collectifs: lecture publique"
  ON collectifs FOR SELECT USING (actif = TRUE);

CREATE POLICY "collectifs: admins gerent"
  ON collectifs FOR ALL
  USING (get_my_role() IN ('super_admin', 'president'));

-- ── Trigger updated_at (réutilise set_updated_at() de schema.sql) ─

CREATE TRIGGER trg_collectifs_updated_at
  BEFORE UPDATE ON collectifs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Storage bucket "collectifs" (photos) ───────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('collectifs', 'collectifs', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "collectifs objects: lecture publique"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'collectifs');

CREATE POLICY "collectifs objects: admins upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'collectifs' AND get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "collectifs objects: admins update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'collectifs' AND get_my_role() IN ('super_admin', 'president'));

CREATE POLICY "collectifs objects: admins delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'collectifs' AND get_my_role() IN ('super_admin', 'president'));

-- ── Données — reprises telles quelles de src/data/collectifs.ts ─
-- Ordre d'affichage actuel conservé (ordre 0 à 9).
-- horaires : dérivé de `schedule` (ex. "Mardi 18h30–20h" → {jour, debut, fin})
-- lieux    : dérivé de `location` (une entrée par jour de `schedule`)

INSERT INTO collectifs (slug, nom, sous_titre, tranche_age, description, horaires, lieux, entraineurs, photo_url, ordre, actif) VALUES

('baby-hand', 'Baby Hand', 'Éveil sportif', '3–4 ans',
 'Le Baby Hand initie les tout-petits au handball à travers des jeux adaptés. Éveil moteur, sens de l''équipe et plaisir avant tout.',
 '[{"jour":"Samedi","debut":"10h","fin":"11h"}]',
 '[{"jour":"Samedi","lieu":"Espace Rochopt, Boussy-Saint-Antoine"}]',
 ARRAY['Véronique'],
 '/images/Baby.jpeg', 0, TRUE),

('-7', '-7', 'Découverte du jeu et Premières oppositions', '5–6 ans',
 'Les -7 découvrent le handball à travers des jeux simples et ludiques. Ils apprennent à bouger, à lancer et à jouer ensemble, tout en développant coordination et esprit d''équipe.',
 '[{"jour":"Samedi","debut":"11h","fin":"12h"}]',
 '[{"jour":"Samedi","lieu":"Espace Rochopt, Boussy-Saint-Antoine"}]',
 ARRAY['Véronique', 'Alexandre'],
 '/images/-7.jpeg', 1, TRUE),

('-9-11', '-9/-11', 'Apprentissages fondamentaux', '7–10 ans',
 'Les -9 poursuivent leur découverte du handball avec des jeux plus structurés. Ils apprennent les bases du jeu collectif et gagnent en coordination, tout en construisant leurs premiers automatismes en équipe.',
 '[{"jour":"Mercredi","debut":"16h30","fin":"18h"}]',
 '[{"jour":"Mercredi","lieu":"Gymnase Fontaine-Cornaille, Quincy-sous-Sénart"}]',
 ARRAY['Véronique', 'Céline'],
 '/images/-9-11.jpeg', 2, TRUE),

('-11f', '-11F', 'Départemental', '9–10 ans (Filles)',
 'Les -11F développent leurs bases techniques et tactiques dans un environnement compétitif et solidaire.',
 '[{"jour":"Mardi","debut":"17h","fin":"18h30"}]',
 '[{"jour":"Mardi","lieu":"Halle des Sports, Boussy-Saint-Antoine"}]',
 ARRAY['Fred'],
 '/images/-11F.jpeg', 3, TRUE),

('-13m', '-13M', 'Départemental', '11–12 ans (Garçons)',
 'Les -13M évoluent en compétition départementale et perfectionnent leur jeu dans un groupe soudé et ambitieux.',
 '[{"jour":"Mardi","debut":"17h","fin":"18h30"}]',
 '[{"jour":"Mardi","lieu":"Halle des Sports, Boussy-Saint-Antoine"}]',
 ARRAY['Jérémy'],
 '/images/-13M.jpeg', 4, TRUE),

('-15-18m', '-15/-18M', 'Départemental', '13–17 ans (Garçons)',
 'Un collectif engagé, une vraie dynamique de groupe pour se dépasser ensemble et préparer l''avenir vers les seniors.',
 '[{"jour":"Mardi","debut":"18h30","fin":"20h"},{"jour":"Jeudi","debut":"18h30","fin":"20h"}]',
 '[{"jour":"Mardi","lieu":"La Halle des Sports, Boussy-Saint-Antoine"},{"jour":"Jeudi","lieu":"Gymnase des Antonins, Boussy-Saint-Antoine"}]',
 ARRAY['Guillaume', 'Lénaïck'],
 '/images/-15M.jpeg', 5, TRUE),

('-15-18f', '-15/-18F', 'Départemental', '13–17 ans (Filles)',
 'Un handball qui se vit en équipe, une belle dynamique de groupe pour progresser ensemble vers le handball senior.',
 '[{"jour":"Mardi","debut":"18h15","fin":"19h45"},{"jour":"Jeudi","debut":"18h30","fin":"20h"}]',
 '[{"jour":"Mardi","lieu":"Gymnase des Antonins, Boussy-Saint-Antoine"},{"jour":"Jeudi","lieu":"Gymnase des Antonins, Boussy-Saint-Antoine"}]',
 ARRAY['Fred', 'Ronan'],
 '/images/-15-18.jpeg', 6, TRUE),

('seniors-feminines', 'Seniors Féminines', 'Départemental, Entente avec le Club de Crosne', 'Dès 18 ans',
 'La force d''une entente, l''énergie d''un collectif et la passion du handball pour avancer ensemble.',
 '[{"jour":"Lundi","debut":"20h","fin":"22h"},{"jour":"Mercredi","debut":"20h","fin":"22h"}]',
 '[{"jour":"Lundi","lieu":"Salle La Palestre, Crosne"},{"jour":"Mercredi","lieu":"La Halle des Sports, Boussy-Saint-Antoine"}]',
 ARRAY['Sofian'],
 '/images/S%C3%A9nior%20Feminines.jpeg', 7, TRUE),

('seniors-masculins', 'Seniors Masculins', 'Départemental', 'Dès 18 ans',
 'L''expérience au service du collectif, avec toujours l''envie d''aller plus loin.',
 '[{"jour":"Mardi","debut":"20h","fin":"22h"},{"jour":"Jeudi","debut":"20h","fin":"22h"}]',
 '[{"jour":"Mardi","lieu":"Halle des Sports, Boussy-Saint-Antoine"},{"jour":"Jeudi","lieu":"Halle des Sports, Boussy-Saint-Antoine"}]',
 ARRAY['Guillaume', 'Sylvain'],
 '/images/Senior%20Masculins.jpeg', 8, TRUE),

('loisirs', 'Loisirs', 'Matchs amicaux', 'Dès 16 ans',
 'Le handball version plaisir : jouer, partager, progresser… et se retrouver aussi lors de matchs amicaux.',
 '[{"jour":"Lundi","debut":"20h30","fin":"22h30"},{"jour":"Vendredi","debut":"20h","fin":"22h"}]',
 '[{"jour":"Lundi","lieu":"Gymnase Fontaine Cornaille, Quincy-sous-Sénart"},{"jour":"Vendredi","lieu":"La Halle des Sports, Boussy-Saint-Antoine"}]',
 ARRAY['Lydie', 'Michel'],
 '/images/Loisir.jpeg', 9, TRUE);
