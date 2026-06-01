# Client Setup Guide

> Reference doc for scaffolding a new frontend with the same shape as this `Client/` folder. Hand this file to a new project and follow the steps verbatim.

---

## 1. Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | React | `^19` |
| Build tool | Vite | `^7` (NOT v8 — see note) |
| React plugin | `@vitejs/plugin-react` | `^4` |
| UI library | Ant Design | `^6` |
| Icons | `@ant-design/icons` | `^6` |
| State (global) | Zustand | `^5` |
| Server state | `@tanstack/react-query` | `^5` |
| HTTP client | axios | `^1` |
| Routing | `react-router-dom` | `^7` |
| Styling | SCSS modules (`*.module.scss`) via `sass` | `^1` |
| Animations | GSAP | latest |
| File extension | `.js` everywhere (no `.jsx`, no `.tsx`) |
| CSS files | `*.module.scss` (CSS Modules) |

**Why Vite 7 and not 8:** Vite 8 uses Rolldown which rejects JSX inside `.js` files at the parser level. We want `.js`-only files, so we pin to Vite 7 which uses esbuild and handles JSX-in-`.js` cleanly.

---

## 2. Scaffold from Scratch

```bash
# 1. Create vite app (use Client as the dir name)
npm create vite@latest Client -- --template react
cd Client

# 2. Install base deps, then downgrade to Vite 7 stack
npm install
npm install vite@^7 @vitejs/plugin-react@^4 --save-dev

# 3. App dependencies
npm install antd @ant-design/icons zustand @tanstack/react-query axios react-router-dom sass gsap

# 4. Delete default Vite files we don't use
#    Remove: src/App.jsx, src/App.css, src/index.css, src/main.jsx
```

Then create the files per the structure below.

---

## 3. Folder Structure

```
Client/
├── public/                         # static assets served as-is
├── src/
│   ├── assets/                     # imported images, svgs, fonts
│   ├── auth/                       # auth logic shared across the app
│   │   ├── authStore.js            # zustand store (persisted), user + token
│   │   └── ProtectedRoute.js       # route guard component
│   ├── components/                 # generic reusable UI components
│   ├── config/                     # app-wide constants
│   │   ├── apiConfig.js            # API_BASE_URL + ENDPOINTS (SCREAMING_SNAKE_CASE keys)
│   │   └── mockData/               # placeholder mock data
│   ├── features/                   # feature-based modules
│   │   ├── dashboard/              # one feature = one folder
│   │   │   ├── dashboardService.js     # ALL API methods for this feature
│   │   │   ├── dashboardQueries.js     # ALL react-query hooks
│   │   │   ├── Hero/                   # each sub-feature has its own folder
│   │   │   │   ├── index.js
│   │   │   │   └── Hero.module.scss
│   │   │   ├── StatsGrid/{index.js, StatsGrid.module.scss}
│   │   │   ├── ActivityFeed/{index.js, ActivityFeed.module.scss}
│   │   │   └── QuickLinks/{index.js, QuickLinks.module.scss}
│   │   └── login/
│   │       ├── services/
│   │       │   ├── loginService.js
│   │       │   └── loginQueries.js
│   │       ├── login.module.scss
│   │       └── index.js
│   ├── hoc/                        # higher-order components
│   ├── hooks/                      # shared custom hooks
│   ├── layouts/                    # layout shells (Navbar, MainLayout, etc.)
│   │   ├── MainLayout.js
│   │   ├── MainLayout.module.scss
│   │   └── Navbar/
│   │       ├── Navbar.js
│   │       └── Navbar.module.scss
│   ├── locales/en/common.json      # i18n strings
│   ├── pages/                      # route-level components
│   │   ├── DashboardPage.js        # composes dashboard sub-features
│   │   ├── DashboardPage.module.scss
│   │   └── LoginPage.js
│   ├── store/                      # cross-feature zustand stores
│   │   └── appStore.js
│   ├── styles/
│   │   ├── variables.scss          # colors, gradients, radii, shadows
│   │   └── global.scss             # base resets + global classes
│   ├── theme/
│   │   └── theme.js                # antd ConfigProvider tokens
│   ├── utils/
│   │   └── api.js                  # axios instance + interceptors
│   ├── App.js                      # routes
│   └── main.js                     # entry: ReactDOM + providers
├── .env                            # VITE_PORT, VITE_API_BASE_URL, VITE_API_PROXY_TARGET
├── .gitignore
├── eslint.config.js
├── index.html                      # links Google Fonts + script /src/main.js
├── package.json
├── vite.config.js
└── SETUP.md                        # this file
```

---

## 4. Conventions

### Naming
- **React components**: `PascalCase` files (`Navbar.js`, `DashboardPage.js`)
- **Hooks / utils / services**: `camelCase` files (`api.js`, `dashboardService.js`)
- **SCSS modules**: `<Name>.module.scss` — one per component folder
- **Endpoint keys**: `SCREAMING_SNAKE_CASE` inside `ENDPOINTS`

### Where things live
- An **endpoint URL string** → only in `config/apiConfig.js`
- A **service method** (raw axios call) → in `<feature>/<feature>Service.js`
- A **react-query hook** → in `<feature>/<feature>Queries.js`
- A **piece of UI** → in `<feature>/<SubFeature>/index.js`
- A **page** (route target) → in `pages/` and composes feature sub-folders

### Adding a new sub-feature to an existing feature
1. Add a method to `<feature>/<feature>Service.js`
2. Add a hook to `<feature>/<feature>Queries.js`
3. Create `<feature>/<NewSub>/index.js` + `<feature>/<NewSub>/<NewSub>.module.scss`
4. Render it inside the relevant page in `pages/`

### Adding a brand new feature
1. Create `features/<name>/` with `<name>Service.js` + `<name>Queries.js`
2. Create sub-feature folders inside it
3. Add a page in `pages/` that composes them
4. Add a route in `App.js`

### Pages vs Features
- A **feature folder** holds the building blocks (sub-features + their data layer).
- A **page** is the route target — it composes one or more features into the actual screen.
- The dashboard feature has **no** `index.js` at its root — `pages/DashboardPage.js` directly imports sub-features.

---

## 5. Environment Variables (`.env`)

```bash
VITE_PORT=5174
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:3000
VITE_APP_NAME=Patternlab Combo
```

- `VITE_API_BASE_URL` is what axios prepends — set to `/api` so dev requests go through the Vite proxy.
- `VITE_API_PROXY_TARGET` is where the proxy forwards `/api/*` calls in dev (the Nest server).

---

## 6. Key File Templates

### `vite.config.js`
- `@vitejs/plugin-react`
- `@` alias → `./src`
- `esbuild.loader = 'jsx'` for `.js` files (so JSX inside `.js` works)
- `optimizeDeps.esbuildOptions.loader = { '.js': 'jsx' }`
- `server.proxy['/api']` → `VITE_API_PROXY_TARGET`

### `src/main.js`
- Wraps `<App />` in:
  - `QueryClientProvider` (TanStack Query)
  - `ConfigProvider` (antd theme)
  - `BrowserRouter` (react-router)
- Imports `./styles/global.scss`

### `src/App.js`
- Defines routes
- `/login` is public
- All other routes nested under `ProtectedRoute` + `MainLayout`

### `src/utils/api.js`
- axios instance with `baseURL = API_BASE_URL`
- Request interceptor injects `Authorization: Bearer <token>` from `useAuthStore`
- Response interceptor calls `useAuthStore.getState().logout()` on `401`

### `src/auth/authStore.js`
- zustand with `persist` middleware (localStorage key `combo-auth`)
- State: `{ user, token, isAuthenticated }`
- Actions: `setAuth({user, token})`, `logout()`

### `src/config/apiConfig.js`
```js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const ENDPOINTS = {
  auth: { LOGIN: '/auth/login' },
  dashboard: {
    SUMMARY: '/dashboard',
    STATS: '/dashboard/stats',
    ACTIVITY: '/dashboard/activity',
    QUICK_LINKS: '/dashboard/quick-links',
  },
};
```

### `index.html`
- Adds Google Fonts preconnect + stylesheet (`Space Grotesk` + `Bricolage Grotesque`)
- Script src: `/src/main.js`

### `src/theme/theme.js`
- Exports `colors` object and `antdTheme` for `<ConfigProvider theme={antdTheme}>`
- `fontFamily` set to `'Space Grotesk', ...`

### `src/styles/variables.scss`
- SCSS variables for colors, gradients (`$gradient-primary`, etc.), radii, shadows
- Imported by every component scss as `@use '../../../styles/variables.scss' as *;`

---

## 7. Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

---

## 8. Quick Start

```bash
cd Client
npm install
npm run dev       # opens on http://localhost:5174
```

Dev server proxies `/api/*` to the NestJS server on `localhost:3000` — make sure the backend is running.
