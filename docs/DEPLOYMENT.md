# Deployment Guide

## Prerequisites

- Supabase account (free tier works)
- Cloudflare account (free tier works)
- HBuilderX (for mobile app building)
- Apple Developer account (for iOS) or Android signing key

---

## Step 1: Database Setup (Supabase)

1. **Create Supabase project**
   - Go to https://supabase.com
   - Create new project
   - Save the Project URL and API keys

2. **Run database schema**
   - Go to SQL Editor in Supabase dashboard
   - Open `docs/auth-setup.sql`
   - Copy and paste all SQL
   - Click "Run"

3. **Verify tables created**
   - Go to Table Editor
   - Should see `players` and `scores` tables

4. **Copy credentials**
   - Project Settings → API
   - Copy `URL` (e.g., `https://xyzabc.supabase.co`)
   - Copy `service_role key` (for worker)
   - Copy `anon key` (for worker)

---

## Step 2: Cloudflare Worker Setup

1. **Create Worker**
   - Go to https://dash.cloudflare.com
   - Workers & Pages → Create application
   - Create Worker
   - Name it (e.g., `sgit-api`)

2. **Deploy code**
   - Click "Edit code"
   - Open `docs/worker-simple.js`
   - Copy all code
   - Paste into Cloudflare editor
   - Click "Deploy"

3. **Set environment variables**
   - Go to Settings → Variables
   - Add the following:

   | Name | Value |
   |------|-------|
   | `SUPABASE_URL` | https://your-project.supabase.co |
   | `SUPABASE_SERVICE_KEY` | your-service-role-key |
   | `SUPABASE_ANON_KEY` | your-anon-key |

4. **Add custom domain (optional but recommended)**
   - Go to Settings → Triggers → Custom Domains
   - Add domain (e.g., `sgit-api.yourdomain.com`)
   - Or use `*.workers.dev` subdomain

5. **Update frontend API URL**
   - Open `pages/index/index.vue`
   - Find: `const API_BASE_URL = 'https://...'`
   - Change to your Worker URL

---

## Step 3: Mobile App Build

### HBuilderX Setup

1. **Install HBuilderX**
   - Download from https://www.dcloud.io/hbuilderx.html

2. **Import project**
   - File → Import → From local directory
   - Select `SayIt_GuessIt_GetRich` folder

3. **Configure manifest**
   - Open `manifest.json`
   - Fill in app details:
     - App name: 你说我猜马上发财
     - Package name: com.yourcompany.sayit (Android)
     - Bundle ID: com.yourcompany.sayit (iOS)

### Android Build

1. **Generate signing key** (first time only)
   ```bash
   keytool -genkey -alias sayit -keyalg RSA -keysize 2048 -validity 36500 -keystore sayit.keystore
   ```

2. **Configure in HBuilderX**
   - manifest.json → App IDs → DCloud AppID (get one if needed)
   - manifest.json → Android → Signing
   - Fill in keystore details

3. **Build**
   - Build → Native App-Cloud Pack
   - Select Android
   - Choose "Release"
   - Click Pack

### iOS Build

1. **Requirements**
   - macOS
   - Xcode
   - Apple Developer account ($99/year)

2. **Configure in HBuilderX**
   - manifest.json → iOS → Bundle ID
   - Set to your registered App ID

3. **Build**
   - Build → Native App-Cloud Pack
   - Select iOS
   - Choose certificate and profile
   - Click Pack

---

## Step 4: Testing

### API Test (curl)

```bash
# Test registration
curl -X POST https://your-worker.workers.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{"player_name": "TestUser"}'

# Should return: {"player_id": "...", "backup_code": "...", "player_name": "TestUser"}
```

### H5 Test (Browser)

1. In HBuilderX
2. Run → Run to browser → Chrome
3. Test all screens

### Mobile Test

1. Connect phone via USB
2. Enable developer mode
3. In HBuilderX: Run → Run to phone

---

## Environment Summary

After deployment, you should have:

| Component | Location | URL/Path |
|-----------|----------|----------|
| Database | Supabase | https://your-project.supabase.co |
| API | Cloudflare Worker | https://your-worker.workers.dev |
| Frontend Source | Local | ~/workplace/SayIt_GuessIt_GetRich |
| Mobile App | Device | Installed APK/IPA |

---

## Troubleshooting

### API not responding
- Check Cloudflare Worker logs
- Verify environment variables are set
- Test with curl first

### Database errors
- Check Supabase Table Editor
- Verify tables exist
- Check RLS policies

### Build failures
- Update HBuilderX to latest
- Check manifest.json is valid
- Verify signing certificates

### CORS errors
- Ensure Worker has CORS headers
- Check domain is correct in frontend

---

## Production Checklist

- [ ] Database schema deployed
- [ ] Cloudflare Worker deployed with env vars
- [ ] Custom domain configured (optional)
- [ ] Frontend API URL updated
- [ ] App manifest configured
- [ ] Signing certificates ready
- [ ] Tested on device
- [ ] App store accounts ready
