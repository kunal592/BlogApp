# Premium AI-Powered Blogging Platform

> A production-grade, AI-enhanced blogging platform focused on premium reading experience, creator monetization, and community-driven knowledge sharing.

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Target Users](#target-users)
4. [Core Features](#core-features)
5. [Tech Stack](#tech-stack)
6. [System Architecture](#system-architecture)
7. [Project Structure](#project-structure)
8. [Getting Started](#getting-started)
9. [Environment Variables](#environment-variables)
10. [Documentation Index](#documentation-index)

---

## Overview

This platform is a **monolithic backend + modern frontend** blogging system designed with a clear priority hierarchy:

```
Reading Experience → Creator Tools → Monetization
```

The product philosophy emphasizes **quality over quantity**, **depth over virality**, and **sustainable creator revenue** over ad-based models.

---

## Problem Statement

| Problem | Our Solution |
|---------|--------------|
| Medium-style platforms prioritize engagement over quality | Algorithm-free curation, community-driven ranking |
| Creators earn pennies per view | Direct reader payments, 70% revenue to authors |
| AI content lacks human insight | AI assists writing, humans provide perspective |
| Paywalls block entire articles | Graceful preview + seamless unlock |
| Comment sections are toxic | Community Notes with trust scoring |

---

## Target Users

### Readers
- Professionals seeking in-depth technical content
- Lifelong learners valuing quality over quantity
- Users willing to pay for premium insights

### Creators
- Technical writers, domain experts, thought leaders
- Professionals monetizing knowledge directly
- Authors seeking ownership of their audience

### Platform Operators
- Admin team managing content quality
- Support for creator disputes and payouts

---

## Core Features

### Phase 1: Read & Discover
- Glass-morphism navbar with scroll-reactive blur
- Instagram-style vertical feed with editorial spacing
- Premium blog reading page with progress tracking
- Smooth scrolling (Lenis)

### Phase 2: Auth & Interaction
- JWT-based authentication
- Like, Bookmark, Follow with optimistic UI
- Subtle micro-feedback animations

### Phase 3: Creator Experience
- TipTap-powered rich text editor
- Drag & drop media upload
- Draft autosave
- Cover image management

### Phase 4: Differentiators
- **Ask AI**: RAG-powered Q&A about blog content
- **Crowd Wisdom**: Community notes with voting and trust scores

### Phase 5: Monetization
- Exclusive blogs with paywall preview
- Razorpay checkout integration
- Author earnings dashboard
- Wallet system with withdrawal

### Phase 6: Polish
- SEO optimization (sitemap, meta, JSON-LD)
- Loading skeletons
- Accessibility (skip links, focus trap)
- Email templates

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| NestJS | Application framework |
| Prisma | Database ORM |
| PostgreSQL | Primary database |
| Redis | Caching & session store |
| BullMQ | Job queues |
| Razorpay | Payment processing |
| Gemini AI | Content enhancement |
| Cloudflare R2 | Media storage |
| JWT | Authentication |
| Helmet/Throttler | Security |

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework (App Router) |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Lenis | Smooth scrolling |
| Zustand | State management |
| TanStack Query | Server state |
| TipTap | Rich text editor |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Next.js   │  │   Zustand   │  │   TanStack Query        │  │
│  │  App Router │  │   Stores    │  │   (Server State)        │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                     │                 │
│         └────────────────┴─────────────────────┘                 │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │ HTTPS (REST API)
┌──────────────────────────┼───────────────────────────────────────┐
│                          ▼            BACKEND                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      NestJS Application                      │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │ │
│  │  │  Auth   │ │  Blog   │ │ Payment │ │   AI    │ │ Explore│ │ │
│  │  │ Module  │ │ Module  │ │ Module  │ │ Module  │ │ Module │ │ │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬───┘ │ │
│  │       └──────────────────────────────────────────────┘      │ │
│  │                          │                                   │ │
│  │                    ┌─────┴─────┐                             │ │
│  │                    │  Prisma   │                             │ │
│  │                    │   ORM     │                             │ │
│  │                    └─────┬─────┘                             │ │
│  └──────────────────────────┼───────────────────────────────────┘ │
│                             │                                     │
│  ┌──────────────────────────┼───────────────────────────────────┐ │
│  │                          ▼                                    │ │
│  │  ┌───────────┐    ┌───────────┐    ┌───────────┐             │ │
│  │  │PostgreSQL │    │   Redis   │    │  BullMQ   │             │ │
│  │  │ (Primary) │    │  (Cache)  │    │ (Queues)  │             │ │
│  │  └───────────┘    └───────────┘    └───────────┘             │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    EXTERNAL SERVICES                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │ Razorpay │  │  Gemini  │  │Cloudflare│  │  Resend  │    │   │
│  │  │(Payments)│  │   (AI)   │  │R2 (Media)│  │ (Email)  │    │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │   │
│  └────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

### Backend (`/`)
```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Initial data seeding
├── src/
│   ├── common/            # Shared decorators, guards, filters
│   ├── config/            # App configuration
│   ├── modules/
│   │   ├── auth/          # Authentication & authorization
│   │   ├── blog/          # Blog CRUD & publishing
│   │   ├── explore/       # Feed algorithms
│   │   ├── payment/       # Razorpay integration
│   │   ├── wallet/        # Author earnings
│   │   ├── ai/            # Gemini AI integration
│   │   ├── media/         # R2 file uploads
│   │   ├── community-notes/# Crowd wisdom
│   │   ├── email/         # Transactional emails
│   │   └── health/        # Health checks
│   ├── prisma/            # Prisma service
│   └── main.ts            # Application entry
├── test/                  # E2E tests
└── docker-compose.yml     # Local development
```

### Frontend (`/blog-frontend`)
```
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (public)/      # Public routes
│   │   ├── blog/[slug]/   # Blog reading page
│   │   ├── explore/       # Feed page
│   │   ├── write/         # Editor page
│   │   ├── dashboard/     # Author dashboard
│   │   ├── login/         # Auth pages
│   │   └── register/
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   ├── layout/        # Navbar, Footer
│   │   ├── blog/          # Blog-specific components
│   │   ├── editor/        # TipTap editor
│   │   ├── ai/            # AI sidebar
│   │   ├── community/     # Community notes
│   │   ├── monetization/  # Paywall components
│   │   └── effects/       # Water effects
│   ├── design-system/     # Colors, typography, motion
│   ├── services/          # API clients
│   ├── store/             # Zustand stores
│   ├── lib/               # Utilities
│   └── styles/            # Custom CSS
└── public/                # Static assets
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- pnpm or npm

### Installation

```bash
# Clone repository
git clone <repo-url>
cd BlogApp

# Install backend dependencies
npm install

# Install frontend dependencies
cd blog-frontend
npm install
cd ..

# Setup environment
cp .env.example .env
# Edit .env with your values

# Run database migrations
npx prisma migrate dev

# Seed initial data
npx prisma db seed

# Start development
npm run start:dev        # Backend (port 3000)
cd blog-frontend && npm run dev  # Frontend (port 3001)
```

---

## Environment Variables

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete list.

### Required Variables
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/blogapp
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
GEMINI_API_KEY=your-key
CLOUDFLARE_R2_ACCESS_KEY_ID=your-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret
```

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design & data flows |
| [API.md](./API.md) | REST API reference |
| [DATABASE.md](./DATABASE.md) | Schema & relationships |
| [FRONTEND.md](./FRONTEND.md) | UI architecture & design system |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide |

---

## License

Proprietary. All rights reserved.

---

## Contact

For technical questions, open an issue or contact the development team.
