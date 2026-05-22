# Edge Function — alert-postes

Envoie des emails d'alerte lorsqu'un match a des postes obligatoires non attribués.  
Trois niveaux d'alerte : **J-7** (info), **J-3** (attention), **J-1** (urgent).

## Comportement

La fonction est appelée une fois par jour à 9h. Elle gère les 3 niveaux en interne :

| Niveau | Sujet | Ton |
|--------|-------|-----|
| J-7 | 📋 Postes à attribuer - Match dans 7 jours | Informatif |
| J-3 | ⚠️ Rappel - Postes non attribués - Match dans 3 jours | Attention |
| J-1 | 🚨 URGENT - Postes non attribués - Match DEMAIN | Urgent |

- Fenêtre de détection : ±2h autour du jour cible (évite les doublons si la cron tourne en léger décalage)
- Destinataires : responsable(s) de la catégorie du match + tous les super_admin
- Un mail par match concerné, par niveau
- Seuls les postes **obligatoires** (`facultatif = false`) déclenchent une alerte
- Le champ `lieu` est inclus dans le mail s'il est renseigné

## Variables d'environnement requises

| Variable | Source | Description |
|----------|--------|-------------|
| `RESEND_API_KEY` | resend.com → API Keys | Clé API pour l'envoi d'emails |
| `SUPABASE_URL` | Injectée automatiquement | URL du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Injectée automatiquement ou secrets | Clé service role (accès complet) |

## 1. Créer un compte Resend et obtenir la clé API

1. Aller sur [resend.com](https://resend.com) → créer un compte gratuit  
   (quota : 3 000 emails/mois, 100/jour)
2. Dashboard → **API Keys** → **Create API Key**
   - Nom : `vyhb-alert-postes`
   - Permissions : **Sending access**
3. Copier la clé `re_xxx...` (elle n'est affichée qu'une seule fois)

**Vérifier le domaine expéditeur** (optionnel mais recommandé) :
- Resend Dashboard → **Domains** → **Add Domain** → entrer `vyhb.fr`
- Suivre les instructions DNS (enregistrements SPF/DKIM/DMARC)
- Sans vérification, utiliser `onboarding@resend.dev` comme expéditeur pour les tests  
  (modifier `from` dans `index.ts`)

## 2. Déployer la fonction

```bash
# Installer le CLI Supabase si nécessaire
npm install -g supabase

# Se connecter
supabase login

# Lier au projet (project-ref visible dans Dashboard → Settings → General)
supabase link --project-ref qasrphlunnbioicircdz

# Configurer les secrets
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Déployer
supabase functions deploy alert-postes
```

## 3. Planifier le déclenchement (pg_cron)

Exécuter une fois dans **Supabase SQL Editor** :

```sql
SELECT cron.schedule(
  'alert-postes-daily',
  '0 9 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/alert-postes',
    headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  )$$
);
```

> pg_cron utilise l'heure UTC. `0 9 * * *` = 9h00 UTC = 10h00 ou 11h00 heure Paris (selon l'heure d'été).

Pour vérifier le job planifié :
```sql
SELECT * FROM cron.job;
```

Pour supprimer le job :
```sql
SELECT cron.unschedule('alert-postes-daily');
```

## 4. Tester manuellement

```bash
# Via curl
curl -X POST https://qasrphlunnbioicircdz.supabase.co/functions/v1/alert-postes \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>"
```

Ou depuis Supabase Dashboard → **Edge Functions** → **alert-postes** → **Invoke**.

Réponse attendue :
```json
{ "message": "Alertes envoyées", "total": 2, "j7": 1, "j3": 1, "j1": 0 }
```
