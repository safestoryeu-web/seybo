# Nasadenie na web (Vercel)

Na localhost funguje app s premennými z `.env.local`. Na webe sa tento súbor **nepoužíva** (a nemá sa do repozitára commitovať). Premenné treba nastaviť priamo vo Vercel.

## Ako pridať premenné vo Vercel

1. Otvor [vercel.com](https://vercel.com) → svoj projekt.
2. **Settings** → **Environment Variables**.
3. Pridaj **rovnaké** premenné ako v `.env.local` (názov + hodnota):

   | Názov | Kde to berieš |
   |------|----------------|
   | `GOOGLE_GEMINI_API_KEY` | Google AI Studio → Get API key |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → anon public key |
   | `GOOGLE_TTS_CLIENT_EMAIL` | Service account JSON (ak používaš TTS) |
   | `GOOGLE_TTS_PRIVATE_KEY` | Celý privátny kľúč z JSON (vrátane -----BEGIN/END-----) |

4. Pre každú premennú zvoľ **Environment**: Production (a prípadne Preview).
5. Ulož a sprav **Redeploy** projektu (Deployments → … → Redeploy).

## Bezpečnosť

API kľúče sú čítané **len na serveri** (v `/api/generate-story` a `/api/tts`). Do prehliadača sa neposielajú, takže ostávajú skryté.
