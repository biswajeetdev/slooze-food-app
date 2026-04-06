# Slooze Food Ordering App

Full-stack, role-based food ordering web application built for the [Slooze fullstack challenge](https://github.com/slooze-careers/fullstack-challenge).

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | NestJS · GraphQL (code-first) · Prisma · SQLite |
| Frontend  | Next.js 16 · TypeScript · Tailwind CSS · Apollo Client v4 |
| Auth      | JWT · Argon2 · RBAC Guards · Country Re-BAC    |

---

## Role-Based Access Control

| Feature                     | Admin | Manager | Member |
|-----------------------------|:-----:|:-------:|:------:|
| View restaurants & menus    | ✅    | ✅      | ✅     |
| Create an order             | ✅    | ✅      | ✅     |
| Checkout & pay              | ✅    | ✅      | ❌     |
| Cancel an order             | ✅    | ✅ (own)| ❌     |
| Add / Modify payment methods| ✅    | ❌      | ❌     |

**Country-based Re-BAC (extension):** Managers and Members are restricted to restaurants in their assigned country (India 🇮🇳 or America 🇺🇸). Admins have global access across all countries.

---

## Quick Start

### Prerequisites
- Node.js 18+

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # Uses SQLite — no DB setup needed
npx prisma migrate dev        # Create tables
npx ts-node --transpile-only prisma/seed.ts  # Load mock data
npm run start:dev             # http://localhost:4000/graphql
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

Open `http://localhost:3000` — you'll be redirected to the login page.

---

## Demo Accounts

The login page includes **quick-fill buttons** for all accounts below:

| Role           | Email                       | Password       | Country |
|----------------|-----------------------------|----------------|---------|
| Admin          | admin.india@slooze.com      | Admin@1234     | 🇮🇳 India |
| Admin          | admin.us@slooze.com         | Admin@1234     | 🇺🇸 America |
| Manager        | manager.india@slooze.com    | Manager@1234   | 🇮🇳 India |
| Manager        | manager.us@slooze.com       | Manager@1234   | 🇺🇸 America |
| Member         | member.india@slooze.com     | Member@1234    | 🇮🇳 India |
| Member         | member.us@slooze.com        | Member@1234    | 🇺🇸 America |

---

## Mock Data

**6 restaurants pre-seeded (3 per country):**

| Country   | Restaurant        | Cuisine        |
|-----------|-------------------|----------------|
| 🇮🇳 India  | Biryani House     | Indian         |
| 🇮🇳 India  | Spice Cafe        | North Indian   |
| 🇮🇳 India  | South Delight     | South Indian   |
| 🇺🇸 America| The Burger Joint  | American       |
| 🇺🇸 America| Pizza Palace      | Italian-American |
| 🇺🇸 America| Tex-Mex Grill     | Tex-Mex        |

Each restaurant has 5 menu items spanning starters, mains, sides, desserts, and beverages.

---

## Feature Walkthrough

### Authentication
- Register with name, email, password, **role**, and **country**
- Login returns a JWT — stored in `localStorage` and sent as `Authorization: Bearer` header

### Country Re-BAC
- India users (Manager/Member) see only Indian restaurants
- US users see only American restaurants
- Ordering from a restaurant outside your country is blocked at the API level
- Admins bypass all country restrictions

### Ordering Flow
1. Browse restaurants (country-filtered)
2. View menu with category tabs
3. Add items to cart — adjust quantity inline
4. Place order (all roles)
5. Checkout with payment method (Admin/Manager only)
6. Cancel pending order (Admin/Manager only — own orders; Admin can cancel any)

### Payment Methods (Admin only)
- Supported types: **CARD**, **UPI**, **BANK_TRANSFER**
- Create, update label/default, delete
- Admin-created payment methods are visible to Managers for checkout
- Payment method IDs displayed for easy checkout selection

---

## Project Structure

```
food-app/
├── backend/
│   ├── src/
│   │   ├── auth/              # JWT strategy, GqlAuthGuard, RolesGuard, CountryGuard
│   │   ├── users/             # User listing (Admin only)
│   │   ├── restaurants/       # Country-filtered restaurant + menu queries
│   │   ├── orders/            # Create / checkout / cancel orders
│   │   ├── payment-methods/   # Payment method CRUD (Admin only)
│   │   ├── prisma/            # Global PrismaService
│   │   └── common/            # Shared enums (Role, Country, OrderStatus)
│   └── prisma/
│       ├── schema.prisma      # SQLite schema (User, Restaurant, MenuItem, Order, PaymentMethod)
│       └── seed.ts            # Mock data seeder
│
└── frontend/
    ├── app/
    │   ├── login/             # Login with demo quick-fill buttons
    │   ├── register/          # Registration with role + country selector
    │   ├── dashboard/         # Stats, recent orders, permissions, quick actions
    │   ├── restaurants/       # Restaurant grid with search
    │   ├── restaurants/[id]/  # Menu detail, category filter, cart, place order
    │   ├── orders/            # Order list, checkout dropdown, cancel (role-gated)
    │   └── payment-methods/   # Admin CRUD with inline editing
    ├── components/
    │   └── layout/            # Navbar (role badge, country flag), ApolloWrapper
    └── lib/
        ├── apollo-client.ts   # Apollo Client v4 setup with auth + error links
        ├── auth.ts            # JWT helpers, role-check utilities
        └── graphql/queries.ts # All GQL queries and mutations
```

---

## Security

- **Argon2** password hashing (memory-hard, resists GPU attacks)
- **JWT** with configurable expiry (default 7 days), verified server-side per request
- **RBAC** enforced at the GraphQL resolver level via NestJS guards — not just UI
- **Re-BAC** country filtering enforced at the service layer for every query/mutation
- **Input validation** with `class-validator` on all DTOs (whitelist, strip unknown)
- **CORS** restricted to `FRONTEND_URL` env variable
- Payment cards store only `last4` digits — no raw card data ever persisted

---

## GraphQL Playground

With the backend running, visit `http://localhost:4000/graphql` to explore the full schema and run queries interactively.

Example — login and get restaurants:
```graphql
mutation {
  login(input: { email: "admin.india@slooze.com", password: "Admin@1234" }) {
    accessToken
    user { name role country }
  }
}
```

Then add the token as an HTTP header:
```
Authorization: Bearer <accessToken>
```

```graphql
{ restaurants { name country cuisine menuItems { name price } } }
```
