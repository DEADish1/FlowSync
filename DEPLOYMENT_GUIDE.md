# FlowSync Deployment Guide

**Complete guide to deploying FlowSync to production**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [CI/CD Setup](#cicd-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Security Checklist](#security-checklist)
10. [Post-Deployment](#post-deployment)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- [ ] GitHub account (for code repository)
- [ ] Vercel account (for frontend hosting)
- [ ] Railway/Render account (for backend hosting)
- [ ] Database provider (Railway PostgreSQL/Supabase/Neon)
- [ ] Redis provider (Upstash/Railway)
- [ ] Domain registrar (optional but recommended)

### Required API Keys
- [ ] OpenAI API key (for AI features)
- [ ] Spotify API credentials (for music recommendations)
- [ ] Suno AI API key (optional, for music prompts)

### Tools Needed
- Node.js 18+ installed locally
- Git installed
- Railway CLI or Vercel CLI (optional)
- Database client (pgAdmin, TablePlus, or psql)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Production Stack                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Users                                                   │
│    │                                                     │
│    ├──> Vercel CDN (Frontend)                          │
│    │      └──> Next.js App                             │
│    │                                                     │
│    └──> Railway (Backend API)                          │
│           ├──> Express.js Server                        │
│           ├──> PostgreSQL Database                      │
│           ├──> Redis Cache                              │
│           └──> Third-Party APIs                         │
│                  ├──> OpenAI (AI insights)              │
│                  ├──> Spotify (Music)                   │
│                  └──> Suno (Music prompts)              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Environment Setup

### 1. Backend Environment Variables

Create `/backend/.env.production`:

```bash
# Server
NODE_ENV=production
PORT=3001

# Database (from Railway/Supabase)
DATABASE_URL=postgresql://user:pass@host:5432/flowsync

# Redis (from Upstash/Railway)
REDIS_URL=redis://default:pass@host:6379

# JWT (generate a secure 32+ character string)
JWT_SECRET=your-super-secret-production-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Music Services
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SUNO_API_KEY=your-suno-key

# Frontend URL (will be your Vercel domain)
FRONTEND_URL=https://flowsync.vercel.app

# Optional: Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

**Important**: Generate secure JWT secret:
```bash
openssl rand -base64 32
```

### 2. Frontend Environment Variables

Create `/frontend/.env.production.local`:

```bash
# API URL (will be your Railway backend URL)
NEXT_PUBLIC_API_URL=https://flowsync-api.up.railway.app

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=

# Optional: Error tracking
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Database Setup

### Option 1: Railway PostgreSQL

1. **Create Database**:
   ```bash
   # In Railway dashboard
   - Click "New Project"
   - Select "PostgreSQL"
   - Copy DATABASE_URL from variables
   ```

2. **Run Migrations**:
   ```bash
   psql $DATABASE_URL < database/schema.sql
   ```

3. **Verify**:
   ```bash
   psql $DATABASE_URL -c "\dt"
   # Should show 9 tables
   ```

### Option 2: Supabase

1. **Create Project**:
   - Go to https://supabase.com
   - Create new project
   - Copy connection string

2. **Connect**:
   ```bash
   psql "postgresql://postgres:[password]@[host]:5432/postgres"
   ```

3. **Run Schema**:
   ```sql
   \i database/schema.sql
   ```

### Database Configuration

**Recommended Settings**:
- **Connection Pooling**: Enable (max 20 connections)
- **SSL**: Required (verify-full)
- **Backups**: Daily automated backups
- **Monitoring**: Enable slow query logging

---

## Backend Deployment

### Option 1: Railway (Recommended)

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### 2. Initialize Project
```bash
cd backend
railway init
railway link [project-id]
```

#### 3. Add Services
```bash
# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis
```

#### 4. Set Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="your-secret-here"
railway variables set OPENAI_API_KEY="sk-..."
railway variables set FRONTEND_URL="https://flowsync.vercel.app"
# ... set all other variables
```

#### 5. Deploy
```bash
railway up
```

#### 6. Verify
```bash
railway status
railway logs
```

### Option 2: Render

1. **Create Web Service**:
   - Go to https://render.com
   - Connect GitHub repository
   - Select `backend` directory
   - Build command: `npm install && npm run build`
   - Start command: `node dist/index.js`

2. **Environment Variables**:
   - Add all variables from `.env.production.example`

3. **Database**:
   - Create PostgreSQL instance
   - Copy connection string
   - Run schema manually

### Option 3: Docker Deployment

```bash
cd backend

# Build image
docker build -t flowsync-api .

# Run container
docker run -d \
  --name flowsync-api \
  -p 3001:3001 \
  --env-file .env.production \
  flowsync-api

# Check logs
docker logs flowsync-api
```

---

## Frontend Deployment

### Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

#### 2. Deploy
```bash
cd frontend

# First deployment
vercel

# Production deployment
vercel --prod
```

#### 3. Set Environment Variables

Via Vercel Dashboard:
- Project Settings → Environment Variables
- Add `NEXT_PUBLIC_API_URL`
- Redeploy for changes to take effect

Via CLI:
```bash
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-backend.railway.app
vercel --prod
```

#### 4. Custom Domain (Optional)

1. **Add Domain**:
   - Vercel Dashboard → Domains
   - Add `flowsync.app`

2. **DNS Configuration**:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL**:
   - Automatic via Vercel (Let's Encrypt)
   - SSL certificate provisioned within minutes

---

## CI/CD Setup

### GitHub Actions

The CI/CD pipeline is already configured in `.github/workflows/ci-cd.yml`.

#### 1. Add Repository Secrets

Go to GitHub repository → Settings → Secrets → Actions:

```
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Railway
RAILWAY_TOKEN=your-railway-token

# Optional: Monitoring
SENTRY_AUTH_TOKEN=
```

#### 2. Get Vercel Tokens
```bash
# Get Vercel token
vercel login
vercel whoami

# Get project ID
cd frontend
vercel link
cat .vercel/project.json
```

#### 3. Get Railway Token
```bash
railway login
railway whoami
# Generate token in Railway dashboard
```

#### 4. Test Pipeline

```bash
git checkout -b test-cicd
git commit --allow-empty -m "Test CI/CD"
git push origin test-cicd
# Check GitHub Actions tab
```

---

## Monitoring & Logging

### 1. Error Tracking (Sentry)

#### Backend Setup
```bash
npm install @sentry/node
```

```typescript
// backend/src/index.ts
import * as Sentry from '@sentry/node';

if (config.nodeEnv === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
  });
}
```

#### Frontend Setup
```bash
npm install @sentry/nextjs
```

```typescript
// frontend/sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

### 2. Logging

#### Structured Logging
```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### 3. Uptime Monitoring

Use external service:
- **UptimeRobot**: https://uptimerobot.com (free)
- **Pingdom**: https://pingdom.com
- **Better Uptime**: https://betteruptime.com

Monitor:
- Frontend: `https://flowsync.app`
- Backend API: `https://api.flowsync.app/health`
- Database: Connection health

### 4. Analytics

#### Backend API Analytics
```typescript
// Track API metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('API Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    });
  });
  next();
});
```

---

## Security Checklist

### Pre-Deployment Security

- [ ] **Environment Variables**
  - [ ] All secrets in environment variables (not in code)
  - [ ] JWT_SECRET is strong (32+ characters)
  - [ ] Different secrets for dev/staging/prod

- [ ] **HTTPS**
  - [ ] Frontend served over HTTPS
  - [ ] Backend API uses HTTPS
  - [ ] HSTS headers enabled

- [ ] **CORS**
  - [ ] CORS configured with specific origins
  - [ ] No wildcard (*) in production

- [ ] **Rate Limiting**
  - [ ] Global rate limiting enabled
  - [ ] Auth endpoints have strict limits
  - [ ] AI endpoints have cost limits

- [ ] **Authentication**
  - [ ] JWT tokens expire (7 days max)
  - [ ] Passwords hashed with bcrypt (cost 12+)
  - [ ] Session management secure

- [ ] **Input Validation**
  - [ ] All user input validated
  - [ ] SQL injection prevention (parameterized queries)
  - [ ] XSS prevention (sanitized output)

- [ ] **Dependencies**
  - [ ] Run `npm audit` and fix issues
  - [ ] Keep dependencies updated
  - [ ] Use Dependabot for alerts

- [ ] **Headers**
  - [ ] Security headers (Helmet.js)
  - [ ] CSP configured
  - [ ] X-Frame-Options set

### Security Audit Commands

```bash
# Backend audit
cd backend
npm audit
npm audit fix

# Frontend audit
cd frontend
npm audit
npm audit fix

# Check for outdated packages
npm outdated
```

---

## Post-Deployment

### 1. Smoke Tests

Test critical flows:

```bash
# Health check
curl https://api.flowsync.app/health

# Authentication
curl -X POST https://api.flowsync.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!","name":"Test"}'

# Login
curl -X POST https://api.flowsync.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!"}'
```

### 2. Performance Testing

```bash
# Install Apache Bench
apt-get install apache2-utils

# Load test
ab -n 1000 -c 10 https://api.flowsync.app/health
```

### 3. Monitoring Setup

- [ ] Set up uptime monitoring
- [ ] Configure error alerts (Sentry)
- [ ] Set up log aggregation
- [ ] Configure budget alerts (API costs)

### 4. Documentation

- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document rollback procedure

### 5. Backup Strategy

```bash
# Automated daily backups
# Railway/Supabase do this automatically

# Manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Backup to S3 (recommended)
pg_dump $DATABASE_URL | gzip | aws s3 cp - s3://backups/flowsync-$(date +%Y%m%d).sql.gz
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to database"

**Check**:
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

**Fix**:
- Verify DATABASE_URL is correct
- Check if database is running
- Verify firewall rules allow connection
- Check SSL requirements

#### 2. "CORS error"

**Check**:
- Frontend URL in backend CORS config
- Backend URL in frontend API calls
- Both using HTTPS

**Fix**:
```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL, // https://flowsync.app
  credentials: true,
}));
```

#### 3. "Rate limit exceeded"

**Check**:
```bash
# View rate limit headers
curl -I https://api.flowsync.app/api/tasks
```

**Fix**:
- Adjust rate limits in production
- Implement caching on frontend
- Use Redis for distributed rate limiting

#### 4. "Build failed"

**Check**:
```bash
# Local build test
cd frontend
npm run build

cd ../backend
npm run build
```

**Fix**:
- Check TypeScript errors
- Verify all dependencies installed
- Check environment variables

### Health Check Endpoints

```bash
# Backend health
curl https://api.flowsync.app/health
# Should return: {"status":"ok","timestamp":"...","environment":"production"}

# Database health
curl https://api.flowsync.app/health/db
# Should return: {"database":"connected"}

# Redis health
curl https://api.flowsync.app/health/redis
# Should return: {"redis":"connected"}
```

### Logs

```bash
# Railway logs
railway logs

# Vercel logs
vercel logs

# Docker logs
docker logs flowsync-api

# Real-time logs
railway logs --follow
```

---

## Rollback Procedure

### If deployment fails:

#### 1. Quick Rollback (Railway)
```bash
railway rollback
```

#### 2. Revert to Previous Version (Vercel)
```bash
# Via dashboard: Deployments → Previous deployment → Promote to Production
# Via CLI:
vercel rollback
```

#### 3. Database Rollback
```bash
# Restore from backup
psql $DATABASE_URL < backup-20251115.sql
```

#### 4. Git Revert
```bash
git revert HEAD
git push origin main
# CI/CD will deploy previous version
```

---

## Production Checklist

Before going live:

### Technical
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Error tracking setup
- [ ] Rate limiting configured
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)

### Legal & Compliance
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Cookie consent (if applicable)
- [ ] GDPR compliance (if applicable)
- [ ] CCPA compliance (if applicable)

### Business
- [ ] Domain registered
- [ ] Email configured (support@, privacy@, etc.)
- [ ] Social media accounts (optional)
- [ ] Landing page ready
- [ ] Documentation complete

### Post-Launch
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Check uptime
- [ ] Review logs daily (first week)
- [ ] Collect user feedback
- [ ] Plan next iteration

---

## Cost Estimation

### Monthly Costs (Approximate)

| Service | Tier | Cost |
|---------|------|------|
| **Vercel** | Hobby (Free) | $0 |
| **Vercel** | Pro | $20/month |
| **Railway** | Starter | $5/month |
| **Railway** | PostgreSQL | $5/month |
| **Railway** | Redis | $5/month |
| **OpenAI API** | Pay-as-you-go | $10-50/month |
| **Sentry** | Free tier | $0 |
| **Uptime Monitoring** | Free tier | $0 |
| **Domain** | .app domain | $12/year |

**Total**: ~$20-45/month for small-scale production

---

## Support

### Getting Help

- **Documentation**: https://flowsync.app/docs
- **GitHub Issues**: https://github.com/yourusername/flowsync/issues
- **Email**: support@flowsync.app

### Useful Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

**Deployment Complete! 🚀**

Your FlowSync application is now live and ready to help users optimize their productivity!
