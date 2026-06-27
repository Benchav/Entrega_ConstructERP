# ConstructERP - Enterprise Resource Planning System

This document provides a comprehensive technical overview of the ConstructERP ecosystem. ConstructERP is a robust, modular, and scalable Enterprise Resource Planning system tailored for the construction industry, featuring a decoupled client-server architecture.

## Development Team

The conceptualization, architecture, and implementation of this ecosystem were executed by:

1. Joshua Benjamin Chavez Lau
2. Monica Guitierrez Alvarez
3. Diego Israel Baltodano Sanchez
4. Diego Santiago Nuñez Rivera

--- 

## System Architecture

ConstructERP utilizes a decoupled client-server architecture, ensuring a clear separation of concerns between data management and user interface presentation. The ecosystem is composed of two primary subsystems communicating via a RESTful API.

### 1. Backend Service (RESTful API)

The backend service is engineered for high availability, security, and maintainability, handling all business logic, data validation, and persistence.

*   **Runtime Environment:** Node.js.
*   **Web Framework:** Express.js.
*   **Database:** Firebase Firestore (NoSQL cloud database, providing real-time synchronization and high scalability).
*   **Service Layer Architecture:** Implements a `GenericService` pattern to abstract and standardize CRUD operations across 13+ distinct domain entities (Projects, Users, Inventory, Finances, etc.), maximizing code reuse and minimizing redundancy.
*   **API Documentation:** Integrated with Swagger (swagger-ui-express, swagger-jsdoc) for standardized API contract visualization and testing.
*   **Quality Assurance:** Comprehensive automated testing suite implemented utilizing Jest and Supertest, ensuring API reliability and preventing regressions prior to deployment.

### 2. Frontend Application (Client Interface)

The client application is a dynamic Single Page Application (SPA) designed to deliver a highly responsive and state-driven user experience.

*   **Core Technologies:** React 18, TypeScript, orchestrated and bundled via Vite for optimized build times and Hot Module Replacement (HMR).
*   **Styling and UI Components:** Utilizes Tailwind CSS for utility-first styling, integrated with Shadcn/ui (Radix UI primitives) to construct an accessible, consistent, and highly customizable design system.
*   **State Management and Data Fetching:** Employs `@tanstack/react-query` for efficient server state synchronization, caching, and background data fetching. Global application state (such as authentication context) is managed natively via React Context API.
*   **Form Handling:** Implemented using `react-hook-form` coupled with `@hookform/resolvers` for performant, uncontrolled form validation.
*   **Routing:** Client-side routing managed by `react-router-dom`.

---

## Data Validation Strategy

ConstructERP enforces a strict, multi-layered data validation schema to guarantee data integrity and prevent malformed requests from penetrating the business logic layer.

*   **Schema Definition with Zod:** Both the frontend and backend utilize **Zod** for schema declaration and validation. This allows for strict typing and shared validation logic.
*   **Middleware Interception:** Before any HTTP request reaches the designated controller, it is intercepted by a validation middleware. 
*   **Fail-Fast Mechanism:** If the incoming payload fails to adhere to the predefined Zod schema (e.g., missing required fields, invalid data types, boundary constraints violated), the API immediately aborts the request, returning a standard HTTP 400 Bad Request response with detailed error traces, thereby protecting the database layer from unnecessary load and potential corruption.

---

## Security Protocols and Authentication

Security is a foundational pillar of the ConstructERP architecture. Multiple defensive layers are implemented to mitigate common attack vectors and ensure data confidentiality.

*   **Stateless Authentication (JWT):** Authentication is managed via JSON Web Tokens (JWT). Crucially, these tokens are not stored in the browser's `localStorage` or `sessionStorage`.
*   **HttpOnly Cookies:** JWTs are securely transmitted and stored using HTTP cookies flagged with `HttpOnly` and `SameSite: strict` attributes. This approach effectively neutralizes Cross-Site Scripting (XSS) attacks aimed at token theft, and mitigates Cross-Site Request Forgery (CSRF).
*   **Role-Based Access Control (RBAC):** A robust authorization middleware enforces RBAC, supporting 14 distinct hierarchical roles (e.g., CEO, General Manager, Site Manager, HR, Warehouse Manager). Every protected API endpoint rigorously verifies the requester's role against the required permissions before granting execution access.
*   **Audit Logging:** All data mutations (Create, Update, Delete operations) automatically capture the identity of the executing user (`createdBy`, `updatedBy`) and record an immutable entry in a dedicated audit collection within Firestore, ensuring complete traceability.
*   **HTTP Header Security & Rate Limiting:** The backend utilizes the `helmet` package to configure secure HTTP response headers. Furthermore, `express-rate-limit` is deployed to mitigate Denial of Service (DoS) and brute-force attacks by restricting the number of requests a single IP can make within a specified timeframe.
*   **Mass Assignment Protection:** The validation layer explicitly strips unrecognized properties from incoming payloads, preventing malicious users from injecting unauthorized fields (e.g., elevating their own role).

---

## Infrastructure and Containerization

The entire ecosystem is fully containerized using **Docker** and orchestrated via **Docker Compose**, ensuring absolute consistency across development, staging, and production environments.

### Container Architecture

The deployment consists of two primary containers operating within an isolated virtual network (`constructerp-net`):

1.  **Frontend Container (`constructerp-frontend`):**
    *   **Base Image:** `nginx:stable-alpine` (Ultra-lightweight footprint).
    *   **Role:** Acts as a high-performance static web server and reverse proxy, delivering the optimized production build generated by Vite.
    *   **Exposure:** Exposes the application interface on port `80` (HTTP).

2.  **Backend Container (`constructerp-backend`):**
    *   **Base Image:** `node:20-alpine`.
    *   **Role:** Executes the Node.js/Express API, handling secure communication with Firebase services and serving as the data provider for the frontend.
    *   **Exposure:** Exposes port `3000` for API access and local debugging.

### Infrastructure Advantages

*   **Environment Isolation:** The host operating system requires zero dependencies (no Node.js, Nginx, or libraries need to be installed locally). The entire runtime environment is encapsulated within Docker.
*   **Reproducibility:** Guarantees that the application will behave identically regardless of the underlying host machine, eliminating the "works on my machine" discrepancy.
*   **Streamlined Orchestration:** The multi-container setup, network bridging, and volume mapping are entirely automated through declarative configuration.

---

## Local Execution Instructions

To deploy the ConstructERP ecosystem locally, ensure that Docker and Docker Compose are installed on your host machine.

### Automated Execution (Windows)

For Windows environments, two batch scripts are provided at the root directory for convenience:

*   `EjecutarProyecto.bat`: Initializes and starts the containerized environment in detached mode.
*   `DetenerProyecto.bat`: Stops and removes the active containers, networks, and associated volumes.

### Manual Execution (CLI)

Alternatively, utilize standard Docker Compose commands from the project root directory:

**To build and start the environment:**
```bash
docker compose up -d --build
```
This command will build the frontend and backend images, provision the network, and start the containers in the background. The application will be accessible at `http://localhost`.

**To stop and dismantle the environment:**
```bash
docker compose down
```

**To view real-time logs:**
```bash
docker compose logs -f
```
