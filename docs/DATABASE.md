# Database Schema

> Complete database schema documentation using Prisma ORM with PostgreSQL.

---

## Table of Contents

1. [Schema Philosophy](#schema-philosophy)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Core Models](#core-models)
4. [Relationship Models](#relationship-models)
5. [Financial Models](#financial-models)
6. [Content Models](#content-models)
7. [Indexes & Performance](#indexes--performance)
8. [Migrations](#migrations)

---

## Schema Philosophy

### Design Principles

| Principle | Rationale |
|-----------|-----------|
| **Soft Deletes** | `deletedAt` field for audit trail |
| **UUID Primary Keys** | Security, distributed ID generation |
| **Immutable Ledger** | Financial transactions are append-only |
| **Denormalized Counts** | `likeCount`, `viewCount` for performance |
| **Enum Status Fields** | Type-safe state machines |

### Naming Conventions

- **Tables**: PascalCase singular (`User`, `Blog`)
- **Columns**: camelCase (`createdAt`, `authorId`)
- **Foreign Keys**: `{relation}Id` (`authorId`, `blogId`)
- **Indexes**: `{table}_{column}_idx`

---

## Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              USER DOMAIN                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌────────────┐         ┌────────────┐         ┌────────────┐           │
│   │    User    │─────────│   Follow   │─────────│    User    │           │
│   │            │ 1     * │            │ *     1 │ (followed) │           │
│   └─────┬──────┘         └────────────┘         └────────────┘           │
│         │                                                                 │
│         │ 1                                                               │
│         │                                                                 │
│         ▼ *                                                               │
│   ┌────────────┐         ┌────────────┐         ┌────────────┐           │
│   │   Wallet   │─────────│Transaction │         │  Session   │           │
│   │            │ 1     * │            │         │            │           │
│   └────────────┘         └────────────┘         └────────────┘           │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                              BLOG DOMAIN                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌────────────┐         ┌────────────┐         ┌────────────┐           │
│   │    User    │─────────│    Blog    │─────────│    Tag     │           │
│   │  (author)  │ 1     * │            │ *     * │            │           │
│   └────────────┘         └─────┬──────┘         └────────────┘           │
│                                │                                          │
│                    ┌───────────┼───────────┐                             │
│                    │           │           │                             │
│                    ▼           ▼           ▼                             │
│              ┌────────┐  ┌────────┐  ┌──────────────┐                    │
│              │  Like  │  │Bookmark│  │CommunityNote │                    │
│              └────────┘  └────────┘  └──────────────┘                    │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                            PAYMENT DOMAIN                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌────────────┐         ┌────────────┐         ┌────────────┐           │
│   │    User    │─────────│  Purchase  │─────────│    Blog    │           │
│   │  (reader)  │ 1     * │            │ *     1 │(exclusive) │           │
│   └────────────┘         └─────┬──────┘         └────────────┘           │
│                                │                                          │
│                                ▼                                          │
│                          ┌────────────┐                                   │
│                          │Transaction │                                   │
│                          │  (Ledger)  │                                   │
│                          └────────────┘                                   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Core Models

### User

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  username      String?   @unique
  password      String
  name          String?
  bio           String?
  avatar        String?
  role          Role      @default(USER)
  isVerified    Boolean   @default(false)
  
  // Denormalized counts
  followerCount  Int      @default(0)
  followingCount Int      @default(0)
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  
  // Relations
  blogs         Blog[]
  wallet        Wallet?
  likes         Like[]
  bookmarks     Bookmark[]
  followers     Follow[]   @relation("following")
  following     Follow[]   @relation("follower")
  purchases     Purchase[]
  communityNotes CommunityNote[]
  sessions      Session[]
}

enum Role {
  USER
  CREATOR
  ADMIN
  OWNER
}
```

### Blog

```prisma
model Blog {
  id              String      @id @default(uuid())
  slug            String      @unique
  title           String
  content         String      @db.Text
  excerpt         String?     @db.Text
  coverImageUrl   String?
  
  // AI-generated
  summary         String?     @db.Text
  seoMeta         Json?
  
  // Status
  status          BlogStatus  @default(DRAFT)
  publishedAt     DateTime?
  
  // Monetization
  isExclusive     Boolean     @default(false)
  price           Int         @default(0)
  
  // Denormalized counts
  viewCount       Int         @default(0)
  likeCount       Int         @default(0)
  commentCount    Int         @default(0)
  
  // Timestamps
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deletedAt       DateTime?
  
  // Relations
  authorId        String
  author          User        @relation(fields: [authorId], references: [id])
  tags            Tag[]
  likes           Like[]
  bookmarks       Bookmark[]
  purchases       Purchase[]
  communityNotes  CommunityNote[]
  
  @@index([slug])
  @@index([authorId])
  @@index([status])
  @@index([publishedAt])
}

enum BlogStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

---

## Relationship Models

### Follow

```prisma
model Follow {
  id          String   @id @default(uuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())
  
  follower    User     @relation("follower", fields: [followerId], references: [id])
  following   User     @relation("following", fields: [followingId], references: [id])
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}
```

### Like

```prisma
model Like {
  id        String   @id @default(uuid())
  userId    String
  blogId    String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  blog      Blog     @relation(fields: [blogId], references: [id])
  
  @@unique([userId, blogId])
  @@index([blogId])
}
```

### Bookmark

```prisma
model Bookmark {
  id        String   @id @default(uuid())
  userId    String
  blogId    String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  blog      Blog     @relation(fields: [blogId], references: [id])
  
  @@unique([userId, blogId])
  @@index([userId])
}
```

---

## Financial Models

### Wallet

```prisma
model Wallet {
  id              String        @id @default(uuid())
  userId          String        @unique
  balance         Int           @default(0)  // In smallest currency unit
  pendingPayout   Int           @default(0)
  lifetimeEarnings Int          @default(0)
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  user            User          @relation(fields: [userId], references: [id])
  transactions    Transaction[]
}
```

### Transaction (Immutable Ledger)

```prisma
model Transaction {
  id              String          @id @default(uuid())
  walletId        String
  type            TransactionType
  amount          Int             // Positive for credit, negative for debit
  balanceAfter    Int             // Snapshot for audit
  description     String?
  referenceId     String?         // Purchase ID, Withdrawal ID, etc.
  referenceType   String?         // "purchase", "withdrawal", "tip"
  
  createdAt       DateTime        @default(now())
  // NO updatedAt - transactions are immutable
  
  wallet          Wallet          @relation(fields: [walletId], references: [id])
  
  @@index([walletId])
  @@index([createdAt])
  @@index([type])
}

enum TransactionType {
  EARNING
  WITHDRAWAL
  TIP
  REFUND
  PLATFORM_FEE
}
```

### Purchase

```prisma
model Purchase {
  id              String        @id @default(uuid())
  userId          String
  blogId          String
  amount          Int
  currency        String        @default("INR")
  
  // Razorpay data
  razorpayOrderId   String?
  razorpayPaymentId String?
  razorpaySignature String?
  
  status          PaymentStatus @default(PENDING)
  createdAt       DateTime      @default(now())
  completedAt     DateTime?
  
  user            User          @relation(fields: [userId], references: [id])
  blog            Blog          @relation(fields: [blogId], references: [id])
  
  @@unique([userId, blogId])
  @@index([userId])
  @@index([blogId])
  @@index([status])
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

---

## Content Models

### Tag

```prisma
model Tag {
  id        String   @id @default(uuid())
  name      String   @unique
  slug      String   @unique
  blogs     Blog[]
  createdAt DateTime @default(now())
  
  @@index([slug])
}
```

### CommunityNote

```prisma
model CommunityNote {
  id             String   @id @default(uuid())
  blogId         String
  userId         String
  content        String   @db.Text
  quote          String?  @db.Text
  
  helpfulVotes   Int      @default(0)
  notHelpfulVotes Int     @default(0)
  
  authorResponse String?  @db.Text
  authorRespondedAt DateTime?
  
  status         NoteStatus @default(PENDING)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  blog           Blog     @relation(fields: [blogId], references: [id])
  user           User     @relation(fields: [userId], references: [id])
  votes          NoteVote[]
  
  @@index([blogId])
  @@index([status])
}

model NoteVote {
  id        String       @id @default(uuid())
  noteId    String
  userId    String
  vote      VoteType
  createdAt DateTime     @default(now())
  
  note      CommunityNote @relation(fields: [noteId], references: [id])
  
  @@unique([noteId, userId])
}

enum NoteStatus {
  PENDING
  APPROVED
  REJECTED
}

enum VoteType {
  HELPFUL
  NOT_HELPFUL
}
```

---

## Indexes & Performance

### Critical Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `Blog` | `slug` | URL-based lookups |
| `Blog` | `authorId` | Author's blogs |
| `Blog` | `status, publishedAt` | Published feed |
| `Like` | `blogId` | Blog like count |
| `Follow` | `followerId`, `followingId` | Follow lookups |
| `Transaction` | `walletId, createdAt` | Ledger queries |
| `Purchase` | `userId, blogId` | Access checks |

### Query Optimization

```prisma
// Use select for partial fields
const blog = await prisma.blog.findUnique({
  where: { slug },
  select: {
    id: true,
    title: true,
    author: { select: { name: true, username: true } },
  },
});

// Use cursor pagination for large datasets
const blogs = await prisma.blog.findMany({
  take: 20,
  skip: 1,
  cursor: { id: lastBlogId },
  orderBy: { publishedAt: 'desc' },
});
```

---

## Migrations

### Running Migrations

```bash
# Development
npx prisma migrate dev --name description_of_change

# Production
npx prisma migrate deploy

# Reset (WARNING: Deletes all data)
npx prisma migrate reset
```

### Seeding

```bash
# Run seed script
npx prisma db seed

# Seed script creates:
# - Admin user
# - Default tags
# - Sample blogs (optional)
```

### Migration Best Practices

1. **Always backup** before production migrations
2. **Use transactions** for multi-step migrations
3. **Test on staging** before production
4. **Keep migrations small** and focused
5. **Never modify** existing migrations

---

## Schema Maintenance

### Adding New Fields

```prisma
// 1. Add field with default or nullable
model Blog {
  readTime Int? // Nullable first
}

// 2. Run migration
// 3. Backfill data
// 4. Make required if needed
```

### Removing Fields

```prisma
// 1. Stop using in code
// 2. Mark as @deprecated in comments
// 3. Create migration to drop
// 4. Run migration
```

---

## Next Steps

- [API Reference →](./API.md)
- [Architecture →](./ARCHITECTURE.md)
- [Deployment →](./DEPLOYMENT.md)
