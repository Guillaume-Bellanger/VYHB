# Edge Function — alert-postes

Envoie un email d'alerte lorsqu'un match a des postes obligatoires non attribués 7 jours avant sa date.

## Déclenchement

Quotidien à 9h00 UTC via pg_cron. SQL à exécuter une fois dans Supabase SQL Editor :

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

## Variables d'environnement requises

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Clé API Resend (obtenue sur resend.com) |
| `SUPABASE_URL` | URL du projet Supabase (injectée automatiquement) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (injectée automatiquement) |

## Créer un compte Resend et obtenir la clé API

1. Aller sur [resend.com](https://resend.com) → créer un compte gratuit (3 000 mails/mois)
2. Dashboard → **API Keys** → **Create API Key**
3. Nom : `vyhb-alert-postes`, permissions : **Sending access**
4. Copier la clé affichée (elle ne sera plus visible ensuite)
5. Dans Supabase Dashboard → **Settings** → **Edge Functions** → ajouter le secret :
   - Nom : `RESEND_API_KEY`
   - Valeur : la clé copiée

> **Domaine expéditeur** : l'adresse `noreply@vyhb.fr` doit être vérifiée dans Resend.
> Dashboard Resend → **Domains** → **Add Domain** → suivre les instructions DNS.
> En attendant la vérification, utiliser `onboarding@resend.dev` pour les tests.

## Déployer la fonction

```bash
# Installer Supabase CLI si besoin
npm install -g supabase

# Se connecter
supabase login

# Lier au projet (récupérer le project-ref dans le dashboard Supabase)
supabase link --project-ref <project-ref>

# Configurer le secret Resend
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Déployer
supabase functions deploy alert-postes
```

## Tester manuellement

```bash
# Appel direct via curl (remplacer le token)
curl -X POST https://<project-ref>.supabase.co/functions/v1/alert-postes \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>"
```

Ou depuis Supabase Dashboard → **Edge Functions** → **alert-postes** → **Invoke**.

## Comportement

- Fenêtre de détection : ±1h autour de J-7 (évite les doublons si la cron tourne légèrement en retard)
- Destinataires : responsable(s) de la catégorie du match + tous les super_admin
- Un mail par match concerné (pas un mail global groupé)
- Les postes facultatifs (vidéaste, buvette) ne déclenchent pas d'alerte
