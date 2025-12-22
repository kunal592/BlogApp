# API Reference

> Complete REST API documentation for the Premium AI-Powered Blogging Platform.

---

## Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Codes](#error-codes)
5. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Blogs](#blogs)
   - [Explore](#explore)
   - [Users](#users)
   - [Payments](#payments)
   - [Wallet](#wallet)
   - [Media](#media)
   - [AI](#ai)
   - [Community Notes](#community-notes)

---

## Base URL

```
Development: http://localhost:3000/api
Production:  https://api.yourdomain.com/api
```

---

## Authentication

All protected endpoints require JWT authentication via cookies.

### Headers
```http
Cookie: access_token=<jwt_token>
```

### Public Endpoints
Endpoints marked with `@Public()` decorator do not require authentication:
- `POST /auth/login`
- `POST /auth/register`
- `GET /blogs/:slug` (public blogs)
- `GET /explore/*`
- `GET /health`

---

## Response Format

### Success Response
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

### Paginated Response
```json
{
  "statusCode": 200,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Missing/invalid token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `429` | Too Many Requests - Rate limited |
| `500` | Internal Server Error |

---

## Endpoints

### Auth

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "role": "USER"
    },
    "message": "Registration successful"
  }
}
```

---

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK` (Sets HttpOnly cookie)
```json
{
  "data": {
    "user": { ... },
    "message": "Login successful"
  }
}
```

---

#### Logout
```http
POST /auth/logout
```

**Response:** `200 OK` (Clears cookie)

---

#### Get Current User
```http
GET /auth/me
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "CREATOR",
    "followerCount": 150,
    "followingCount": 42
  }
}
```

---

### Blogs

#### Create Blog
```http
POST /blogs
Authorization: Required (CREATOR+)
```

**Request Body:**
```json
{
  "title": "My First Blog",
  "content": "# Introduction\n\nThis is my blog...",
  "excerpt": "A brief introduction to...",
  "tags": ["technology", "ai"],
  "isExclusive": false,
  "price": 0,
  "coverImageUrl": "https://..."
}
```

**Response:** `201 Created`

---

#### Get Blog by Slug
```http
GET /blogs/:slug
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "title": "My First Blog",
    "slug": "my-first-blog",
    "content": "...",
    "author": {
      "id": "uuid",
      "name": "John Doe",
      "username": "johndoe"
    },
    "tags": ["technology"],
    "likeCount": 42,
    "viewCount": 1500,
    "isExclusive": false,
    "createdAt": "2024-12-23T00:00:00Z"
  }
}
```

---

#### Update Blog
```http
PATCH /blogs/:id
Authorization: Required (Owner or Admin)
```

---

#### Delete Blog
```http
DELETE /blogs/:id
Authorization: Required (Owner or Admin)
```

---

#### Publish Blog
```http
POST /blogs/:id/publish
Authorization: Required (Owner)
```

---

#### Like/Unlike Blog
```http
POST /blogs/:id/like
Authorization: Required
```

---

#### Bookmark/Unbookmark Blog
```http
POST /blogs/:id/bookmark
Authorization: Required
```

---

### Explore

#### Get Trending Blogs
```http
GET /explore/trending?page=1&limit=20
```

---

#### Get Personalized Feed
```http
GET /explore/feed
Authorization: Required
```

---

#### Get Blogs by Tag
```http
GET /explore/tag/:tagName?page=1&limit=20
```

---

### Users

#### Get User Profile
```http
GET /users/:username
```

---

#### Follow/Unfollow User
```http
POST /users/:id/follow
Authorization: Required
```

---

#### Get User's Blogs
```http
GET /users/:username/blogs?page=1&limit=20
```

---

### Payments

#### Create Order (Exclusive Blog)
```http
POST /payments/create-order
Authorization: Required
```

**Request Body:**
```json
{
  "blogId": "uuid",
  "amount": 10000
}
```

**Response:**
```json
{
  "data": {
    "orderId": "order_xxx",
    "amount": 10000,
    "currency": "INR"
  }
}
```

---

#### Verify Payment (Webhook)
```http
POST /payments/webhook
```

**Headers:**
```http
X-Razorpay-Signature: <signature>
```

---

#### Check Purchase Status
```http
GET /payments/check/:blogId
Authorization: Required
```

---

### Wallet

#### Get Wallet Balance
```http
GET /wallet
Authorization: Required (CREATOR+)
```

**Response:**
```json
{
  "data": {
    "balance": 12500,
    "pendingPayout": 3000,
    "lifetimeEarnings": 145000
  }
}
```

---

#### Get Transactions
```http
GET /wallet/transactions?page=1&limit=20
Authorization: Required (CREATOR+)
```

---

#### Request Withdrawal
```http
POST /wallet/withdraw
Authorization: Required (CREATOR+)
```

**Request Body:**
```json
{
  "amount": 5000
}
```

---

### Media

#### Upload File
```http
POST /media/upload
Authorization: Required
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Binary file data

**Response:**
```json
{
  "data": {
    "url": "https://r2.yourdomain.com/...",
    "key": "uploads/uuid.jpg"
  }
}
```

---

#### Delete File
```http
DELETE /media/:key
Authorization: Required
```

---

### AI

#### Generate Summary
```http
POST /ai/summarize
Authorization: Required (CREATOR+)
```

**Request Body:**
```json
{
  "blogId": "uuid"
}
```

---

#### Ask AI About Blog
```http
POST /ai/ask
Authorization: Required
```

**Request Body:**
```json
{
  "blogId": "uuid",
  "question": "What are the main points?"
}
```

**Response:**
```json
{
  "data": {
    "answer": "The main points discussed are...",
    "citations": [
      { "paragraph": 2, "text": "Quote from article..." }
    ]
  }
}
```

---

### Community Notes

#### Get Notes for Blog
```http
GET /community-notes/blog/:blogId
```

---

#### Create Note
```http
POST /community-notes
Authorization: Required
```

**Request Body:**
```json
{
  "blogId": "uuid",
  "content": "This should be clarified...",
  "quote": "The quoted text..."
}
```

---

#### Vote on Note
```http
POST /community-notes/:id/vote
Authorization: Required
```

**Request Body:**
```json
{
  "vote": "helpful"
}
```

---

#### Author Response
```http
POST /community-notes/:id/respond
Authorization: Required (Blog Author)
```

**Request Body:**
```json
{
  "response": "Thank you for the feedback..."
}
```

---

### Health

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "memory": { "status": "up" }
  }
}
```

---

## Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Public | 100 req/min |
| Authenticated | 200 req/min |
| Auth endpoints | 10 req/min |
| AI endpoints | 20 req/min |
| Upload | 30 req/min |

---

## SDK Examples

### JavaScript/TypeScript
```typescript
// Using fetch
const response = await fetch('/api/blogs/my-blog-slug');
const { data } = await response.json();

// Using the provided API client
import { api } from '@/lib/api-client';
const blog = await api.get('/blogs/my-blog-slug');
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | Dec 2024 | Initial API release |
