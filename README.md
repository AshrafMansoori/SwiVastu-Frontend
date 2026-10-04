# SwiVastu Frontend

SwiVastu is a modern peer-to-peer marketplace frontend built with React and Vite. The platform enables users to buy, sell, exchange, rent, or give away items they no longer need in a simple, community-driven experience.

This project provides the landing experience and navigation for the app, with routes for home, login, and registration.

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
- interactive marketplace messaging and call-to-action sections
- category browsing UI
- step-by-step onboarding sections
- route-based navigation for login, register, and home pages
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

The app currently includes these routes:

- `/` — landing page
- `/login` — login page placeholder
- `/register` — registration page placeholder
- `/home` — home page placeholder

## Notes

This repository currently focuses on the frontend presentation and flow. Full backend integration, authentication, item listing, and marketplace logic can be added on top of this foundation.

## License

This project is currently unlicensed unless otherwise specified by the project owner.
