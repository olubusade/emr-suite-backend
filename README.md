
---

# EMR-Suite Backend Demo

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat-square) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square) ![Jest](https://img.shields.io/badge/Testing-Jest-orange?style=flat-square) ![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square)

**Electronic Medical Records (EMR) Suite – Backend Demo**

> ⚠️ **Note for recruiters:** This repository is a **demo** to showcase the backend sophistication of the **wiCare EMR** system. It is a production-grade simulation in a controlled environment to protect IP. The frontend development is in progress.

---

## 🌟 Key Features

* **User & Role Management** – CRUD for users, roles, and permissions.
* **Authentication & Security** – JWT-based access & refresh tokens, password hashing, token revocation.
* **RBAC Enforcement** – Dynamic permissions and centralized middleware.
* **Audit Logging** – Tracks all sensitive actions (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`).
* **Database & ORM** – PostgreSQL + Sequelize with relations, migrations, and seeds.
* **Testing** – Full integration and RBAC tests using Jest + Supertest.
* **Docker Ready** – Backend and DB via Docker Compose.
* **Metrics Ready** – Prometheus integration supported.

---

## 🏗️ Project Structure

```
emr-suite-backend/
├─ src/
│  ├─ controllers/          # Request handlers
│  ├─ models/               # Sequelize models
│  ├─ services/             # Business logic
│  ├─ middlewares/          # Auth, RBAC, audit
│  ├─ routes/               # API endpoints
│  ├─ validation/           # Input validation schemas
│  ├─ seed/                 # Seed scripts for roles, users, permissions
│  │   └─ seed.js
│  ├─ test/                 # Jest + Supertest integration tests
│  ├─ app.js                # Express app
│  └─ server.js             # App bootstrap
├─ docker/                  # Dockerfiles & docker-compose.yml
├─ .env                     # Environment variables
├─ package.json
└─ README.md
```

---

## 🧭 Conventions & Best Practices

* **camelCase** for all API response keys – ensures consistent frontend consumption.
* **RBAC Enforcement** – Permissions enforced at middleware level for all protected routes.
* **Audit Logging** – Every sensitive action logs user, timestamp, action type, and entity.
* **JWT Handling** – Access token short-lived, refresh token revocable, SHA-256 hashed in DB.
* **Error Handling** – Standardized errors with statusCode and message, centralized error middleware.
* **Database Relations** – Sequelize models reflect clear relations (User ↔ Role ↔ Permission).
* **Testing** – All critical flows including authentication, RBAC, and business logic are tested.

---

## 🖼️ Architecture Diagram

```mermaid
flowchart TD
    A[API Request] --> B[Middleware Layer]
    B -->|Auth & JWT Validation| C[Controllers]
    B -->|RBAC Enforcement| C
    B -->|Audit Logging| C
    C --> D[Services Layer]
    D --> E[Sequelize ORM]
    E --> F[PostgreSQL Database]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
    style D fill:#ffb,stroke:#333,stroke-width:2px
    style E fill:#fbf,stroke:#333,stroke-width:2px
    style F fill:#fbb,stroke:#333,stroke-width:2px
```

---
## ⚙️ Conventions & Best Practices

* camelCase for all API response keys to match frontend expectations

* RBAC Enforcement via middleware in all protected routes

* Audit Logging for create, update, delete, login, logout actions

* JWT Handling with access & refresh tokens; revocation supported

* Error Handling consistent via ApiError and structured responses

* Sequelize ORM: snake_case in DB, camelCase in API responses

* Testing: Jest + Supertest integration tests cover all critical flows

---
## 🚀 Installation & Local Development

### Prerequisites

* Node.js >= 20
* PostgreSQL >= 15
* npm >= 9

### Steps

```bash
git clone https://github.com/olubusade/emr-suite-backend.git
cd emr-suite-backend
npm install
```

Create `.env` :

```env
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=emr_suite
JWT_SECRET=supersecret
JWT_REFRESH_SECRET=superrefreshsecret
```

Seed initial roles, users, and permissions:

```bash
npm run seed
```

Run development server:

```bash
npm run dev
```

> Server runs at `http://localhost:3000`.

---

## 🐳 Docker Setup (Optional)

```bash
cd docker
docker compose up --build
```

* Backend: `http://localhost:3000`
* PostgreSQL: `localhost:5432`

Stop containers:

```bash
docker compose down
```

---

## 🔐 Authentication & RBAC

* **Login:** `POST /api/auth/login` → Returns access & refresh tokens
* **Refresh token:** `POST /api/auth/refresh`
* **Change password:** `POST /api/auth/change-password`

Roles: `super_admin`, `admin`, `doctor`, `nurse`, `reception`, `billing`, `lab`, `pharmacy`.

Middleware enforces permissions dynamically for protected endpoints.

---

## 🧪 Testing

Run all tests:

```bash
npm run test
```

RBAC-specific tests:

```bash
npm run test:rbac
```

Watch mode:

```bash
npm run test:watch
```

---

## 💾 Database

* PostgreSQL with Sequelize ORM
* Tables: `Users`, `Roles`, `Permissions`, `RefreshTokens`, `Patients`, `Appointments`, `Bills`, `AuditLogs`, `Metrics`

Seed scripts are located at `src/seed/seed.js`:

```javascript
import { Role, Permission, User } from '../models/index.js';
import { hash } from '../utils/passwords.js';

async function seed() {
  const roles = await Role.bulkCreate([
    { name: 'super_admin' },
    { name: 'admin' },
    { name: 'doctor' },
    { name: 'nurse' },
  ]);

  const perms = await Permission.bulkCreate([
    { name: 'CREATE_PATIENT' },
    { name: 'UPDATE_PATIENT' },
    { name: 'DELETE_PATIENT' },
    { name: 'VIEW_PATIENT' },
  ]);

  const passwordHash = await hash('admin@123');
  await User.create({ email: 'admin@busade-emr-demo.com', name: 'Admin User', passwordHash });
  console.log('Database seeded successfully.');
}

seed();
```

---

## ⚙️ NPM Scripts

| Script               | Description                            |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Start backend in development mode      |
| `npm start`          | Start backend in production mode       |
| `npm run seed`       | Seed initial roles, users, permissions |
| `npm run test`       | Run all tests                          |
| `npm run test:watch` | Watch mode for tests                   |
| `npm run test:rbac`  | Run RBAC module-specific tests         |

---

## 🌐 API Documentation

* **Swagger UI:** `/api-docs` – Interactive exploration of all endpoints.

---

## ⚡ CI/CD (GitHub Actions)

Example `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: emr_suite
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run seed
      - run: npm test
```

> This workflow installs dependencies, seeds the database, and runs tests on every push or PR to `main`.

---

📜 License

MIT License © 2025 Busade Adedayo
