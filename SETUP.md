# Still Waters — Setup & Deployment Guide

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Neon PostgreSQL
1. Go to [console.neon.tech](https://console.neon.tech) and create a free account
2. Create a new project (e.g. "still-waters")
3. Copy the **Connection string** — you'll need two versions:
   - **Pooled** connection (with `pgbouncer=true`) → used as `DATABASE_URL`
   - **Direct** connection (without pgbouncer) → used as `DIRECT_URL`

### 3. Configure environment
Copy `.env.example` to `.env.local` and fill in:

```env
# Pooled connection (add ?pgbouncer=true&sslmode=require)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Direct connection (for migrations)
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET="your-32-char-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Push database schema
```bash
npx prisma db push
```

### 5. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create still-waters --public --push
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
2. Framework: **Next.js** (auto-detected)

### 3. Set Environment Variables in Vercel
In your Vercel project → Settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon pooled connection string |
| `DIRECT_URL` | Your Neon direct connection string |
| `NEXTAUTH_SECRET` | Your random 32-char secret |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g. `https://still-waters.vercel.app`) |

### 4. Deploy
Vercel will auto-deploy. The `build` script runs `prisma generate && next build` automatically.

### 5. Run migrations on first deploy
After first deploy, run in the Vercel dashboard terminal or locally pointing to prod DB:
```bash
DATABASE_URL="your-neon-url" npx prisma migrate deploy
```

Or use `db push` (simpler for new projects):
```bash
DATABASE_URL="your-neon-url" npx prisma db push
```

---

## App Structure

```
still-waters/
├── app/
│   ├── (auth)/         # login, register pages
│   ├── (app)/          # protected pages (dashboard, history, analysis)
│   └── api/            # API routes (conflicts CRUD, register, auth)
├── components/
│   ├── ui/             # shadcn components
│   ├── conflict-form   # reusable create/edit form
│   ├── conflict-card   # conflict entry card
│   └── bottom-nav      # mobile bottom navigation
├── lib/
│   ├── auth.ts         # NextAuth config
│   └── prisma.ts       # Prisma client singleton
├── prisma/
│   └── schema.prisma   # Database schema
└── proxy.ts            # Route protection (auth guard)
```
