-- ============================================================
-- Migration 017 — Table site_content (CMS textes libres)
-- À exécuter dans Supabase SQL Editor
--
-- Écarts avec la demande initiale (documentés, design public inchangé) :
-- 1. `club.historique` : la consigne décrit une liste "année + texte", mais
--    la donnée réelle (src/pages/Club.tsx `timeline`) a 3 champs par entrée
--    (année, titre, texte). Les 3 champs sont conservés (annee/titre/texte)
--    pour ne rien perdre visuellement — le titre en gras est distinct du
--    texte descriptif dans la timeline actuelle.
-- 2. `club.texte_benevoles` : dans Club.tsx, un des 4 paragraphes ("Nous
--    avons besoin de vous !") a un style gras/plus grand distinct des
--    autres. En consolidant ces paragraphes dans un seul champ texte_long
--    éditable (séparés par une ligne vide), cette mise en emphase
--    particulière est perdue — tous les paragraphes prennent le même style
--    au rendu. Compromis nécessaire pour un champ CMS texte libre simple.
-- 3. `accueil.accroche_hero` : interprété comme le paragraphe sous le H1
--    hero ("Un club convivial et dynamique...") — le H1 lui-même contient
--    des <span> stylés (gradient, saut de ligne) et reste en dur pour ne
--    pas risquer de casser ce balisage avec un champ texte libre.
-- ============================================================

-- ── Table ───────────────────────────────────────────────────

CREATE TABLE site_content (
  cle         TEXT PRIMARY KEY,   -- 'club.historique', 'club.valeurs'...
  libelle     TEXT NOT NULL,      -- nom lisible dans l'admin
  groupe      TEXT NOT NULL,      -- 'Le Club', 'Contact', 'Accueil'
  type        TEXT NOT NULL CHECK (type IN ('texte', 'texte_long', 'liste')),
  valeur      JSONB NOT NULL,     -- string ou tableau selon le type
  ordre       INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_content: lecture publique"
  ON site_content FOR SELECT USING (TRUE);

CREATE POLICY "site_content: admins gerent"
  ON site_content FOR ALL
  USING (get_my_role() IN ('super_admin', 'president'));

-- ── Trigger updated_at (réutilise set_updated_at() de schema.sql) ─

CREATE TRIGGER trg_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Données — reprises telles quelles des pages Club.tsx, Contact.tsx, Index.tsx ─

INSERT INTO site_content (cle, libelle, groupe, type, valeur, ordre) VALUES

-- Le Club
('club.historique', 'Historique du club (timeline)', 'Le Club', 'liste',
 jsonb_build_array(
   jsonb_build_object(
     'annee', $$~2003$$,
     'titre', $$Fondation du club$$,
     'texte', $$Création du VYHB au cœur du Val d'Yerres. Les premières équipes voient le jour avec une poignée de passionnés.$$
   ),
   jsonb_build_object(
     'annee', $$~2010$$,
     'titre', $$Développement du secteur Jeunes$$,
     'texte', $$Naissance de l'école de handball. Les catégories Baby Hand, -7 et -9 se structurent. La formation devient une priorité.$$
   ),
   jsonb_build_object(
     'annee', $$~2015$$,
     'titre', $$Croissance et compétitions$$,
     'texte', $$Le club atteint 10 équipes en compétition. Les seniors s'imposent en championnat départemental.$$
   ),
   jsonb_build_object(
     'annee', $$Aujourd'hui$$,
     'titre', $$245 licenciés, 10 équipes$$,
     'texte', $$Plus qu'un club, une famille. Une communauté engagée, des bénévoles dévoués, et la même passion intacte depuis plus de 20 ans.$$
   )
 ),
 0),

('club.valeurs', 'Nos valeurs', 'Le Club', 'liste',
 jsonb_build_array(
   jsonb_build_object(
     'titre', $$Respect$$,
     'texte', $$Le respect de chacun (coéquipiers, entraîneurs, adversaires, arbitres), des règles et de notre environnement est la base d'une pratique sportive saine, collective et constructive.$$
   ),
   jsonb_build_object(
     'titre', $$Plaisir$$,
     'texte', $$Le plaisir, c'est partager des moments ensemble, s'investir dans l'effort, vivre sa passion et savourer les réussites ; il nourrit l'envie de progresser, de persévérer et de transmettre cette énergie aux autres.$$
   ),
   jsonb_build_object(
     'titre', $$Dépassement de soi$$,
     'texte', $$Le dépassement de soi, c'est oser aller plus loin que ses limites, se découvrir de nouvelles capacités et progresser au service de soi-même comme du collectif.$$
   ),
   jsonb_build_object(
     'titre', $$Convivialité$$,
     'texte', $$La convivialité, c'est créer des liens, partager des moments ensemble et faire vivre un esprit de club chaleureux et accueillant.$$
   )
 ),
 1),

('club.texte_entraineurs', 'Texte intro — Entraîneurs', 'Le Club', 'texte_long',
 to_jsonb($$Nos entraîneurs et bénévoles sont le cœur battant du club. Leur passion, leur disponibilité et leur engagement font vivre le club au quotidien.$$::text),
 2),

('club.texte_benevoles', 'Texte — Bénévoles', 'Le Club', 'texte_long',
 to_jsonb($$Au Val d'Yerres Handball, rien ne serait possible sans l'engagement précieux de nos bénévoles. Qu'ils soient sur le terrain, en coulisses ou derrière un ordinateur, ils font vivre le club au quotidien et permettent à toutes nos équipes de pratiquer leur passion dans les meilleures conditions.

Nous avons besoin de vous !

Toutes les bonnes volontés sont les bienvenues : entraînement et encadrement, aide administrative, communication et réseaux sociaux, organisation d'événements, logistique, buvette, responsable de salles…

Intéressé(e) ? Contactez-nous via le site ou par mail. Ensemble, faisons grandir notre club !$$::text),
 3),

('club.texte_ecole_arbitrage', 'Texte — École d''arbitrage', 'Le Club', 'texte_long',
 to_jsonb($$Notre école d'arbitrage accompagne les jeunes qui souhaitent s'initier à l'arbitrage dans un cadre bienveillant et structuré. Encadrés par des arbitres expérimentés, ils apprennent à maîtriser les règles du jeu, à gérer une rencontre et à développer leur confiance en eux et leur sens des responsabilités. Arbitrer, c'est une autre façon d'aimer le handball.$$::text),
 4),

-- Contact
('contact.email', 'Email de contact', 'Contact', 'texte',
 to_jsonb($$vyhandball@gmail.com$$::text),
 5),

('contact.adresse_gymnase', 'Adresse du gymnase', 'Contact', 'texte',
 to_jsonb($$La Halle des Sports, Boussy-Saint-Antoine$$::text),
 6),

-- Accueil
('accueil.accroche_hero', 'Accroche (sous le titre hero)', 'Accueil', 'texte_long',
 to_jsonb($$Un club convivial et dynamique. 245 licenciés, 10 équipes, 23 ans de passion — du baby hand aux seniors.$$::text),
 7),

('accueil.texte_famille', 'Texte — Plus qu''un club, une famille', 'Accueil', 'texte_long',
 to_jsonb($$Fondé il y a bientôt 23 ans, le Val d'Yerres Handball rassemble 245 licenciés répartis dans 10 équipes, du Baby Hand aux seniors.

Que vous soyez débutant ou confirmé, enfant ou adulte, compétiteur ou joueur loisir : il y a toujours une place pour vous chez nous.$$::text),
 8);
