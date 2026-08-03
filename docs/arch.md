# Next.js Frontend Architecture (App Router)

> Frontend Architecture untuk **Next.js App Router** yang terhubung ke
> **Backend Golang REST API**.

## Tech Stack

### Framework

- Next.js (App Router)
- TypeScript

### UI

- Tailwind CSS
- shadcn/ui
- Lucide React
- Sonner

### State Management

- TanStack React Query (Server State)
- Zustand (Client State)

### HTTP

- Axios

### Form

- React Hook Form
- Zod

### Utility

- clsx
- tailwind-merge
- date-fns

---

# Folder Structure

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                 # shadcn/ui (generated)
│   ├── common/
│   ├── layouts/
│   └── shared/
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── types/
│   │   └── query/
│   │
│   ├── project/
│   ├── issue/
│   ├── task/
│   ├── user/
│   └── dashboard/
│
├── lib/
│   ├── axios.ts
│   ├── query-client.ts
│   ├── query-keys.ts
│   ├── utils.ts
│   └── env.ts
│
├── providers/
│   ├── query-provider.tsx
│   ├── theme-provider.tsx
│   └── app-provider.tsx
│
├── store/
│   ├── auth.store.ts
│   ├── sidebar.store.ts
│   └── theme.store.ts
│
├── hooks/
├── config/
├── constants/
├── types/
├── schemas/
├── utils/
├── assets/
└── middleware.ts
```

---

# Layer

## UI Layer

- app/
- components/
- features/\*/components

## Business Layer

- features/\*/hooks
- features/\*/services

## API Layer

- Axios
- React Query

## Backend

- Golang REST API

Flow:

```text
Page
 ↓
Feature Component
 ↓
Custom Hook
 ↓
React Query
 ↓
Service
 ↓
Axios
 ↓
Go REST API
```

---

# Axios

`lib/axios.ts`

Tanggung jawab:

- Base URL
- Authorization Header
- Refresh Token
- Response Interceptor
- Error Handling

Jangan memanggil `fetch()` atau `axios` langsung dari component.

---

# React Query

Digunakan untuk seluruh **server state**:

- Login
- User
- Project
- Task
- Issue

Semua query dan mutation berada di folder:

```text
features/project/query
features/auth/query
```

---

# Zustand

Gunakan hanya untuk client state:

- Auth User
- Sidebar
- Theme
- UI Preferences

Jangan menyimpan data API di Zustand.

---

# shadcn/ui

Seluruh komponen hasil generate tetap berada di:

```text
components/ui
```

Wrapper atau komponen bisnis diletakkan di:

```text
components/common
features/*/components
```

Jangan mengubah komponen bawaan shadcn jika tidak perlu.

---

# Feature Example

```text
features/
└── project/
    ├── api/
    ├── components/
    ├── hooks/
    ├── query/
    ├── schemas/
    ├── services/
    ├── types/
    └── index.ts
```

---

# Best Practices

- Feature-first architecture.
- Service hanya bertugas memanggil backend Go.
- React Query untuk server state.
- Zustand hanya untuk UI/client state.
- Gunakan Zod + React Hook Form untuk validasi.
- Gunakan path alias (`@/`).
- Pisahkan DTO, schema, dan UI.
- Gunakan query key terpusat.
- Hindari business logic di page atau component.
