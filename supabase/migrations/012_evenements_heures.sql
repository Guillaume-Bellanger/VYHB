-- Ajouter les colonnes heure_debut et heure_fin à la table evenements
ALTER TABLE evenements ADD COLUMN IF NOT EXISTS heure_debut TIME;
ALTER TABLE evenements ADD COLUMN IF NOT EXISTS heure_fin TIME;
