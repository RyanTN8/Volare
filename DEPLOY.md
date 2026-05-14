# Deploying Volare

Architecture: **Vercel** (frontend) proxies `/api/*` to **Render** (Spring Boot backend + managed Postgres).
Both auto-deploy on every push to the GitHub repo's default branch.

## 1. Push to GitHub

```bash
cd /Users/ryannguyen/volare
git init && git add -A && git commit -m "Initial commit"
# create an empty repo named "volare" on github.com, then:
git remote add origin git@github.com:<your-username>/volare.git
git branch -M main
git push -u origin main
```

`.env` is git-ignored — your API keys are NOT pushed. You'll enter them in the Render dashboard.

## 2. Backend → Render

1. Sign up at https://render.com (log in with GitHub).
2. **New → Blueprint**, pick the `volare` repo. Render reads `render.yaml` and provisions
   the `volare-backend` web service + `volare-db` Postgres.
3. Before the first deploy, it asks for the three `sync: false` secrets — paste the values
   from your local `.env`:
   - `FOURSQUARE_API_KEY`
   - `DUFFEL_API_TOKEN`
   - `GEMINI_API_KEY`
4. Apply. First build takes ~5 min (Maven build inside Docker). When done you'll get a URL like
   `https://volare-backend.onrender.com`. Confirm `‹url›/actuator/health` returns `{"status":"UP"}`.

> If your URL is **not** exactly `volare-backend.onrender.com` (name was taken), update the host in
> `volare-frontend/vercel.json` and commit — Vercel will redeploy.

## 3. Frontend → Vercel

1. Sign up at https://vercel.com (log in with GitHub).
2. **Add New → Project**, import the `volare` repo.
3. Set **Root Directory** to `volare-frontend`. Framework preset auto-detects as Vite.
4. Deploy. You get a URL like `https://volare.vercel.app`.

`vercel.json` rewrites `/api/*` to the Render backend, so the browser sees a single origin and
no CORS config is needed.

## Notes

- **Auto-deploy:** push to `main` → Render rebuilds the backend, Vercel rebuilds the frontend.
- **Free-tier cold starts:** Render's free web service sleeps after ~15 min idle; the next request
  takes ~50s to wake it. Upgrade to a paid instance (~$7/mo) to keep it always-on.
- **Free Postgres** on Render has a limited lifetime — back up / upgrade before it expires if this
  becomes more than a demo.
- **Local dev** still works unchanged: `mvn spring-boot:run` + `npm run dev` (see project setup).
