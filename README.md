# 🧠 Task API

Secure Multi-Tenant Task Management REST API

Production-grade backend built with **Node.js, Express, PostgreSQL, and Prisma**.

Implements stateless JWT authentication, role-based access control (RBAC), and strict tenant isolation to ensure secure, user-scoped data access.

Deployed on Fly.io with live OpenAPI documentation via Swagger.

---

# 🚀 Live Deployment

**Base URL**  
https://task-api-astro-tux-2026.fly.dev/

**Health Check**  
https://task-api-astro-tux-2026.fly.dev/health

**Swagger Documentation**  
https://task-api-astro-tux-2026.fly.dev/docs/

---

# 🛠 Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT (JSON Web Tokens)
- Zod (schema validation)
- Swagger (OpenAPI)
- Docker
- Fly.io (Cloud Deployment)

---

# 🔐 Core Capabilities

- Stateless JWT authentication (register / login)
- Role-Based Access Control (RBAC)
- Strict multi-tenant data isolation
- Full CRUD operations for tasks
- Centralized error handling middleware
- Request validation via Zod schemas
- Secure CORS configuration
- Health monitoring endpoint
- Interactive API documentation (Swagger UI)

All task routes require a valid `Authorization: Bearer <token>` header.

---

# 📦 API Surface

## Authentication

```
POST   /auth/register
POST   /auth/login
```

## Tasks

```
GET    /tasks
POST   /tasks
GET    /tasks/:id
PUT    /tasks/:id
DELETE /tasks/:id
```

---

# 🏗 Architecture & Design

## Project Structure

```
src/
 ├── routes/
 ├── controllers/
 ├── middleware/
 ├── services/
 ├── prisma/
 └── app.js
```

## Design Principles

- Modular route/controller separation
- Middleware-driven authentication pipeline
- Service-layer abstraction
- Centralized error handling
- Environment-based configuration
- Prisma schema–driven relational modeling

Designed for maintainability, security, and scalability.

---

# 🔒 Security Model

## Authentication

- Password hashing via bcrypt
- Signed JWT tokens with configurable secret
- Stateless authentication for horizontal scalability

## Authorization & Tenant Isolation

- Authorization middleware protects all task routes
- All database queries scoped by `userId`
- Prevents horizontal privilege escalation
- No task can be accessed unless it belongs to the authenticated user

## Validation Layer

- Zod validates request bodies before controller execution
- Invalid payloads rejected before reaching service layer
- Structured JSON error responses

---

# ⚙️ Local Development

Clone repository:

```
git clone https://github.com/KaylaArnold/task-api.git
cd task-api
```

Install dependencies:

```
npm install
```

Create `.env` file:

```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
PORT=5000
```

Run database migrations:

```
npx prisma migrate dev
```

Start development server:

```
npm run dev
```

---

# 🐳 Docker Support

```
docker build -t task-api .
docker run -p 5000:5000 task-api
```

---

# 📈 Engineering Focus

This project demonstrates:

- Backend system design fundamentals
- Secure authentication and authorization flows
- Multi-tenant data protection strategies
- Clean Express architecture
- ORM-based relational modeling with Prisma
- Cloud-native deployment practices

---

# 🚀 Future Improvements

- Refresh token rotation strategy
- Rate limiting for authentication endpoints
- Integration testing (Supertest)
- CI/CD pipeline
- Pagination & filtering for task queries
- Structured logging (Pino / Winston)

---

# 👩🏽‍💻 Author

Kayla Arnold  
Backend-Focused Software Engineer  
May 2026 Graduate  

LinkedIn:  
https://www.linkedin.com/in/kaylaarnold/
