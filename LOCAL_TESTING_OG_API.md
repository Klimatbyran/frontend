# Local Testing for OG Image API

## Can You Test Locally?

**Yes, you can test locally!** But you need to configure your environment correctly.

## How It Works

### Current Setup

1. **Frontend generates absolute URLs** using `buildAbsoluteUrl()`:
   - Uses `VITE_SITE_ORIGIN` environment variable
   - Defaults to `https://klimatkollen.se` if not set
   - Creates URLs like: `http://localhost:5173/api/og/companies/{id}` (in dev)

2. **Vite dev server has a proxy** configured:
   - `/api/*` requests are proxied to `http://localhost:3000/` (or `VITE_API_PROXY`)
   - This means `/api/og/companies/{id}` → `http://localhost:3000/api/og/companies/{id}`

3. **OG image URLs in meta tags must be absolute** (social media crawlers need full URLs)

## Local Testing Setup

### Option 1: Test with Local Backend (Recommended)

1. **Start your local backend** on `http://localhost:3000`

2. **Set environment variable** in `.env.local` or `.env.development`:
   ```bash
   VITE_SITE_ORIGIN=http://localhost:5173
   VITE_API_PROXY=http://localhost:3000
   ```

3. **Start frontend dev server**:
   ```bash
   npm run dev
   ```

4. **How it works**:
   - Frontend generates: `http://localhost:5173/api/og/companies/{id}`
   - Browser requests: `http://localhost:5173/api/og/companies/{id}`
   - Vite proxy forwards to: `http://localhost:3000/api/og/companies/{id}`
   - Backend generates image and returns it
   - ✅ Works!

### Option 2: Test with Staging Backend

1. **Set environment variables**:
   ```bash
   VITE_SITE_ORIGIN=http://localhost:5173
   VITE_API_PROXY=https://stage.klimatkollen.se
   ```

2. **Start frontend dev server**:
   ```bash
   npm run dev
   ```

3. **How it works**:
   - Frontend generates: `http://localhost:5173/api/og/companies/{id}`
   - Browser requests: `http://localhost:5173/api/og/companies/{id}`
   - Vite proxy forwards to: `https://stage.klimatkollen.se/api/og/companies/{id}`
   - Staging backend generates image
   - ✅ Works!

### Option 3: Disable API (Use Static Files)

If you want to test without the API:

1. **Set environment variable**:
   ```bash
   VITE_OG_USE_API=false
   ```

2. **Generate static images** (if you have them):
   ```bash
   npm run generate:og-images
   ```

3. **Frontend will use static files** from `public/og/` instead of API

## Testing Social Media Previews Locally

### The Challenge

Social media crawlers (Facebook, Twitter, LinkedIn) need to access your OG images. They can't access `localhost` URLs.

### Solutions

#### 1. **Use ngrok or similar tunnel** (Best for testing)
```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, create tunnel
ngrok http 5173

# Use the ngrok URL (e.g., https://abc123.ngrok.io) for testing
# Set VITE_SITE_ORIGIN=https://abc123.ngrok.io
```

Then test with:
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

#### 2. **Test on Staging** (Easier, but requires deployment)
- Deploy to staging
- Test with staging URLs
- Social media crawlers can access staging URLs

#### 3. **View Source Locally** (Quick check)
- Open `http://localhost:5173/sv/companies/{id}`
- View page source
- Check that `<meta property="og:image">` has correct URL
- Verify URL structure is correct (can't test actual image generation this way)

## Recommended Testing Flow

### Phase 1: Local Development (Backend + Frontend)
1. ✅ Start local backend on port 3000
2. ✅ Set `VITE_SITE_ORIGIN=http://localhost:5173`
3. ✅ Start frontend: `npm run dev`
4. ✅ Test in browser: Visit company/municipality pages
5. ✅ Check Network tab: Verify API calls to `/api/og/...` work
6. ✅ View source: Verify OG image URLs are correct

### Phase 2: Staging Deployment (Full Testing)
1. ✅ Deploy backend API to staging
2. ✅ Deploy frontend to staging
3. ✅ Test with staging URLs
4. ✅ Use social media debuggers with staging URLs
5. ✅ Verify images generate correctly
6. ✅ Check cache headers and performance

### Phase 3: Production
1. ✅ Deploy to production
2. ✅ Monitor cache hit rates
3. ✅ Monitor generation times

## Environment Variables Summary

| Variable | Local Dev | Staging | Production |
|----------|-----------|---------|------------|
| `VITE_SITE_ORIGIN` | `http://localhost:5173` | `https://stage.klimatkollen.se` | `https://klimatkollen.se` |
| `VITE_API_PROXY` | `http://localhost:3000` | `https://stage.klimatkollen.se` | (not needed, same origin) |
| `VITE_OG_USE_API` | `true` (default) | `true` | `true` |

## Quick Test Checklist

- [ ] Backend API running locally on port 3000
- [ ] `VITE_SITE_ORIGIN=http://localhost:5173` in `.env.local`
- [ ] Frontend dev server running
- [ ] Visit `/sv/companies/{id}` in browser
- [ ] Open DevTools → Network tab
- [ ] Check for request to `/api/og/companies/{id}`
- [ ] Verify response is PNG image
- [ ] View page source → Check `<meta property="og:image">` tag
- [ ] Verify URL is absolute and correct

## Troubleshooting

### Issue: OG image URL is `https://klimatkollen.se/api/og/...` in localhost
**Solution**: Set `VITE_SITE_ORIGIN=http://localhost:5173` in `.env.local`

### Issue: API request fails (404 or connection error)
**Solution**: 
- Check backend is running on port 3000
- Check `VITE_API_PROXY` is set correctly
- Check Vite proxy config in `vite.config.ts`

### Issue: Image doesn't load
**Solution**:
- Check browser console for errors
- Check Network tab for failed requests
- Verify backend endpoint is implemented
- Check backend logs for errors

### Issue: Social media preview doesn't work
**Solution**: 
- Use ngrok tunnel OR
- Test on staging (social crawlers can't access localhost)

## Answer to Your Question

**You can test locally!** You don't need to merge to staging first.

**For basic testing** (view source, check URLs, test API calls):
- ✅ Works with localhost + local backend

**For social media preview testing** (Facebook, Twitter, LinkedIn):
- ⚠️ Need staging OR ngrok tunnel (crawlers can't access localhost)

**Recommendation**: 
1. Test locally first (backend + frontend)
2. Deploy to staging for full social media preview testing
3. Deploy to production
