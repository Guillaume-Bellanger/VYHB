-- Ajouter la colonne photo_url_2 à la table evenements
ALTER TABLE evenements ADD COLUMN IF NOT EXISTS photo_url_2 TEXT;
