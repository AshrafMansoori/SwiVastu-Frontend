# SwiVastu

SwiVastu is a community marketplace for giving useful items a second life. Members can discover nearby listings and arrange to buy, sell, exchange, rent, or give away items through a responsive web app.

This repository contains the frontend. It communicates with the SwiVastu backend for accounts, listings, requests, notifications, and messaging.

## Features

- Browse listings with search, category filters, sorting, and pagination.
- Create listings with photos and sell, barter, rent, or giveaway options.
- View item details, exchange preferences, and owner information.
- Send and manage purchase, exchange, and rental requests.
- Chat about marketplace transactions.
- Save listings to a wishlist and view marketplace notifications.
- Manage listings and profile information.
- Protect member pages with cookie-based authentication.

## Tech stack

- React 19 and Vite 8
- React Router
- Redux Toolkit
- Tailwind CSS
- Lucide React and React Icons
- Fetch API and Axios

## Getting started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- Access to a SwiVastu-compatible backend

### Install and run

```bash
npm install
npm run dev
```

Vite prints the local development URL after the server starts.

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create an optimized production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint across the project. |

## Configuration

The frontend uses these optional environment variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_URL` | Backend API base URL, including `/api/v1`. | Development: `/api/v1`; production: `https://swi-back.onrender.com/api/v1` |
| `VITE_API_PROXY_TARGET` | Backend origin used by Vite's local `/api` and `/socket` proxies. | `https://swi-back.onrender.com` |

To use a different API base URL, create a local `.env.local` file in the project root:

```dotenv
VITE_API_URL=https://your-backend.example.com/api/v1
```

For local development, the default `/api/v1` API URL is proxied by Vite. To point that proxy at another backend, set `VITE_API_PROXY_TARGET` in the environment where you start the dev server. The Vite configuration reads this variable directly from the process environment.

The backend must allow the frontend's origin for credentialed CORS requests. Authentication uses cookies, so production deployments should use HTTPS and configure the backend's CORS and cookie settings for the deployed frontend domain.

## Application routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public | Sign in |
| `/register` | Public | Create an account |
| `/home` | Members | Browse marketplace listings |
| `/item/:id` | Public | View listing details |
| `/create-item` | Members | Create a listing |
| `/my-items` | Members | Manage your listings |
| `/requests` | Members | View incoming, sent, and past requests |
| `/profile` | Members | View and manage your profile |
| `/wishlist` | Members | View saved listings |
| `/notifications` | Members | View marketplace notifications |
| `/chat` | Members | Open messages |
| `/chat/:transactionType/:transactionId` | Members | Open a transaction chat |

Member routes require authentication. Unauthenticated visitors are redirected to `/login`.

## Project structure

```text
src/
├── app/            # Redux store
├── components/     # Shared UI and layout components
├── context/        # React context providers
├── features/       # Redux features, including authentication
├── hooks/          # Shared React hooks
├── pages/          # Route-level screens
├── services/       # API and notification helpers
├── utils/          # Shared utilities
├── App.jsx         # Application routes
└── main.jsx        # React entry point
```

## Production deployment

The project can be deployed to Vercel:

1. Import this repository into Vercel.
2. Select **Vite** as the framework preset.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. Add `VITE_API_URL` if the deployment uses a backend other than the default.
6. Configure the backend to allow the deployed frontend origin with credentialed CORS.

The included `vercel.json` proxies `/api/*` requests and rewrites app routes to `index.html`, allowing direct navigation and refreshes on frontend routes.

## License

No license is specified in this repository. Contact the project owner for usage and distribution terms.
