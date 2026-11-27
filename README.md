# SalonBook — Client

**SalonBook** is a salon appointment booking platform where customers explore salon services, request appointments, and pay for confirmed bookings through Stripe. Admins manage services, appointments, customers, and payments from a dedicated dashboard.

## Important Features

- Responsive salon-themed UI (desktop, tablet, mobile)
- Public home page with dynamic featured services and service categories
- Browse services with search, category filter, and price sorting
- Login-protected service details page with appointment booking
- Better Auth sign up / sign in (email + password, Google OAuth when configured)
  - Password rule: at least 6 characters with one uppercase and one lowercase letter
  - Optional phone number saved on the profile
- Role-based dashboard with a shared sidebar shell (`DashboardShell`):
  - Customers → `/dashboard/customer`
  - Admins → `/dashboard/admin`
  - Wrong-role visits are redirected, signed-out visitors are sent to login with a `?redirect=` back-link
- Customer dashboard
  - Live overview statistics
  - My appointments with service image/category, requested date, booking details and price snapshot
  - Cancel own **pending** appointments (custom confirm dialog)
  - Pay **confirmed** unpaid appointments through Stripe Checkout
  - Payment history with `paid` / `failed` statuses
  - Profile management (name, phone, image upload)
- Admin dashboard
  - Live overview statistics
  - Manage services (create, update, upload image, activate/deactivate, delete)
  - Manage appointments with customer name, email and phone; confirm `pending → confirmed` and cancel
  - Manage customers (view, block, unblock)
  - Transactions with customer details and `paid` / `failed` statuses
  - Admin profile
- Stripe Checkout redirect + payment success/cancel pages
- `sonner` toast notifications everywhere instead of `alert` / `window.confirm`
- Custom `ConfirmDialog` for destructive actions (cancel, delete, block)
- Global navbar with desktop profile dropdown and mobile menu
- Custom `not-found`, `error`, `global-error` and `loading` pages
- Shared footer with contact details, opening hours, and social links

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
| `NEXT_PUBLIC_API_URL` | Base URL of the SalonBook server API and target of the client `/api/*` rewrite |
| `NEXT_PUBLIC_CLIENT_URL` | Client origin used by the auth client (falls back to same-origin `/api/auth`) |

> All sensitive keys (MongoDB, Better Auth secret, Stripe, ImgBB) live only on the server. Never commit `.env.local` or secret values.

## Required Application URLs

- Home: `/`
- Browse services: `/services`
- Service details (login required): `/services/[id]`
- Booking: `/booking?service=<id>`
- Sign in: `/auth/login`
- Sign up: `/auth/register`
- Customer dashboard: `/dashboard/customer`
- Customer appointments: `/dashboard/customer/appointments`
- Customer payments: `/dashboard/customer/payments`
- Customer profile: `/dashboard/customer/profile`
- Admin dashboard: `/dashboard/admin`
- Admin services: `/dashboard/admin/services`
- Admin appointments: `/dashboard/admin/appointments`
- Admin customers: `/dashboard/admin/customers`
- Admin transactions: `/dashboard/admin/transactions`
- Admin profile: `/dashboard/admin/profile`
- Payment success: `/dashboard/customer/payments/success`
- Payment cancel: `/dashboard/customer/payments/cancel`

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@salonbook.com` | `AdminSalon1` |
| Customer | `customer.test@example.com` | `Customer123` |

> Change the admin password before sharing a public deployment.

## Live Website

- Client: https://salonbook-client-six.vercel.app
- Server: https://salonbook-server-gules.vercel.app
- Health check: https://salonbook-server-gules.vercel.app/api/health

## Repositories

- Client: https://github.com/ayeshasiddika3288-ayesha/salonbook-client
- Server: https://github.com/ayeshasiddika3288-ayesha/salonbook-server

## Deployment Notes

### Vercel (client)

1. Import this repository in Vercel and keep the auto-detected **Next.js** preset.
2. Add the environment variables:
   - `NEXT_PUBLIC_API_URL` → your deployed Express server URL (no trailing slash). It is also the target of the `/api/*` rewrite, which keeps browser API requests on the client domain.
   - `NEXT_PUBLIC_CLIENT_URL` → your deployed client URL (no trailing slash), used by the auth client.
3. Deploy, then copy the Vercel domain into the server configuration below.
4. Re-deploy after changing any `NEXT_PUBLIC_*` variable — they are inlined at build time.

### Express server

The Express + MongoDB API is deployed on Vercel as a second project using the **Express** backend preset (`src/app.js` exports the Express app, and the database connections are cached per serverless instance):

- Set `CLIENT_URL` to the Vercel client domain so CORS and Better Auth trusted origins accept it (comma-separate extra origins such as preview domains; trailing slashes are trimmed automatically). The first origin is the Better Auth base URL.
- Set `MONGODB_URI`, `BETTER_AUTH_SECRET`, Stripe and ImgBB keys. `NODE_ENV=production` is provided by Vercel.
- Add the Stripe webhook endpoint `https://<server-domain>/api/payments/webhook`.
- If Google sign-in is enabled, add `https://<client-domain>/api/auth/callback/google` as an authorized redirect URI in Google Cloud Console.
- Render/Railway work too — the same environment variables apply, just run `npm start`.

### Auth notes

- Dashboard routes are guarded client-side by `DashboardShell`; the API enforces roles server-side on every protected request.
- The server re-reads `role` and `isBlocked` from MongoDB on each request, so blocking a customer invalidates their access immediately.
- `/api/auth/*` is rewritten to the Express API, so auth callbacks and session cookies use the client domain. Production cookies are first-party (`SameSite=Lax; Secure`).

