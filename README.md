## Blue Moon Management – Building Management System

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
- Security Notes
- License

## Overview
- Backend: Spring Boot 3 (Java 21), RESTful APIs, PostgreSQL, JPA/Hibernate, Validation, Excel export.
- Frontend: React 18 + Vite + TypeScript, React Router, Radix UI, Recharts.
- Goal: Operate a condo/apartment management system across multiple roles (resident/authority/accounting/management) with announcements, fee charging/billing, issue tracking, reporting, and more.

## Architecture & Repository Structure
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

### Tech Stack Logos & Badges

<p align="center">
  <a href="https://www.java.com/">
    <img alt="Java" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg" height="48">
  </a>
  &nbsp;&nbsp;
  <a href="https://spring.io/projects/spring-boot">
    <img alt="Spring Boot" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/spring/spring-original.svg" height="48">
  </a>
  &nbsp;&nbsp;
  <a href="https://www.postgresql.org/">
    <img alt="PostgreSQL" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" height="48">
  </a>
  &nbsp;&nbsp;
  <a href="https://maven.apache.org/">
    <img alt="Maven" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/maven/maven-original.svg" height="48">
  </a>
  &nbsp;&nbsp;
  <a href="https://react.dev/">
    <img alt="React" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" height="48">
  </a>
  &nbsp;&nbsp;
  <a href="https://www.typescriptlang.org/">
    <img alt="TypeScript" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" height="48">
  </a>
  &nbsp;&nbsp;
  <a href="https://vitejs.dev/">
    <img alt="Vite" src="https://vitejs.dev/logo.svg" height="48">
  </a>
  &nbsp;&nbsp;
  <a href="https://swagger.io/">
    <img alt="Swagger / OpenAPI" src="https://raw.githubusercontent.com/swagger-api/swagger.io/wordpress/images/assets/SW-logo-clr.png" height="48">
  </a>
</p>

Badges:

![Java 21](https://img.shields.io/badge/Java-21-007396?logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?logo=postgresql&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-Build-C71A36?logo=apachemaven&logoColor=white)
![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix%20UI-Components-161618)
![Recharts](https://img.shields.io/badge/Recharts-Charts-00C49F)
![React Router](https://img.shields.io/badge/React%20Router-7-EA4335?logo=reactrouter&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-7-EC5990)
![Lombok](https://img.shields.io/badge/Lombok-Annotations-FF5733)
![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-6BA539)
![Apache%20POI](https://img.shields.io/badge/Apache%20POI-XLSX-1565C0)

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
- `https://building-management-system.fly.dev/`

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

## Security Notes
- Do not commit DB credentials/secrets. Use environment variables or a secret manager.
- Restrict CORS origins to the actual FE hosts per environment.
- For production, consider:
  - Disable `spring.jpa.show-sql`
  - Manage schema with migrations (Flyway/Liquibase)

## License
See `LICENSE` in the repository root.


