# SalonBook — Client

**SalonBook** is a salon appointment booking platform where customers explore salon services, request appointments, and pay for confirmed bookings through Stripe. Admins manage services, appointments, customers, and payments from a dedicated dashboard.

## Important Features

- Responsive salon-themed UI (desktop, tablet, mobile)
- Public home page with dynamic featured services and service categories
- Browse services with search, category filter, and price sorting
- Protected service details page with appointment booking
- Better Auth sign up / sign in (email + password, Google)
- Role-based protected routes:
  - Customers → `/dashboard/customer`
  - Admins → `/dashboard/admin`
- Customer dashboard
  - Live overview statistics
  - My appointments (status badges, cancel pending, pay confirmed)
  - Payment history
  - Profile management with image upload
- Admin dashboard
  - Live overview statistics
  - Manage services (create, update, upload image, activate/deactivate, delete)
  - Manage appointments (confirm pending, cancel)
  - Manage customers (view, block, unblock)
  - Transactions
  - Admin profile
- Stripe Checkout redirect + payment success/cancel pages
- Toast/inline feedback, loading states, and error handling
- Footer with contact details, opening hours, and social links

## Technology Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Better Auth client
- Stripe Checkout
- Deployed REST API (Express + MongoDB)

## Installation

```bash
git clone https://github.com/ayeshasiddika3288-ayesha/salonbook-client.git
cd salonbook-client
npm install
```

## How to Run the Project Locally

1. Create a `.env.local` file (see the variable names below).
2. Make sure the server is running (default `http://localhost:5000`).
3. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Production build:

```bash
npm run build
npm start
```

## Required Environment Variables (names only)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the SalonBook server API |

> All sensitive keys (MongoDB, Better Auth secret, Stripe, ImgBB) live only on the server. Never commit `.env.local` or secret values.

## Required Application URLs

- Home: `/`
- Browse services: `/services`
- Service details: `/services/[id]`
- Booking: `/booking?service=<id>`
- Sign in: `/auth/login`
- Sign up: `/auth/register`
- Customer dashboard: `/dashboard/customer`
- Admin dashboard: `/dashboard/admin`
- Payment success: `/dashboard/customer/payments/success`
- Payment cancel: `/dashboard/customer/payments/cancel`

## Live Website

- Client: _add your deployed client URL here_
- Server: _add your deployed server URL here_

## Repositories

- Client: https://github.com/ayeshasiddika3288-ayesha/salonbook-client
- Server: https://github.com/ayeshasiddika3288-ayesha/salonbook-server

## Deployment Notes

- Set `NEXT_PUBLIC_API_URL` to the deployed server URL in the hosting dashboard.
- On the server, `CLIENT_URL` must include this deployed client URL (CORS + Better Auth trusted origin).
- Private routes use client-side session checks; make sure the server is reachable and `BETTER_AUTH_URL` is correct so refreshes keep the user signed in.
