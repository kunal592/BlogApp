# Deployment Guide

> Production deployment guide for the Premium AI-Powered Blogging Platform.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Redis Setup](#redis-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring](#monitoring)
9. [Security Checklist](#security-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services

| Service | Purpose | Recommended Provider |
|---------|---------|---------------------|
| PostgreSQL | Primary database | Railway, Supabase, RDS |
| Redis | Caching & queues | Upstash, Railway |
| Object Storage | Media files | Cloudflare R2, S3 |
| Email | Transactional | Resend, SendGrid |
| Payments | Checkout | Razorpay |
| AI | Content enhancement | Google Gemini |

### System Requirements

- Node.js 18+
- npm or pnpm
- Docker (optional)

---

## Environment Variables

### Backend (.env)

```env
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/blogapp?schema=public

# Redis (Local)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Authentication
JWT_SECRET=your-64-character-secret-key-here
JWT_EXPIRES_IN=7d

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-secret
RAZORPAY_WEBHOOK_SECRET=webhook-secret

# Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=blog-media
CLOUDFLARE_R2_ENDPOINT=https://xxxx.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://media.yourdomain.com

# Gemini AI
GEMINI_API_KEY=your-api-key

# Email (Resend)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@yourdomain.com

# Security
CORS_ORIGIN=https://yourdomain.com
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

### Secret Generation

```bash
# Generate JWT secret
openssl rand -hex 32

# Generate webhook secret
openssl rand -hex 16
```

---

## Database Setup

### 1. Create Database

```bash
# PostgreSQL
createdb blogapp

# Or via Supabase/Railway dashboard
```

### 2. Run Migrations

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://..."

# Deploy migrations
npx prisma migrate deploy

# Verify schema
npx prisma db pull
```

### 3. Seed Data

```bash
# Production seed (minimal)
npx prisma db seed

# Creates:
# - Admin user
# - Default tags
```

### 4. Connection Pooling (Recommended)

For production, use PgBouncer or Supabase Pooler:

```env
# Direct connection (for migrations)
DATABASE_URL=postgresql://user:pass@host:5432/blogapp

# Pooled connection (for application)
DATABASE_URL=postgresql://user:pass@pooler.host:6543/blogapp
```

---

## Redis Setup

### Local Redis (macOS)

```bash
# Check if Redis is running
redis-cli ping
# Expected: PONG

# If not running, start Redis
brew services start redis

# Or run manually
redis-server
```

### Environment Configuration

```env
# Local Redis (no password)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Verify Connection

```bash
# Test connection
redis-cli ping
# PONG

# Check info
redis-cli info server

# Monitor commands (useful for debugging)
redis-cli monitor
```

### Redis Commands Reference

```bash
# Clear all keys (development only!)
redis-cli FLUSHDB

# List all keys
redis-cli KEYS "*"

# Get a specific key
redis-cli GET "cache:trending"

# Check memory usage
redis-cli INFO memory
```

### Production Redis (Optional)

For production, you can use:
- **Upstash**: `REDIS_URL=rediss://default:token@host.upstash.io:6379`
- **Railway**: Managed Redis instance
- **Self-hosted**: Docker or VM

---


## Backend Deployment

### Option 1: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Add environment variables via dashboard

# Deploy
railway up
```

### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

```bash
# Build
docker build -t blog-backend .

# Run
docker run -p 3000:3000 --env-file .env blog-backend
```

### Option 3: PM2

```bash
# Install PM2
npm i -g pm2

# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'blog-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};

# Start
pm2 start ecosystem.config.js --env production

# Save process list
pm2 save
pm2 startup
```

---

## Frontend Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd blog-frontend
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
```

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["bom1"]
}
```

### Cloudflare Pages

```bash
# Build settings
# Build command: npm run build
# Output directory: .next

# Environment variables
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railwayapp/railway-action@v1
        with:
          service: backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Monitoring

### Health Checks

```bash
# Health endpoint
curl https://api.yourdomain.com/api/health

# Expected response
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "memory": { "status": "up" }
  }
}
```

### Logging

```typescript
// Use structured logging
import { Logger } from '@nestjs/common';

const logger = new Logger('PaymentService');
logger.log('Payment processed', { userId, amount });
logger.error('Payment failed', error.stack);
```

### Recommended Tools

| Tool | Purpose |
|------|---------|
| Sentry | Error tracking |
| Datadog | APM & logs |
| Uptime Robot | Availability |
| PG Hero | Database monitoring |

---

## Security Checklist

### Pre-Deployment

- [ ] Strong JWT secret (64+ characters)
- [ ] Database password is complex
- [ ] All secrets in environment variables
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Helmet headers configured

### Post-Deployment

- [ ] SSL certificate valid
- [ ] Security headers present (check securityheaders.com)
- [ ] No sensitive data in logs
- [ ] Backup strategy in place
- [ ] Incident response plan documented

### Security Headers

```typescript
// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.yourdomain.com"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));
```

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check connection
psql $DATABASE_URL -c "SELECT 1"

# Common fixes:
# - Check IP whitelist
# - Verify SSL mode
# - Check connection limit
```

#### Redis Connection Errors

```bash
# Test connection
redis-cli -u $REDIS_URL PING

# Common fixes:
# - Check TLS (rediss:// vs redis://)
# - Verify password
# - Check firewall
```

#### 502 Bad Gateway

```bash
# Check application status
pm2 status

# Check logs
pm2 logs blog-api --lines 100

# Common causes:
# - Application crashed
# - Port mismatch
# - Health check timeout
```

#### Slow Queries

```sql
-- Find slow queries
SELECT pid, age(clock_timestamp(), query_start), query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_blog_author ON "Blog"("authorId");
```

### Emergency Procedures

#### Database Rollback

```bash
# List migrations
npx prisma migrate status

# Rollback (if supported)
npx prisma migrate resolve --rolled-back "migration_name"
```

#### Redis Flush (Use with caution)

```bash
redis-cli -u $REDIS_URL FLUSHDB
```

#### Application Rollback

```bash
# Railway
railway rollback

# Vercel
vercel rollback

# PM2
pm2 restart blog-api --update-env
```

---

## Post-Launch

### Performance Tuning

1. Enable Redis caching for hot routes
2. Configure CDN for static assets
3. Set up read replicas for database
4. Enable response compression
5. Configure browser caching headers

### Scaling Checklist

- [ ] Horizontal scaling configured
- [ ] Load balancer health checks
- [ ] Database connection pooling
- [ ] Redis cluster mode (if needed)
- [ ] Queue workers scaled

---

## Support

For deployment issues:
1. Check logs first
2. Review this documentation
3. Open GitHub issue with error details
4. Contact infrastructure team

---

## Next Steps

- [Architecture →](./ARCHITECTURE.md)
- [API Reference →](./API.md)
- [Frontend →](./FRONTEND.md)
