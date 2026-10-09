# SwiVastu Frontend

SwiVastu is a modern peer-to-peer marketplace frontend built with React and Vite. The platform enables users to buy, sell, exchange, rent, or give away items they no longer need in a simple, community-driven experience.

The frontend includes the landing experience, authentication, item discovery, listing creation, item details, and marketplace request initiation.

## Overview

The frontend is designed to help people:

- discover useful items near them
- list products for sale or exchange
- browse by categories
- connect through a simple marketplace flow
- reuse and redistribute goods instead of discarding them

## Tech Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Lucide React
- React Icons
- Axios

## Project Structure

```bash
src/
├── App.jsx
├── main.jsx
├── components/
│   └── Layout/
│       └── LandingNavbar.jsx
├── pages/
│   └── Landing/
│       └── landing.jsx
└── assets/
```

## Features

- responsive landing page
- responsive item discovery with search, category filters, sorting, and paging
- navbar search, saved/liked items, and marketplace activity notifications
- unread notification counts for incoming requests and transaction status changes
- secure cookie-based authentication and protected member routes
- create and manage item listings, including photos and sell, exchange, rent, and giveaway options
- item details with owner-safe profile information
- purchase, giveaway, exchange, and rental request initiation
- clean, modern visual design focused on reuse and exchange

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install dependencies

```bash
npm install
```

### Run the app locally

```bash
npm run dev
```

The app will start in development mode and be available in your browser at the local Vite URL.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Available Scripts

```bash
npm run dev      # start the Vite development server
npm run build    # create a production build
npm run preview  # preview the production build locally
npm run lint     # run ESLint checks
```

## Routing

The app includes these routes:

- `/` — landing page
- `/login` — sign in
- `/register` — create an account
- `/home` — protected marketplace discovery
- `/item/:id` — item details and request actions
- `/create-item` — protected item listing form
- `/my-items` — protected listing management
- `/requests` — protected incoming, sent, and historical request management

The default API base URL is `/api/v1`. In local development, Vite proxies API requests to the Render backend. On Vercel, `vercel.json` proxies them to the same backend, keeping browser requests and auth cookies on the app's origin. Optionally set `VITE_API_PROXY_TARGET` to change the local development proxy host.

## Deploy to Vercel

Import this repository into Vercel and use the following project settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

The included `vercel.json` proxies `/api/*` requests to the hosted backend and rewrites app routes to `index.html`, so authentication and direct visits/refreshes on routes such as `/item/:id` work without setting an environment variable. To use another backend, update the `/api/:path*` destination in `vercel.json` and redeploy.

Item photos can be downloaded from the item details page; supported mobile browsers open the native share sheet so the image can be saved or shared.

## Notes

The frontend sends authentication cookies with API requests. The backend must allow the frontend origin with credentialed CORS and use HTTPS for cross-site cookies.

## License

This project is currently unlicensed unless otherwise specified by the project owner.
