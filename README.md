# Sales Management System

A point-of-sale (POS) web app for a small restaurant/food stand, built with SvelteKit and Supabase. It is mobile-responsive, designed to be used from a tablet or phone at the register.

## Features

- **Caja (Register)** — browse the product catalog, build an order, and charge it. Payment can be taken by card (via a Clip pinpad terminal) or cash (with automatic change calculation).
- **Mesas (Tables)** — open a separate running order per table; each table keeps its own cart until it's paid.
- **Admin** — view the current period's sales totals (cash vs. card), close out the register ("corte de caja"), and browse past closes with a per-product breakdown.
- **Auth** — Supabase-based sign in/sign up, with an `is_admin` flag on each profile gating access to the Admin section.

## Tech stack

- [SvelteKit](https://svelte.dev/docs/kit) + Svelte 5 (runes) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for utility styling, plain CSS per component for layout/visuals
- [Supabase](https://supabase.com/) for auth, database, and realtime (Postgres RPC functions drive sale processing and cash-register closing)
- [Clip](https://www.clip.mx/) pinpad API for in-person card payments, called through two SvelteKit server routes that create a payment intent and receive the webhook

## Project structure

```
src/
  routes/
    +page.svelte            Caja (register / product catalog + cart)
    mesas/+page.svelte       Table selection
    admin/+page.svelte       Cash-register closing & sales history
    api/webhooks/pagos/      Creates a Clip payment intent for a sale
    api/webhooks/clip/       Receives Clip's payment status webhook
  lib/
    components/ui/           PaymentButton, SideBar (cart), ProductsCards, LoginCard
    cart.svelte.ts           Shared cart store (one cart per context: caja/mesa-N)
    supabaseClient.ts        Browser Supabase client
    server/supabase.ts       Server-side Supabase client (service role)
```

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Create a `.env` file with:
   ```
   PUBLIC_SUPABASE_URL=
   PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   CLIP_AUTH_TOKEN=
   CLIP_TERMINAL_SERIAL=
   ```
3. Start the dev server:
   ```sh
   npm run dev
   ```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run check` | Type-check the project |
| `npm run lint` | Lint and check formatting |
| `npm run format` | Auto-format the codebase |
