# OAuth Setup Guide

## Problem: 404 Errors on OAuth

Wenn Sie 404-Fehler auf `/auth/v1/authorize` sehen, bedeutet das, dass OAuth in Supabase nicht korrekt konfiguriert ist.

## Setup-Anleitung

### 1. Supabase Dashboard öffnen
1. Gehen Sie zu https://supabase.com/dashboard
2. Wählen Sie Ihr Projekt aus

### 2. OAuth Provider konfigurieren

#### Google OAuth:
1. Gehen Sie zu **Authentication** → **Providers**
2. Klicken Sie auf **Google**
3. Aktivieren Sie Google als Provider
4. Fügen Sie Ihre **Client ID** und **Client Secret** hinzu (von Google Cloud Console)
5. Fügen Sie die **Redirect URL** hinzu:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

#### GitHub OAuth:
1. Gehen Sie zu **Authentication** → **Providers**
2. Klicken Sie auf **GitHub**
3. Aktivieren Sie GitHub als Provider
4. Fügen Sie Ihre **Client ID** und **Client Secret** hinzu (von GitHub Developer Settings)
5. Fügen Sie die **Redirect URL** hinzu:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

### 3. Redirect URLs in Supabase konfigurieren

1. Gehen Sie zu **Authentication** → **URL Configuration**
2. Fügen Sie folgende **Redirect URLs** hinzu:
   - `http://localhost:3000/auth/callback` (für Development)
   - `https://yourdomain.com/auth/callback` (für Production)

### 4. Site URL konfigurieren

1. Gehen Sie zu **Authentication** → **URL Configuration**
2. Stellen Sie die **Site URL** ein:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

### 5. Google Cloud Console Setup (für Google OAuth)

1. Gehen Sie zu https://console.cloud.google.com
2. Erstellen Sie ein neues Projekt oder wählen Sie ein existierendes
3. Gehen Sie zu **APIs & Services** → **Credentials**
4. Erstellen Sie eine **OAuth 2.0 Client ID**
5. Fügen Sie **Authorized redirect URIs** hinzu:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
6. Kopieren Sie **Client ID** und **Client Secret** in Supabase

### 6. GitHub Developer Settings (für GitHub OAuth)

1. Gehen Sie zu https://github.com/settings/developers
2. Klicken Sie auf **New OAuth App**
3. Füllen Sie das Formular aus:
   - **Application name**: Green Claim Check
   - **Homepage URL**: `http://localhost:3000` (oder Ihre Domain)
   - **Authorization callback URL**: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Kopieren Sie **Client ID** und erstellen Sie ein **Client Secret**
5. Fügen Sie beide in Supabase ein

## Testen

Nach der Konfiguration:

1. Starten Sie den Development-Server neu:
   ```bash
   npm run dev
   ```

2. Versuchen Sie sich mit Google/GitHub anzumelden

3. Prüfen Sie die Browser-Konsole auf Fehler

## Häufige Probleme

### Problem: "Provider not enabled"
**Lösung**: Aktivieren Sie den Provider in Supabase Dashboard

### Problem: "Invalid redirect_uri"
**Lösung**: Stellen Sie sicher, dass die Redirect URL in Supabase und beim OAuth Provider (Google/GitHub) übereinstimmt

### Problem: "Client ID or Secret is missing"
**Lösung**: Fügen Sie Client ID und Secret in Supabase Dashboard hinzu

### Problem: 404 auf `/auth/v1/authorize`
**Lösung**: 
- Prüfen Sie, ob `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` korrekt ist
- Prüfen Sie, ob die Supabase-URL das Format `https://xxxxx.supabase.co` hat

## Environment Variables

Stellen Sie sicher, dass Sie folgende Variablen in `.env.local` haben:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Weitere Hilfe

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Providers](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
