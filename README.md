# ========================================================================
#                             SADA - BACKEND
# ========================================================================

Welcome to the production backend codebase for the SADA platform.
This repository contains the REST API, business logic, and infrastructure
configuration required to power the mobile applications and web services.

For a high-level overview of the folder structure, architecture, and how
to get started, please refer to the comprehensive documentation at:

🔗 [https://sada-staging.kantatech.io/docs](https://sada-staging.kantatech.io/docs)

## 📚 Documentation & Resources
*   **API Documentation (Swagger/OpenAPI):**
    [https://sada-staging.kantatech.io/docs](https://sada-staging.kantatech.io/docs)
*   **Project Overview & Architecture:**
    Read the `README_DOCS.md` file inside the `src/` directory for detailed
    architecture diagrams, database schemas, and explanations of the
    business logic.

## 🚀 Tech Stack
*   **Language:** TypeScript
*   **Framework:** Express.js
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Authentication:** JWT (JSON Web Tokens)
*   **Payment Processing:** Stripe
*   **Admin:** TypeScript + Vite

## 📁 Key Directories
*   `src/controllers/`: Request handlers and routing logic.
*   `src/services/`: Business logic and core services.
*   `src/models/`: Prisma database models.
*   `src/middleware/`: Authentication, authorization, and validation middleware.
*   `src/routes/`: API route definitions.
*   `src/admin/`: Administration panel code.

## 📦 Installation
```bash
# Install dependencies
yarn install

# Generate Prisma client
npx prisma generate

# Start the server
npm run dev
```

## 🔐 Environment
Ensure the following environment variables are set in `.env`:
```bash
DATABASE_URL=your_db_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
```

For detailed configuration instructions, please consult the documentation
above.