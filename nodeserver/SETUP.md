# Server Setup Guide

> Reference doc for scaffolding a new backend with the same shape as this `nodeserver/` folder. Hand this file to a new project and follow the steps verbatim.

---

## 1. Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | NestJS | `^11` (latest from `@nestjs/cli new`) |
| Language | TypeScript | `^5` |
| Database | MongoDB (local, no auth in dev) | `27017` |
| ODM | Mongoose via `@nestjs/mongoose` | `^11` / `^8` |
| Config | `@nestjs/config` | latest |
| Validation | `class-validator` + `class-transformer` | latest |
| Testing | Jest + Supertest (default Nest setup) | |
| File extension | `.ts` |
| Code style | ESLint + Prettier (default Nest config) | |

---

## 2. Scaffold from Scratch

```bash
# 1. Generate NestJS app — use `nodeserver` as the directory name
npx @nestjs/cli@latest new nodeserver --package-manager npm --skip-git
cd nodeserver

# 2. Install extra deps
npm install @nestjs/mongoose mongoose @nestjs/config class-validator class-transformer
```

Then replace the default `main.ts`, `app.module.ts`, `app.controller.ts`, `app.service.ts` and add the modules described below.

---

## 3. Folder Structure

```
nodeserver/
├── dist/                           # compiled JS (gitignored)
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   └── login.dto.ts        # class-validator decorated
│   │   ├── auth.controller.ts      # POST /auth/login
│   │   ├── auth.service.ts         # static-creds check, returns {token, user}
│   │   └── auth.module.ts
│   ├── dashboard/
│   │   ├── dto/
│   │   │   └── dashboard-summary.dto.ts
│   │   ├── dashboard.controller.ts # GET /dashboard, /dashboard/stats, /dashboard/activity, /dashboard/quick-links
│   │   ├── dashboard.service.ts
│   │   └── dashboard.module.ts
│   ├── app.controller.ts           # GET /health
│   ├── app.controller.spec.ts
│   ├── app.module.ts               # imports ConfigModule + MongooseModule + feature modules
│   ├── app.service.ts
│   └── main.ts                     # bootstrap: CORS, global prefix /api, ValidationPipe
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .env                            # PORT, MONGODB_URI, STATIC_USERNAME, STATIC_PASSWORD, CORS_ORIGIN
├── .gitignore
├── .prettierrc                     # (default from `nest new`)
├── eslint.config.mjs               # (default from `nest new`)
├── nest-cli.json
├── package.json
├── README.md
├── tsconfig.build.json
├── tsconfig.json
└── SETUP.md                        # this file
```

---

## 4. Module Pattern

Every feature module follows the same shape:

```
src/<feature>/
├── dto/                            # one file per DTO (create, update, query)
├── entities/                       # mongoose schemas (when DB-backed)
├── <feature>.controller.ts         # HTTP layer, decorators only
├── <feature>.service.ts            # business logic + DB access
└── <feature>.module.ts             # wiring
```

### Responsibilities
- **Controller**: parse input (via DTOs), call service, return result. No business logic.
- **Service**: business logic, DB queries, external calls. Returns plain objects.
- **DTO**: validation rules with `class-validator` decorators (`@IsString`, `@IsEmail`, etc.).
- **Module**: declares `imports`, `controllers`, `providers`, `exports`.

---

## 5. Bootstrap Conventions (`src/main.ts`)

- `app.setGlobalPrefix(API_PREFIX)` — every route lives under `/api`
- `app.enableCors({ origin: CORS_ORIGIN.split(','), credentials: true })`
- `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))`
- Reads everything from `ConfigService` — never `process.env` directly outside this file

---

## 6. Database Connection

`AppModule` imports MongoDB async so the URI comes from config:

```ts
MongooseModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/combo'),
  }),
}),
```

Per-feature schemas register inside their own module via `MongooseModule.forFeature([...])`.

---

## 7. Environment Variables (`.env`)

```bash
NODE_ENV=development
PORT=3000
API_PREFIX=api
CORS_ORIGIN=http://localhost:5174

# MongoDB (local, no auth)
MONGODB_URI=mongodb://localhost:27017/combo

# Static login credentials
STATIC_USERNAME=admin
STATIC_PASSWORD=admin@123
```

- **`CORS_ORIGIN`** is comma-separated for multiple allowed origins
- **Static creds** are read by `AuthService` — replace with real auth (JWT + bcrypt) before production

---

## 8. Routes Provided by Default

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Body: `{ username, password }` → returns `{ token, user }` (401 on bad creds) |
| GET | `/api/dashboard` | `{ title: 'Welcome', name: 'Patternlab' }` |
| GET | `/api/dashboard/stats` | Array of stat cards |
| GET | `/api/dashboard/activity` | Array of activity items |
| GET | `/api/dashboard/quick-links` | Array of quick-link buttons |

The dashboard endpoints currently return static data from the service — swap to Mongo when a schema is added.

---

## 9. Adding a New Module

```bash
nest generate module    <name>
nest generate controller <name>
nest generate service   <name>
# or in one shot:
nest generate resource  <name>
```

Then:
1. Create `dto/` files and decorate with `class-validator`
2. (If DB-backed) Create `entities/<name>.schema.ts` and register in the module via `MongooseModule.forFeature([{ name, schema }])`
3. Inject the model into the service with `@InjectModel(Name.name)`
4. Import the module in `app.module.ts`

---

## 10. Scripts (`package.json`)

```json
{
  "scripts": {
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

---

## 11. Quick Start

```bash
# 1. Ensure local MongoDB is running on 27017
# 2. Start the server in watch mode
cd nodeserver
npm install
npm run start:dev
```

You should see in the console:
```
Mapped {/api/health, GET}
Mapped {/api/auth/login, POST}
Mapped {/api/dashboard, GET}
Mapped {/api/dashboard/stats, GET}
Mapped {/api/dashboard/activity, GET}
Mapped {/api/dashboard/quick-links, GET}
🚀 Server running at http://localhost:3000/api
```

---

## 12. Pairing with the Client

This server is designed to pair with the `Client/` Vite app:
- Vite proxies `/api/*` from `localhost:5174` → `localhost:3000`
- `CORS_ORIGIN` must include `http://localhost:5174`
- Auth flow: client POSTs to `/api/auth/login` with the static creds, receives `{ token, user }`, and stores them in its Zustand auth store. axios automatically attaches `Authorization: Bearer <token>` to every subsequent request.
