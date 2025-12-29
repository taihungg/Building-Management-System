## Blue Moon Management – Apartment/Condo Management System

Monorepo with a Spring Boot backend (Java) and a React + Vite frontend for managing residents, apartments, announcements, issues, accounting (invoices, extra fees, voluntary contributions), usage imports, and Excel exports.

### Table of Contents
- Overview
- Architecture & Repository Structure
- Tech Stack
- Key Features
- System Requirements
- Environment Configuration (Database, port, CORS)
- Run Locally (Dev)
- Build & Deploy
- API Documentation (OpenAPI/Swagger)
- Full API Endpoints
- Security Notes
- License

## Overview
- Backend: Spring Boot 3 (Java 21), RESTful APIs, PostgreSQL, JPA/Hibernate, Validation, Excel export.
- Frontend: React 18 + Vite + TypeScript, React Router, Radix UI, Recharts.
- Goal: Operate a condo/apartment management system across multiple roles (resident/authority/accounting/management) with announcements, fee charging/billing, issue tracking, reporting, and more.

## Architecture & Repository Structure

High-level data flow:

```mermaid
flowchart TD
  subgraph Client [Client]
    A[Browser / React 18 + Vite]
  end

  subgraph Backend [Spring Boot 3 (Java 21)]
    B1[Controllers<br/>@RestController]
    B2[Services]
    B3[Repositories<br/>Spring Data JPA]
    B4[(PostgreSQL)]
    B5[Excel Export<br/>Apache POI]
  end

  A -->|HTTP JSON| B1
  B1 --> B2
  B2 --> B3
  B3 --> B4
  B2 -->|Export invoices| B5
  A -->|OpenAPI UI| C[Swagger UI /swagger-ui]
```

Repository layout:
```
.
├─ src/main/java/itep/software/bluemoon/        # Backend (Spring Boot)
│  ├─ config/                                    # Web/CORS configuration
│  ├─ controller/                                # REST controllers
│  ├─ entity/                                    # JPA entities
│  ├─ enumeration/                               # Common enums
│  ├─ model/DTO/                                 # Request/response DTOs
│  ├─ model/projection/                          # JPA projections for optimized queries
│  ├─ repository/                                # Spring Data JPA repositories
│  ├─ service/                                   # Business services
│  └─ util/                                      # Utilities (e.g., VND formatting)
├─ src/main/resources/
│  └─ application.properties                     # Spring config (DB, JPA, port, schema)
├─ front-end/                                    # React + Vite (TypeScript)
│  ├─ src/components/                            # UI components (dashboards, sidebars, etc.)
│  ├─ src/hooks/                                 # Custom hooks (e.g., realtime)
│  ├─ src/utils/                                 # FE utilities (announcements, bills, ...)
│  ├─ src/styles/                                # Global CSS
│  ├─ App.tsx / main.tsx                         # App entry points
│  ├─ index.html / index.css                     # Base HTML/CSS
│  ├─ package.json                               # FE deps and scripts
│  └─ vite.config.ts                             # Vite configuration (aliases, port 3000, ...)
├─ pom.xml                                       # Maven configuration
├─ mvnw, mvnw.cmd                                # Maven Wrapper
└─ LICENSE
```

## Tech Stack
- Backend
  - Spring Boot 3.5.7 (Parent)
  - Java 21
  - Spring Web (REST)
  - Spring Data JPA (Hibernate)
  - Bean Validation (spring-boot-starter-validation)
  - PostgreSQL JDBC Driver
  - Lombok
  - springdoc-openapi-starter-webmvc-ui (Swagger UI)
  - Apache POI (poi-ooxml) for Excel export
  - Devtools (hot reload for backend)
  - Asciidoctor Maven Plugin (doc generation capability)
- Database
  - PostgreSQL (default schema: `building`)
- Frontend
  - React 18, React DOM
  - TypeScript
  - Vite 6 (@vitejs/plugin-react-swc)
  - React Router v7
  - Radix UI
  - Recharts
  - React Hook Form
  - Lucide React (icons)
  - Utilities: clsx, class-variance-authority, etc.

## Key Features
- Manage residents, apartments, buildings
- Authentication (login/logout)
- Announcements (targeted distribution, read-tracking)
- Issue tracking (create/update status/categorization)
- Accounting and fee collection: invoices, extra fees, price tiers
- Voluntary contributions and campaign tracking
- Usage import from spreadsheets, Excel export
- Role-based dashboards (Resident/Authority/Accounting)

## System Requirements
- JDK 21
- Node.js ≥ 20, npm ≥ 10
- PostgreSQL ≥ 14 (local) or a managed service (e.g., Neon)

## Environment Configuration
Default backend configuration: `src/main/resources/application.properties`

Sample (current repo default connects to a managed Postgres and listens on 8081):
```
spring.datasource.url=jdbc:postgresql://.../neondb?sslmode=require&channel_binding=require
spring.datasource.username=...
spring.datasource.password=...
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.default_schema=building
server.port=8081
```

Avoid committing secrets. Prefer environment variables for local/prod:

PowerShell (Windows, current session):
```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/building_dtb"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="your_password"
$env:SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA="building"
$env:SERVER_PORT="8081"
```

Or create `application-local.properties` (do not commit) and run with a matching profile.

### CORS
Configured in `src/main/java/.../config/WebConfig.java` to allow:
- `http://localhost:*`
- `https://*.vercel.app`
- `https://untoasted-jean-unsympathisingly.ngrok-free.dev/`

Adjust as needed for your FE origin(s).

### Database
If using local Postgres, create DB and schema:
```sql
CREATE DATABASE building_dtb;
CREATE SCHEMA IF NOT EXISTS building;
```
`spring.jpa.hibernate.ddl-auto=update` will manage tables from entities (no migration tool in this repo).

## Run Locally (Dev)

### Backend (Spring Boot)
From the repository root:
```powershell
.\mvnw clean install
.\mvnw spring-boot:run
```
Server runs at `http://localhost:8081`.

Run from packaged JAR:
```powershell
.\mvnw package
java -jar target/bluemoon-0.0.1-SNAPSHOT.jar
```

### Frontend (React + Vite)
```powershell
cd front-end
npm install
npm run dev
```
FE runs at `http://localhost:3000`. Ensure the backend origin is allowed by CORS.

## Build & Deploy
- Frontend (production build):
```powershell
cd front-end
npm run build
```
Output at `front-end/build` (per Vite config).

- Backend (release JAR):
```powershell
.\mvnw clean package -DskipTests
```
Artifact: `target/bluemoon-0.0.1-SNAPSHOT.jar`

Deployment:
- Backend: run the JAR on a Java 21 host; configure DB and port via env vars.
- Frontend: deploy static build (Vercel/Netlify/Nginx/...).

## API Documentation (OpenAPI/Swagger)
- Swagger UI: `http://localhost:8081/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8081/v3/api-docs`

## Full API Endpoints
Note: Some groups are versioned under `/api/v1/...` while others use `/api/...`.

### Auth (`/api/v1/auth`)
- `POST /login` — Authenticate user; returns account/person IDs and role
- `POST /logout` — Logout (stateless placeholder)

### Residents (`/api/v1/residents`)
- `GET /dropdown?keyword=` — Search residents for dropdown
- `GET /?keyword=&include_inactive=false` — Search residents with optional inactive
- `GET /{id}` — Get resident detail
- `POST /` — Create resident
- `PUT /{id}` — Update resident
- `DELETE /?id=UUID&hard=false` — Soft delete (inactive) or hard delete when `hard=true`
- `POST /{id}/account` — Create account for resident

### Buildings (`/api/v1/buildings`)
- `GET /dropdown?keyword=` — Search buildings for dropdown
- `POST /` — Create building
- `DELETE /?id=UUID` — Delete building

### Apartments (`/api/v1/apartments`)
- `GET /dropdown?keyword=` — Search apartments for dropdown
- `GET /?keyword=&building=&floor=` — Search apartments by keyword/building/floor
- `GET /{id}` — Get apartment detail
- `POST /` — Create apartment
- `PUT /{id}?new_owner_id=` — Change apartment owner
- `DELETE /?id=` — Delete apartment
- `PUT /{apartmentId}/residents/add` — Add residents to an apartment
- `PUT /{apartmentId}/residents/remove` — Remove residents from an apartment

### Announcements (`/api/announcements`)
- `POST /` — Create announcement
- `GET /staff` — List all announcements (staff view)
- `GET /{announcementId}/recipients` — List recipient read statuses
- `GET /resident/{residentId}` — List announcements for a resident (with read status)
- `PATCH /resident/{residentId}/announcement/{announcementId}/read` — Mark as read
- `PUT /{id}` — Update announcement
- `DELETE /{id}` — Delete announcement

### Issues (`/api/issues`)
- `POST /` — Create issue
- `PATCH /{id}/status` — Update issue status
- `GET /?type=` — List issues (all or by `type`)
- `GET /count/security` — Count security issues
- `GET /security` — List security issues

### Accounting – Invoices & Dashboard (`/api/v1/accounting`)
- `GET /invoices?month=&year=` — Get invoice summaries
- `POST /invoices/generation?month=&year=` — Generate draft invoices (PENDING)
- `GET /invoices/export?month=&year=` — Export invoices to Excel
- `GET /dashboard/fourmetrics` — 4 KPIs for dashboard
- `GET /dashboard/barchart?year=` — Monthly revenue (bar chart) for a year
- `GET /dashboard/piechart?month=&year=` — Revenue distribution for month/year
- `PATCH /invoices/confirm?month=&year=&staffId=` — Confirm and send notifications

### Accounting – Extra Fee (`/api/v1/extrafee`)
- `GET /{id}` — Extra fee detail
- `GET /?keyword=` — Search extra fees
- `POST /` — Create extra fee
- `DELETE /{id}` — Delete extra fee

### Accounting – Usage Import (`/api/v1/accounting/usage-import`)
- `POST /preview` (multipart form) — Validate and preview file: `file`, `month`, `year`
- `POST /save` (JSON body) — Persist validated records: body list + `month`, `year`
- `GET /usage-records?month=&year=` — Query saved usage records by month/year

### Voluntary Contributions – Campaigns (`/api/v1/campaigns`)
- `POST /` — Create campaign
- `GET /` — List campaigns (summary)
- `GET /{id}` — Campaign detail (includes contributions)
- `POST /contributions` — Add contributor record
- `PUT /{id}` — Update campaign
- `DELETE /{id}` — Delete campaign

### Misc
- `GET /test` — Health/test endpoint

## Security Notes
- Do not commit DB credentials/secrets. Use environment variables or a secret manager.
- Restrict CORS origins to the actual FE hosts per environment.
- For production, consider:
  - Disable `spring.jpa.show-sql`
  - Manage schema with migrations (Flyway/Liquibase)

## License
See `LICENSE` in the repository root.


