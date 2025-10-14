This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- UI: React
- Styling: Tailwind CSS (via PostCSS)
- Linting: ESLint
- Package manager: npm

## Data persistence (demo mode)

- Demo mode stores data in memory only.
- Data resets on server restart or when the development process is killed.
- No external database is required for local development.

## Prerequisites

- Node.js 18.17+ (LTS recommended) and npm 9+
- Git

Check your versions:
- macOS/Linux: `node -v && npm -v`
- Windows (PowerShell or CMD): `node -v && npm -v`

## Setup

### macOS

1) Install Node.js
    - Recommended: Use the official installer from https://nodejs.org or a version manager like nvm.
2) Clone the repository
    - `git clone <your-repo-url> && cd <your-project-folder>`
3) Install dependencies
    - `npm install`
4) Start the development server
    - `npm run dev`
5) Open the app
    - Visit http://localhost:3000

### Windows

1) Install Node.js
    - Download the Windows installer from https://nodejs.org and follow the prompts.
2) Clone the repository
    - PowerShell: `git clone <your-repo-url>; cd <your-project-folder>`
3) Install dependencies
    - `npm install`
4) Start the development server
    - `npm run dev`
5) Open the app
    - Visit http://localhost:3000

### Common scripts

- `npm run dev` — Start the local dev server with hot reload.
- `npm run build` — Create a production build.
- `npm start` — Run the production build locally.
- `npm run lint` — Lint the codebase.

### Notes

- Hot reloading: Edits to files under `app/` will auto-refresh the browser during development.
- Ports: If port 3000 is in use, set `PORT=3001` (macOS/Linux) or `set PORT=3001` (Windows CMD) or `$env:PORT=3001` (PowerShell) before `npm run dev`.




This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.