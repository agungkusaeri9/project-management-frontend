# 3. Technology Relationship

## Purpose

Technology Relationship digunakan untuk mendefinisikan hubungan antar teknologi yang digunakan dalam sebuah technology stack.

Dokumen ini tidak hanya mencatat **bahasa pemrograman atau framework**, tetapi juga menjelaskan bagaimana teknologi tersebut digunakan bersama, mulai dari architecture, data access, validation, logging, messaging, testing, containerization, sampai deployment.

---

## 3.1 .NET Technology Relationship

### Core Technology

| Category          | Technology                      | Relationship / Usage                             |
| ----------------- | ------------------------------- | ------------------------------------------------ |
| Language          | C#                              | Bahasa utama untuk pengembangan backend          |
| Runtime           | .NET                            | Runtime aplikasi backend                         |
| Framework         | ASP.NET Core                    | Web API, middleware, dependency injection        |
| ORM               | Entity Framework Core           | Database access menggunakan ORM                  |
| Micro ORM         | Dapper                          | Query SQL dengan kontrol query yang lebih detail |
| Database          | SQL Server / PostgreSQL / MySQL | Relational database                              |
| API Documentation | Swagger / OpenAPI               | Dokumentasi dan testing API                      |

### Architecture

Technology architecture dapat menggunakan beberapa pendekatan berikut:

#### Repository + Service

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

- **Controller** menangani HTTP request dan response.
- **Service** menangani business logic.
- **Repository** menangani database access.
- Cocok untuk aplikasi dengan struktur sederhana sampai menengah.

#### Clean Architecture

```text
API / Presentation
        ↓
Application
        ↓
Domain
        ↓
Infrastructure
```

Contoh relationship:

- `API` → Controller, Middleware, Authentication
- `Application` → Service, Use Case, DTO, Validation
- `Domain` → Entity, Enum, Business Rule
- `Infrastructure` → EF Core, Dapper, Repository, External Service

Clean Architecture direkomendasikan untuk aplikasi yang memiliki business logic kompleks dan membutuhkan maintainability jangka panjang.

---

## 3.2 Data Access Relationship

### Entity Framework Core

Digunakan ketika:

- Membutuhkan ORM.
- Menggunakan entity dan relationship.
- Membutuhkan migration.
- CRUD cukup kompleks.
- Membutuhkan LINQ.

Relationship:

```text
Service
   ↓
Repository
   ↓
EF Core
   ↓
Database
```

### Dapper

Digunakan ketika:

- Query membutuhkan SQL manual.
- Membutuhkan performa query yang lebih terkontrol.
- Query reporting atau complex query.
- Membutuhkan mapping object sederhana.

Relationship:

```text
Service
   ↓
Repository
   ↓
Dapper
   ↓
SQL Query
   ↓
Database
```

### EF Core + Dapper

Keduanya dapat digunakan dalam satu aplikasi.

Contoh:

```text
                 ┌── EF Core ──→ Database
Service ─→ Repository
                 └── Dapper ───→ Database
```

Guideline:

- Gunakan **EF Core** sebagai default untuk CRUD dan entity relationship.
- Gunakan **Dapper** untuk query khusus yang membutuhkan SQL manual atau optimasi tertentu.
- Hindari menggunakan dua ORM untuk kebutuhan yang sama tanpa alasan yang jelas.

---

## 3.3 Validation Relationship

Validation dapat menggunakan:

- **FluentValidation**
- Data Annotations
- Custom Validation

Recommended:

```text
Controller
    ↓
Request DTO
    ↓
FluentValidation
    ↓
Service
    ↓
Business Logic
```

FluentValidation cocok untuk validation yang kompleks karena rule dapat dipisahkan dari DTO.

Contoh validation:

- Required field
- String length
- Format
- Numeric range
- Enum validation
- Business-related input validation

Validation sebaiknya dibedakan menjadi:

1. **Input Validation** — validasi format dan data request.
2. **Business Validation** — validasi berdasarkan business rule.
3. **Database Constraint** — validasi integritas data pada database.

---

## 3.4 Logging Relationship

Recommended logging stack:

- **Serilog** sebagai logging framework.
- Console sink untuk development.
- File sink untuk kebutuhan lokal atau server tertentu.
- Elasticsearch / Loki / Seq / Application Insights untuk centralized logging.

Relationship:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Serilog
    ↓
Log Storage / Monitoring
```

Logging minimal mencakup:

- Request information
- Error / Exception
- Business process
- External service call
- Database error
- Background worker process

Gunakan structured logging agar log mudah dicari dan dianalisis.

Contoh:

```text
Information
Warning
Error
Critical
```

Hindari menyimpan:

- Password
- Access token
- Refresh token
- Sensitive personal data
- Secret / API key

---

## 3.5 Authentication & Authorization

Recommended technology:

- JWT Bearer Authentication
- ASP.NET Core Identity jika membutuhkan user management
- OAuth 2.0 / OpenID Connect jika menggunakan Identity Provider

Relationship:

```text
Client
  ↓
API
  ↓
Authentication Middleware
  ↓
JWT Validation
  ↓
Authorization / Policy
  ↓
Controller
```

Authorization dapat menggunakan:

- Role-based authorization
- Policy-based authorization
- Permission-based authorization

---

## 3.6 Background Job

Untuk process asynchronous atau scheduled task dapat menggunakan:

- `IHostedService`
- `BackgroundService`
- Hangfire
- Quartz.NET

Contoh:

```text
Application
    ↓
Background Worker
    ↓
Service
    ↓
Repository / External Service
```

Gunakan `BackgroundService` untuk kebutuhan sederhana.

Gunakan Hangfire atau Quartz.NET jika membutuhkan:

- Scheduled job
- Retry
- Job history
- Delayed job
- Recurring job
- Job dashboard

---

## 3.7 Messaging Relationship

Untuk asynchronous communication dapat menggunakan:

- MQTT
- RabbitMQ
- Apache Kafka
- Azure Service Bus

Contoh menggunakan RabbitMQ:

```text
Application
    ↓
Publisher
    ↓
RabbitMQ
    ↓
Consumer / Worker
    ↓
Service
```

MQTT lebih cocok untuk:

- IoT
- Device communication
- Telemetry
- Lightweight messaging

RabbitMQ lebih cocok untuk:

- Backend-to-backend communication
- Queue processing
- Worker
- Event-driven processing

---

## 3.8 Caching Relationship

Caching dapat menggunakan:

- `IMemoryCache`
- Redis
- Distributed Cache

Relationship:

```text
Controller
    ↓
Service
    ↓
Cache
    ↓
Database
```

Recommended:

- `IMemoryCache` untuk single-instance/simple application.
- Redis untuk distributed application atau multiple application instances.

---

## 3.9 Testing Relationship

Testing stack:

| Testing Type     | Technology                    |
| ---------------- | ----------------------------- |
| Unit Test        | xUnit / NUnit                 |
| Mocking          | Moq / NSubstitute             |
| Integration Test | ASP.NET Core Integration Test |
| API Test         | Postman / Bruno / Swagger     |
| Database Test    | Testcontainers                |

Relationship:

```text
Unit Test
   ↓
Service / Business Logic

Integration Test
   ↓
API + Database + Infrastructure
```

Recommended approach:

- Unit test untuk business logic.
- Integration test untuk endpoint dan infrastructure.
- Tidak semua code harus memiliki unit test jika tidak memberikan value yang signifikan.

---

## 3.10 Containerization

Recommended:

- Docker
- Docker Compose

Relationship:

```text
.NET Application
      ↓
Docker Image
      ↓
Container
      ↓
Docker Compose / Container Platform
```

Contoh environment:

```text
Application Container
Database Container
Redis Container
RabbitMQ Container
MQTT Container
```

---

## 3.11 Deployment Relationship

Deployment dapat menggunakan:

### Docker + VM

```text
Git Repository
      ↓
CI/CD
      ↓
Docker Image
      ↓
VM / Server
      ↓
Docker Container
```

### Kubernetes

```text
Git Repository
      ↓
CI/CD
      ↓
Container Registry
      ↓
Kubernetes
      ↓
Pod
      ↓
Service
```

Technology yang dapat digunakan:

- GitHub Actions
- GitLab CI/CD
- Azure DevOps
- Jenkins
- Docker Registry
- Kubernetes
- Linux VM

---

## 3.12 Configuration Management

Configuration dapat menggunakan:

- `appsettings.json`
- `appsettings.{Environment}.json`
- Environment Variables
- Secret Manager
- Vault / Cloud Secret Manager

Relationship:

```text
Application
    ↓
Configuration
    ↓
Environment Variables / Secret Store
```

Secret seperti database password, JWT secret, API key, dan credentials tidak disimpan langsung di source code.

---

## 3.13 API Documentation

Recommended:

- Swagger
- OpenAPI

Relationship:

```text
ASP.NET Core API
      ↓
OpenAPI Specification
      ↓
Swagger UI
```

Swagger digunakan untuk:

- Melihat endpoint.
- Melihat request dan response.
- Testing API.
- Dokumentasi API.

---

## 3.14 Observability

Observability dapat terdiri dari:

```text
Application
   ├── Logs
   ├── Metrics
   └── Traces
          ↓
Monitoring Platform
```

Technology yang dapat digunakan:

- Serilog
- OpenTelemetry
- Prometheus
- Grafana
- Application Insights
- Elasticsearch / Kibana

Tujuannya adalah memudahkan monitoring:

- Application health
- Error rate
- Response time
- Database performance
- Background job
- External service
- Resource usage

---

## 3.15 Recommended .NET Stack

Contoh standard stack:

```text
Language
└── C#

Framework
└── ASP.NET Core

Architecture
└── Clean Architecture

ORM / Data Access
├── Entity Framework Core
└── Dapper

Validation
└── FluentValidation

Logging
└── Serilog

Authentication
└── JWT Bearer

Background Job
├── BackgroundService
└── Hangfire / Quartz.NET

Messaging
├── RabbitMQ
└── MQTT

Caching
└── Redis

Testing
├── xUnit
├── Moq / NSubstitute
└── Testcontainers

API Documentation
└── Swagger / OpenAPI

Containerization
└── Docker

Deployment
├── Docker Compose
├── Linux VM
└── Kubernetes

CI/CD
├── GitHub Actions
├── GitLab CI/CD
└── Azure DevOps

Observability
├── Serilog
├── OpenTelemetry
├── Prometheus
└── Grafana
```

---

## 3.16 Technology Relationship Matrix

| Area              | Default Technology      | Alternative               |
| ----------------- | ----------------------- | ------------------------- |
| Language          | C#                      | -                         |
| Framework         | ASP.NET Core            | -                         |
| Architecture      | Clean Architecture      | Repository + Service      |
| ORM               | EF Core                 | Dapper                    |
| Validation        | FluentValidation        | Data Annotations          |
| Logging           | Serilog                 | Built-in ILogger          |
| Authentication    | JWT                     | OAuth2 / OIDC             |
| Background Job    | BackgroundService       | Hangfire / Quartz.NET     |
| Messaging         | RabbitMQ                | Kafka / Azure Service Bus |
| IoT Messaging     | MQTT                    | -                         |
| Cache             | Redis                   | IMemoryCache              |
| Testing           | xUnit                   | NUnit                     |
| Mocking           | Moq                     | NSubstitute               |
| API Documentation | Swagger / OpenAPI       | -                         |
| Container         | Docker                  | -                         |
| Deployment        | Docker + Linux VM       | Kubernetes                |
| CI/CD             | GitHub Actions          | GitLab CI / Azure DevOps  |
| Monitoring        | OpenTelemetry + Grafana | Application Insights      |
