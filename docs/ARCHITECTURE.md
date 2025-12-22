# System Architecture

> Complete technical architecture for the Premium AI-Powered Blogging Platform.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Request Flow](#request-flow)
3. [Authentication Flow](#authentication-flow)
4. [Payment Flow](#payment-flow)
5. [AI Integration Flow](#ai-integration-flow)
6. [Async Processing](#async-processing)
7. [Caching Strategy](#caching-strategy)
8. [Security Architecture](#security-architecture)
9. [Scalability Considerations](#scalability-considerations)

---

## Architecture Overview

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Modular Monolith** | Feature modules with clear boundaries |
| **Database-First** | Prisma schema as source of truth |
| **API-Driven** | REST API with consistent patterns |
| **Async by Default** | Non-blocking operations via queues |
| **Secure by Default** | Auth guards on all routes |

### Component Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                              │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                        Next.js Frontend                       │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │  │
│  │  │  Pages  │  │  Store  │  │Services │  │   Components    │  │  │
│  │  │ Router  │  │ Zustand │  │  API    │  │   UI/Effects    │  │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼ HTTPS/REST
┌────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY LAYER                          │
├────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   Helmet    │  │  Throttler  │  │ Compression │                 │
│  │  (Security) │  │(Rate Limit) │  │   (GZIP)    │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                           │
├────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                        NestJS Application                       ││
│  │                                                                 ││
│  │  ┌─────────────────────────────────────────────────────────┐   ││
│  │  │                    FEATURE MODULES                       │   ││
│  │  │  ┌──────┐ ┌──────┐ ┌───────┐ ┌────┐ ┌───────┐ ┌──────┐  │   ││
│  │  │  │ Auth │ │ Blog │ │Payment│ │ AI │ │Explore│ │Media │  │   ││
│  │  │  └──────┘ └──────┘ └───────┘ └────┘ └───────┘ └──────┘  │   ││
│  │  │  ┌──────┐ ┌──────┐ ┌───────┐ ┌────┐ ┌───────┐           │   ││
│  │  │  │Wallet│ │Follow│ │CmdNote│ │Like│ │ Email │           │   ││
│  │  │  └──────┘ └──────┘ └───────┘ └────┘ └───────┘           │   ││
│  │  └─────────────────────────────────────────────────────────┘   ││
│  │                                                                 ││
│  │  ┌─────────────────────────────────────────────────────────┐   ││
│  │  │                    SHARED SERVICES                       │   ││
│  │  │  ┌──────┐ ┌──────┐ ┌───────┐ ┌────────┐ ┌─────────────┐ │   ││
│  │  │  │Prisma│ │ Redis│ │BullMQ │ │ Config │ │   Logger    │ │   ││
│  │  │  └──────┘ └──────┘ └───────┘ └────────┘ └─────────────┘ │   ││
│  │  └─────────────────────────────────────────────────────────┘   ││
│  └────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                 │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  PostgreSQL  │    │    Redis     │    │   BullMQ     │          │
│  │   (Primary)  │    │   (Cache)    │    │   (Queues)   │          │
│  │              │    │              │    │              │          │
│  │ • Users      │    │ • Sessions   │    │ • Email      │          │
│  │ • Blogs      │    │ • Trending   │    │ • AI Jobs    │          │
│  │ • Payments   │    │ • Feed Cache │    │ • Analytics  │          │
│  │ • Wallets    │    │ • Rate Limit │    │ • Webhooks   │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
└────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                             │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │   Razorpay   │  │    Gemini    │  │ Cloudflare   │  │ Resend  │ │
│  │   Payments   │  │      AI      │  │   R2/CDN     │  │  Email  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow

### Standard API Request

```
Client Request
      │
      ▼
┌─────────────────┐
│    Middleware   │
│  • Helmet       │
│  • Compression  │
│  • CORS         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Throttler     │
│  (Rate Limit)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   JWT Guard     │
│  (if protected) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │
│  • Validation   │
│  • DTO Parsing  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │
│ • Business Logic│
│ • DB Operations │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Prisma       │
│   (Database)    │
└────────┬────────┘
         │
         ▼
    Response
```

---

## Authentication Flow

### JWT Token Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOGIN FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Client                    Server                   Database   │
│     │                         │                          │      │
│     │  POST /auth/login       │                          │      │
│     │  {email, password}      │                          │      │
│     │────────────────────────>│                          │      │
│     │                         │                          │      │
│     │                         │  Find user by email      │      │
│     │                         │─────────────────────────>│      │
│     │                         │                          │      │
│     │                         │<─────────────────────────│      │
│     │                         │  User record             │      │
│     │                         │                          │      │
│     │                         │  Verify password (bcrypt)│      │
│     │                         │  Generate JWT            │      │
│     │                         │  Set HttpOnly cookie     │      │
│     │                         │                          │      │
│     │<────────────────────────│                          │      │
│     │  Set-Cookie: token=...  │                          │      │
│     │  { user, message }      │                          │      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Role-Based Access

| Role | Permissions |
|------|-------------|
| **USER** | Read, like, bookmark, follow, comment |
| **CREATOR** | All USER + publish blogs, earnings |
| **ADMIN** | All CREATOR + manage users, content moderation |
| **OWNER** | All ADMIN + platform configuration |

---

## Payment Flow

### Exclusive Blog Purchase

```
┌──────────────────────────────────────────────────────────────────────┐
│                      PAYMENT FLOW                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Reader          Frontend         Backend         Razorpay   Author  │
│    │                │                │                │         │    │
│    │ Click "Unlock" │                │                │         │    │
│    │───────────────>│                │                │         │    │
│    │                │                │                │         │    │
│    │                │ Create Order   │                │         │    │
│    │                │───────────────>│                │         │    │
│    │                │                │                │         │    │
│    │                │                │ Create Order   │         │    │
│    │                │                │───────────────>│         │    │
│    │                │                │                │         │    │
│    │                │                │<───────────────│         │    │
│    │                │<───────────────│ Order ID       │         │    │
│    │                │                │                │         │    │
│    │                │ Open Razorpay  │                │         │    │
│    │<───────────────│ Checkout       │                │         │    │
│    │                │                │                │         │    │
│    │ Pay            │                │                │         │    │
│    │──────────────────────────────────────────────────>         │    │
│    │                │                │                │         │    │
│    │                │                │ Webhook        │         │    │
│    │                │                │<───────────────│         │    │
│    │                │                │                │         │    │
│    │                │                │ Verify Signature         │    │
│    │                │                │ Create Purchase           │    │
│    │                │                │ Credit Author Wallet      │    │
│    │                │                │─────────────────────────>│    │
│    │                │                │                │         │    │
│    │                │<───────────────│                │         │    │
│    │<───────────────│ Unlock Content │                │         │    │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Revenue Split Calculation

```typescript
// Example: Blog price = ₹100

const AUTHOR_SHARE = 0.70;  // 70%
const PLATFORM_FEE = 0.30;  // 30%

const blogPrice = 100;
const authorEarnings = blogPrice * AUTHOR_SHARE;  // ₹70
const platformFee = blogPrice * PLATFORM_FEE;      // ₹30
```

---

## AI Integration Flow

### Blog Summarization

```
┌─────────────────────────────────────────────────────────────┐
│                   AI SUMMARIZATION FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Author publishes blog                                      │
│          │                                                   │
│          ▼                                                   │
│   ┌──────────────┐                                          │
│   │   BlogService │                                          │
│   │   .publish()  │                                          │
│   └──────┬───────┘                                          │
│          │                                                   │
│          ▼                                                   │
│   ┌──────────────┐                                          │
│   │   Queue Job  │  (BullMQ)                                │
│   │ "ai:summary" │                                          │
│   └──────┬───────┘                                          │
│          │                                                   │
│          ▼  (Async)                                         │
│   ┌──────────────┐                                          │
│   │  AI Service  │                                          │
│   └──────┬───────┘                                          │
│          │                                                   │
│          ▼                                                   │
│   ┌──────────────┐                                          │
│   │   Gemini AI  │                                          │
│   │  (External)  │                                          │
│   └──────┬───────┘                                          │
│          │                                                   │
│          ▼                                                   │
│   ┌──────────────┐                                          │
│   │ Update Blog  │                                          │
│   │  summary,    │                                          │
│   │  seoMeta     │                                          │
│   └──────────────┘                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Async Processing

### Queue Architecture

| Queue | Purpose | Priority |
|-------|---------|----------|
| `email` | Transactional emails | High |
| `ai` | Blog summarization, SEO | Medium |
| `analytics` | View counting, metrics | Low |
| `notifications` | Push/in-app notifications | Medium |

### Job Processing

```typescript
// Queue producer
await this.aiQueue.add('summarize', { blogId }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: true,
});

// Queue consumer
@Processor('ai')
export class AiProcessor {
  @Process('summarize')
  async handleSummarize(job: Job<{ blogId: string }>) {
    // Process job
  }
}
```

---

## Caching Strategy

### Cache Layers

| Layer | TTL | Purpose |
|-------|-----|---------|
| **Trending Feed** | 5 min | Hot content ranking |
| **User Session** | 7 days | JWT validation cache |
| **Blog Metadata** | 1 hour | Read-heavy data |
| **Author Stats** | 15 min | Follower counts |

### Cache Invalidation

```typescript
// On blog update
await this.cacheService.invalidate(`blog:${blogId}`);
await this.cacheService.invalidate('trending:*');
```

---

## Security Architecture

### Security Layers

| Layer | Implementation |
|-------|----------------|
| **Transport** | HTTPS only, HSTS headers |
| **Headers** | Helmet (XSS, CSRF, Clickjacking) |
| **Rate Limiting** | Throttler (100 req/min default) |
| **Authentication** | JWT with HttpOnly cookies |
| **Authorization** | Role-based guards |
| **Input Validation** | class-validator DTOs |
| **Database** | Parameterized queries (Prisma) |
| **Secrets** | Environment variables only |

---

## Scalability Considerations

### Horizontal Scaling

```
                    ┌─────────────┐
                    │   Load      │
                    │  Balancer   │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  App #1  │    │  App #2  │    │  App #3  │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │   PG    │ │  Redis  │ │ BullMQ  │
        │(Primary)│ │(Cluster)│ │(Workers)│
        └─────────┘ └─────────┘ └─────────┘
```

### Database Optimization

- **Indexes**: On frequently queried columns (slug, authorId, status)
- **Connection Pooling**: PgBouncer for production
- **Read Replicas**: For read-heavy operations
- **Partitioning**: Transaction tables by date

---

## Next Steps

- [API Reference →](./API.md)
- [Database Schema →](./DATABASE.md)
- [Deployment Guide →](./DEPLOYMENT.md)
