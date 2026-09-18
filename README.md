# Full-Stack JWT Authentication System

A complete authentication system with a **Laravel 11** RESTful API backend (JWT-based
sessions via [`php-open-source-saver/jwt-auth`](https://github.com/PHP-Open-Source-Saver/jwt-auth))
and a **React 19 + Vite** frontend.

```
auth-system/
├── backend/   Laravel API (registration, login, JWT-protected /user endpoint)
└── frontend/  React SPA (registration/login forms, protected dashboard)
```

## Features

- **Registration** with server-side validation (name, email, unique email, min-length +
  confirmed password) and client-side validation with inline error messages.
- **Login** that returns a signed JWT access token.
- **Password hashing** with bcrypt (Laravel's `hashed` Eloquent cast, 12 rounds).
- **Protected `/api/user` endpoint** that verifies the JWT and returns the current user.
- **React dashboard** — a protected route, only reachable when a valid token is stored,
  showing the logged-in user's details.
- **Logout** that invalidates the token server-side and clears it from the browser.

## Tech stack

| Layer    | Technology |
|----------|------------|
| Backend  | Laravel 11, PHP 8.2+, `php-open-source-saver/jwt-auth` ^2.8 |
| Frontend | React 19, Vite, React Router, Axios |
| Database | MySQL (default) — SQLite also works with a one-line `.env` change |

## Prerequisites

Install these locally before you start (none of them are required to read the code,
only to run it):

- PHP >= 8.2 with the usual extensions (`pdo_mysql`, `mbstring`, `openssl`, `bcmath`, `ctype`, `fileinfo`)
- [Composer](https://getcomposer.org/)
- MySQL 8+ (or any Laravel-supported DB — see "Using SQLite instead" below)
- Node.js >= 18 and npm

---

## 1. Backend setup (Laravel API)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Open `.env` and set your database credentials:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_jwt_auth
DB_USERNAME=root
DB_PASSWORD=
```

Create the database (e.g. `mysql -u root -e "CREATE DATABASE laravel_jwt_auth"`), then
generate the JWT signing secret and run the migrations:

```bash
php artisan jwt:secret
php artisan migrate
```

Also set `FRONTEND_URL` in `.env` (defaults to `http://localhost:5173`) — it's used by
`config/cors.php` to allow the React app to call the API.

Start the API:

```bash
php artisan serve
```

The API is now running at `http://localhost:8000`.

### Using SQLite instead of MySQL

```bash
touch database/database.sqlite
```

and in `.env` set:

```
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/backend/database/database.sqlite
```

Then run `php artisan migrate` as above.

### Backend API endpoints

| Method | Endpoint             | Auth required | Description                              |
|--------|-----------------------|:-------------:|-------------------------------------------|
| POST   | `/api/auth/register`  | No            | Create a user, returns user + JWT         |
| POST   | `/api/auth/login`     | No            | Authenticate, returns user + JWT          |
| GET    | `/api/user`           | Yes (Bearer)  | Returns the authenticated user            |
| GET    | `/api/auth/user`      | Yes (Bearer)  | Same as above (alias)                     |
| POST   | `/api/auth/logout`    | Yes (Bearer)  | Invalidates the current token             |
| POST   | `/api/auth/refresh`   | Yes (Bearer)  | Issues a new token from a valid one       |

**Register**

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Accept: application/json" -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"password123","password_confirmation":"password123"}'
```

**Login**

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Accept: application/json" -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"password123"}'
```

Response (register/login):

```json
{
  "message": "Login successful.",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "...": "..." },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Call the protected endpoint**

```bash
curl http://localhost:8000/api/user \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <access_token>"
```

---

## 2. Frontend setup (React)

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The `.env` only needs one value, already set to match the Laravel dev server:

```
VITE_API_URL=http://localhost:8000/api
```

Open `http://localhost:5173`. You'll land on the login screen; use **Register** to
create an account, which logs you straight into the **Dashboard**. The JWT is stored in
`localStorage` and attached as a `Bearer` token to every API request by an Axios
interceptor (`src/api/axios.js`). **Logout** calls `POST /api/auth/logout` to invalidate
the token on the server and clears it from the browser, then redirects to `/login`.

### Frontend structure

```
frontend/src/
├── api/axios.js           Axios instance + JWT request/response interceptors
├── context/AuthContext.jsx Auth state (user, login/register/logout) via React context
├── components/
│   ├── ProtectedRoute.jsx  Redirects to /login if not authenticated
│   └── GuestRoute.jsx      Redirects to /dashboard if already authenticated
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    └── Dashboard.jsx
```

---

## Running both together

1. Terminal 1: `cd backend && php artisan serve` (http://localhost:8000)
2. Terminal 2: `cd frontend && npm run dev` (http://localhost:5173)
3. Visit `http://localhost:5173`, register a new account, and you'll be redirected to
   the protected dashboard showing your name, email, ID, and join date.

## Security notes

- Passwords are hashed with bcrypt before being stored (never stored or logged in plain text).
- JWTs are short-lived (`JWT_TTL=60` minutes by default) with a refresh window
  (`JWT_REFRESH_TTL`); adjust both in `backend/.env`.
- `JWT_SECRET` and `APP_KEY` are generated locally by `php artisan jwt:secret` /
  `php artisan key:generate` and are **not** committed to the repo — copy `.env.example`
  to `.env` and generate your own for every environment.
- CORS (`backend/config/cors.php`) only allows the origin in `FRONTEND_URL`.

## Running tests / checks

```bash
# Frontend build & lint
cd frontend && npm run build && npm run lint
```

The backend has no PHPUnit suite in this starter — `php artisan route:list` is a quick
sanity check that all routes registered correctly after `composer install`.
