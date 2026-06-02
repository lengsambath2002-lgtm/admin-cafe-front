# Brewmaster Admin

A premium cafe management dashboard for processing incoming orders, managing menu
categories and products, and analyzing daily sales trends.

Built with [Next.js](https://nextjs.org) (App Router), React 19, TypeScript and
Tailwind CSS v4.

## Run Locally

**Prerequisites:** Node.js

Install dependencies, then start the dev server:

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).
Optionally set `GEMINI_API_KEY` in `.env.local` if you wire up Gemini features.

## Scripts

- `npm run dev` — start the Next.js dev server on port 3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — type-check with `tsc --noEmit`

## Project structure

```text
src/
  app/            # Next.js App Router (layout, page, global styles)
  components/     # Dashboard views and modals (client components)
  data.ts         # Seed/demo data
  types.ts        # Shared TypeScript types
```
# admin-cafe-front
