🧠 Task API

Secure Multi-Tenant Task Management REST API

Production-grade REST API built with Node.js, Express, PostgreSQL, and Prisma.

Implements stateless JWT authentication, role-based access control (RBAC), and strict tenant isolation to ensure secure, user-scoped data access.

Deployed on Fly.io with live OpenAPI documentation via Swagger.

🚀 Live Deployment

Base URL
https://task-api-astro-tux-2026.fly.dev/

Health Check
https://task-api-astro-tux-2026.fly.dev/health

Swagger API Documentation
https://task-api-astro-tux-2026.fly.dev/docs/

🛠 Tech Stack

Node.js

Express.js

PostgreSQL

Prisma ORM

JWT (JSON Web Tokens)

Zod (schema validation)

Swagger (OpenAPI)

Docker

Fly.io (cloud deployment)

🔐 Core Capabilities

Stateless JWT authentication (register / login)

Role-Based Access Control (RBAC)

Strict multi-tenant data isolation

Full CRUD operations for tasks

Centralized error handling middleware

Request validation via Zod schemas

Secure CORS configuration

Health monitoring endpoint

Interactive API documentation (Swagger UI)

All task routes require a valid Bearer token.

📦 API Surface
Authentication
POST   /auth/register
POST   /auth/login

Tasks
GET    /tasks
POST   /tasks
GET    /tasks/:id
PUT    /tasks/:id
DELETE /tasks/:id

🏗 Architecture & Design Principles

Modular route/controller separation

Middleware-driven authentication pipeline

Service-layer abstraction

Centralized error handling

Environment-based configuration

Prisma schema–driven relational modeling

src/
 ├── routes/
 ├── controllers/
 ├── middleware/
 ├── services/
 ├── prisma/
 └── app.js


Designed for maintainability, security, and scalability.

⚙️ Local Development
Clone Repository
git clone https://github.com/KaylaArnold/task-api.git
cd task-api

Install Dependencies
npm install

Configure Environment Variables

Create a .env file:

DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
PORT=5000

Run Database Migrations
npx prisma migrate dev

Start Development Server
npm run dev

🐳 Docker Support
docker build -t task-api .
docker run -p 5000:5000 task-api

🔒 Security Design

Password hashing via bcrypt

Signed JWT tokens with configurable secret

Authorization middleware protects all task routes

Input validation prior to database interaction

User-scoped database queries prevent horizontal privilege escalation

🧠 Engineering Decisions

Stateless Authentication

JWT was chosen over session-based auth to ensure horizontal scalability and eliminate server-side session storage.

Tenant Isolation Strategy

All database queries are scoped by userId to prevent horizontal privilege escalation. No task can be accessed unless it belongs to the authenticated user.

Validation Layer

Zod is used at the middleware level to validate request bodies before controller execution, preventing invalid data from reaching the service layer.

Modular Architecture

Routes, controllers, middleware, and services are separated to enforce single-responsibility principles and improve long-term maintainability.

📈 Engineering Focus

This project demonstrates:

Backend system design fundamentals

Secure authentication and authorization flows

Multi-tenant data protection strategies

Clean Express architecture

ORM-based relational modeling with Prisma

Cloud-native deployment practices

🚀 Future Improvements

Refresh token rotation strategy

Rate limiting for authentication endpoints

Integration testing with Supertest

CI/CD pipeline for automated deployment

Pagination & filtering for task queries

Structured logging (Winston / Pino)

👩🏽‍💻 Author

Kayla Arnold
Backend-Focused Software Engineer
May 2026 Graduate
https://www.linkedin.com/in/kaylaarnold/
