# Frontend Architecture

> Complete frontend documentation for the Premium AI-Powered Blogging Platform.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design System](#design-system)
3. [Component Library](#component-library)
4. [State Management](#state-management)
5. [Routing Structure](#routing-structure)
6. [Motion & Animation](#motion--animation)
7. [Accessibility](#accessibility)
8. [Performance](#performance)
9. [Development Guidelines](#development-guidelines)

---

## Architecture Overview

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework (App Router) |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | 11.x | Animations |
| Lenis | 1.x | Smooth scrolling |
| Zustand | 4.x | Client state |
| TanStack Query | 5.x | Server state |
| TipTap | 2.x | Rich text editor |

### Folder Structure

```
blog-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── blog/[slug]/        # Dynamic blog page
│   │   ├── explore/            # Feed page
│   │   ├── write/              # Editor page
│   │   ├── dashboard/          # Author dashboard
│   │   │   ├── earnings/
│   │   │   └── articles/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   ├── providers.tsx       # Context providers
│   │   └── sitemap.ts          # Dynamic sitemap
│   │
│   ├── components/
│   │   ├── ui/                 # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Accessibility.tsx
│   │   ├── layout/             # Layout components
│   │   │   └── Navbar.tsx
│   │   ├── blog/               # Blog-specific
│   │   │   └── BlogCard.tsx
│   │   ├── editor/             # Editor components
│   │   │   ├── TipTapEditor.tsx
│   │   │   └── MediaUpload.tsx
│   │   ├── ai/                 # AI features
│   │   │   └── AskAISidebar.tsx
│   │   ├── community/          # Community notes
│   │   │   └── CommunityNotes.tsx
│   │   ├── monetization/       # Payment UI
│   │   │   └── Paywall.tsx
│   │   └── effects/            # Visual effects
│   │       └── WaterEffects.tsx
│   │
│   ├── services/               # API layer
│   │   ├── auth.service.ts
│   │   └── media.service.ts
│   │
│   ├── store/                  # Zustand stores
│   │   └── auth.store.ts
│   │
│   ├── lib/                    # Utilities
│   │   ├── api-client.ts
│   │   ├── seo.ts
│   │   ├── motion.ts
│   │   ├── utils.ts
│   │   └── dummy-data.ts
│   │
│   └── styles/                 # Custom CSS
│       ├── glass.css
│       └── scroll.css
│
└── public/                     # Static assets
    └── robots.txt
```

---

## Design System

### Color Palette

```css
:root {
  /* Core */
  --background: #0B0B0C;
  --foreground: #F5F5F7;
  --muted: #A1A1A6;
  
  /* Accent */
  --accent: #5E9EFF;
  --accent-hover: #4A8AE5;
  
  /* Semantic */
  --success: #34C759;
  --warning: #FF9500;
  --error: #FF3B30;
  
  /* Glass */
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.06);
}
```

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter | 48-72px | 700 |
| H2 | Inter | 32-40px | 600 |
| H3 | Inter | 24-28px | 600 |
| Body | Inter | 16-18px | 400 |
| Caption | Inter | 12-14px | 400 |

### Spacing Scale

```
4px  (1)  - Micro gaps
8px  (2)  - Tight spacing
16px (4)  - Element padding
24px (6)  - Section spacing
32px (8)  - Large gaps
48px (12) - Section padding
64px (16) - Page padding
```

### Glassmorphism Rules

```css
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

.glass-subtle {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}
```

**Where to use glass:**
- Navbar
- Modals
- Floating actions
- Cards (subtle)

**Where NOT to use glass:**
- Text content areas
- Forms
- Dashboards (use solid backgrounds)

---

## Component Library

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Button` | `ui/Button.tsx` | Primary action button |
| `Input` | `ui/Input.tsx` | Form input with error state |
| `Skeleton` | `ui/Skeleton.tsx` | Loading placeholders |
| `BlogCard` | `blog/BlogCard.tsx` | Blog preview card |
| `Navbar` | `layout/Navbar.tsx` | Global navigation |

### Component Patterns

```tsx
// Props interface pattern
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

// Component pattern
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </motion.button>
  );
}
```

---

## State Management

### Client State (Zustand)

```typescript
// store/auth.store.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

### Server State (TanStack Query)

```typescript
// hooks/useBlogs.ts
export function useBlogs(page: number) {
  return useQuery({
    queryKey: ['blogs', page],
    queryFn: () => api.get(`/blogs?page=${page}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLikeBlog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (blogId: string) => api.post(`/blogs/${blogId}/like`),
    onMutate: async (blogId) => {
      // Optimistic update
      await queryClient.cancelQueries(['blog', blogId]);
      const previous = queryClient.getQueryData(['blog', blogId]);
      queryClient.setQueryData(['blog', blogId], (old: Blog) => ({
        ...old,
        likeCount: old.likeCount + 1,
        isLiked: true,
      }));
      return { previous };
    },
    onError: (_, __, context) => {
      // Rollback
      queryClient.setQueryData(['blog'], context?.previous);
    },
  });
}
```

---

## Routing Structure

### Route Groups

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Home page |
| `/explore` | Public | Blog feed |
| `/blog/[slug]` | Public | Blog reading |
| `/login` | Guest | Login page |
| `/register` | Guest | Registration |
| `/write` | Protected | Blog editor |
| `/dashboard` | Protected | Author dashboard |
| `/dashboard/earnings` | Protected | Earnings page |

### Dynamic Routes

```typescript
// app/blog/[slug]/page.tsx
export default function BlogPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  // Fetch blog by slug
}

// Generate static params for SSG
export async function generateStaticParams() {
  const blogs = await fetchAllBlogSlugs();
  return blogs.map((slug) => ({ slug }));
}
```

---

## Motion & Animation

### Animation Principles

| Principle | Implementation |
|-----------|----------------|
| **Support reading** | No distracting animations on content |
| **Subtle by default** | Micro-animations < 300ms |
| **Spatial awareness** | Elements enter from logical directions |
| **Reduced motion** | Respect `prefers-reduced-motion` |

### Where Effects Exist

✅ **Apply effects to:**
- Landing hero (gradient orbs, parallax)
- Section transitions (scroll reveal)
- Card hovers (tilt, glow)
- Button interactions (ripple, scale)

❌ **No effects on:**
- Blog reading content
- Form inputs
- Dashboard data
- Text paragraphs

### Motion Presets

```typescript
// lib/motion.ts
export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export const spring = {
  type: 'spring',
  damping: 25,
  stiffness: 200,
};
```

---

## Accessibility

### Requirements

| Feature | Implementation |
|---------|----------------|
| **Skip links** | `SkipLink` component in layout |
| **Focus trap** | `useFocusTrap` for modals |
| **Keyboard nav** | `useKeyboardShortcut` hook |
| **ARIA labels** | All interactive elements |
| **Reduced motion** | `useReducedMotion` hook |
| **Color contrast** | 4.5:1 minimum ratio |

### Accessibility Components

```tsx
// Skip link for keyboard users
<SkipLink />

// Focus trap for modals
const ref = useFocusTrap(isOpen);
<dialog ref={ref}>...</dialog>

// Live regions for announcements
<LiveRegion message={status} />
```

---

## Performance

### Optimization Strategies

| Strategy | Implementation |
|----------|----------------|
| **Code splitting** | Dynamic imports |
| **Image optimization** | Next.js `<Image>` |
| **Font loading** | `display: swap` |
| **Skeleton loading** | Component placeholders |
| **Cache headers** | Static asset caching |
| **Bundle analysis** | `@next/bundle-analyzer` |

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src={coverUrl}
  alt={title}
  width={800}
  height={400}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={blurHash}
/>
```

### Loading States

```tsx
// Use Suspense with loading skeletons
<Suspense fallback={<BlogCardSkeleton />}>
  <BlogList />
</Suspense>
```

---

## Development Guidelines

### File Naming

- **Components**: PascalCase (`BlogCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Styles**: kebab-case (`glass.css`)

### Import Order

```typescript
// 1. React/Next
import { useState } from 'react';
import Link from 'next/link';

// 2. Third-party
import { motion } from 'framer-motion';

// 3. Internal - components
import { Button } from '@/components/ui';

// 4. Internal - utils
import { cn } from '@/lib/utils';

// 5. Types
import type { Blog } from '@/types';
```

### Component Checklist

- [ ] TypeScript props interface
- [ ] Default prop values
- [ ] Error boundaries where needed
- [ ] Loading/error states
- [ ] Keyboard accessibility
- [ ] Mobile responsive
- [ ] Reduced motion support

---

## Next Steps

- [API Reference →](./API.md)
- [Deployment →](./DEPLOYMENT.md)
- [Architecture →](./ARCHITECTURE.md)
