Absolutely! I’ve regenerated the **README.md** with your requested updates. It now includes **badges at the top**, a clear explanation that this is a demo to protect IP, and emphasizes that the frontend will come later. Here’s the full, polished version:

---

# EMR-Suite Backend Demo

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat-square) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square) ![Jest](https://img.shields.io/badge/Testing-Jest-orange?style=flat-square) ![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square)

**Electronic Medical Records (EMR) Suite – Backend Demo**

> ⚠️ **Note for recruiters:** To protect the intellectual property of the company, this repository is a **demo** showcasing the backend sophistication of the **wiCare EMR** system in a controlled environment. It is a simulation of production-grade features available to clients. The frontend will be developed and documented later to complete the full EMR experience.

This project demonstrates a production-ready backend built with **Node.js**, **Express**, **Sequelize ORM**, and **PostgreSQL**, incorporating **JWT-based authentication**, **role-based access control (RBAC)**, **audit logging**, and **automated testing**. Docker support is included for seamless development and deployment.

---

## 🌟 Key Features

* **User & Role Management**

  * Full CRUD for users
  * Role-based and direct permissions
  * Admin and non-admin segregation

* **Authentication & Security**

  * Login, logout, and token refresh flows
  * Password hashing with bcrypt
  * JWT access & refresh tokens
  * Audit logs for all sensitive actions

* **RBAC & Permissions**

  * Centralized middleware for permissions enforcement
  * Dynamic role and permission assignment
  * Admin-only routes for sensitive operations

* **Database & ORM**

  * PostgreSQL database
  * Sequelize ORM with models, migrations, and relationships

* **Testing & Quality Assurance**

  * Integration tests using Jest + Supertest
  * Coverage includes authentication, users, patients, appointments, billing, audit, and metrics

* **Docker Ready**

  * Run backend and PostgreSQL via Docker Compose
  * Works in dev and cloud environments

* **Audit & Metrics**

  * Tracks user actions (LOGIN, LOGOUT, CREATE, UPDATE, DELETE)
  * Metrics ready for Prometheus integration

---

## 📁 Project Structure

```
emr-suite-backend/
├─ src/
│  ├─ controllers/          # Request handlers
│  ├─ models/               # Sequelize models
│  ├─ services/             # Business logic
│  ├─ middlewares/          # Auth, RBAC, audit
│  ├─ routes/               # API endpoints
│  ├─ validation/           # Input schemas
│  ├─ test/                 # Jest + Supertest integration tests
│  ├─ app.js                # Express app
│  └─ server.js             # App bootstrap
├─ docker/                  # Dockerfiles & Compose
├─ .env                     # Environment variables
├─ package.json
├─ README.md
└─ ...
```

---

## 🚀 Installation & Local Development

### Prerequisites

* Node.js >= 20
* PostgreSQL >= 15
* npm >= 9

### Steps

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/emr-suite-backend.git
cd emr-suite-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file (based on `.env.example`):

```env
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=emr_suite
JWT_SECRET=supersecret
JWT_REFRESH_SECRET=superrefreshsecret
```

4. Seed the database:

```bash
npm run seed
```

5. Run the backend:

```bash
npm run dev
```

> Server will run at `http://localhost:3000`.

---

## 🐳 Docker Setup (Optional)

Run the backend with Docker and PostgreSQL for isolated dev or cloud deployment.

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

> Docker allows running the backend **with or without Docker**, making deployment flexible.

---

## 🔐 Authentication & RBAC

* **Login:** `POST /api/auth/login` → Returns access & refresh tokens
* **Refresh token:** `POST /api/auth/refresh`
* **Change password:** `POST /api/auth/change-password`

Roles: `super_admin`, `admin`, `doctor`, `nurse`, `reception`, `billing`, `lab`, `pharmacy`.
Permissions are enforced dynamically with middleware for all protected routes.

---

## 🧪 Testing

All modules are fully tested using **Jest** + **Supertest**.

### Run tests

```bash
npm run test
```

### Run RBAC-only tests

```bash
npm run test:rbac
```

### Watch mode

```bash
npm run test:watch
```

> Tests cover authentication, users, patients, appointments, billing, metrics, and audit logs. Full system reliability is validated.

---

## 💾 Database

* PostgreSQL with Sequelize ORM
* Tables: Users, Roles, Permissions, RefreshTokens, Patients, Appointments, Bills, AuditLogs, Metrics

---

## ⚙️ NPM Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start backend in development mode    |
| `npm start`          | Start backend in production mode     |
| `npm run seed`       | Seed initial roles, users, and perms |
| `npm run test`       | Run all tests                        |
| `npm run test:watch` | Watch mode for tests                 |
| `npm run test:rbac`  | Run RBAC module-specific tests       |

---

## 🌐 API Documentation

* **Swagger UI:** `/api-docs`
* Interactive API exploration for authentication, users, patients, appointments, billing, and metrics

---
