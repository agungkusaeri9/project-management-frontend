# Build Homepage — Software Engineering Technology Standardization Portal

## Project Context

Build a web application called:

**Software Engineering Technology Standardization Portal**

The application is used to define and document software engineering technology standards.

The project uses:

- Next.js
- TypeScript
- Tailwind CSS

The homepage is located at:

```text
/
```

---

# Homepage Goal

The homepage should act as the **main entry point for defining engineering standards**.

Do not create a generic marketing landing page.

The page should feel like an internal **engineering standardization tool / developer platform**.

The user should immediately understand:

> "I can select a software engineering standard here."

---

# Design Direction

Use a clean, modern, developer-focused UI.

Style inspiration:

- Modern developer tools
- Internal engineering platform
- Documentation portal
- Minimal SaaS dashboard

Avoid:

- Excessive gradients
- Large marketing illustrations
- Stock images
- Overly colorful UI
- Excessive animations
- Huge hero sections

The design should prioritize:

- Readability
- Simplicity
- Developer experience
- Clear hierarchy
- Easy navigation

---

# Page Layout

Use a centered content layout.

Maximum content width:

```text
max-w-3xl
```

or similar.

The main content should be vertically centered with enough whitespace.

Recommended structure:

```text
Page
│
├── Header
│
├── Hero
│   ├── Title
│   └── Description
│
├── Standard Categories
│   ├── Technology Stack
│   ├── Architecture
│   ├── Deployment
│   ├── Logging
│   └── Security
│
└── Footer
```

---

# Header

Create a simple header.

Left side:

```text
Software Engineering
Standardization
```

Right side:

```text
Projects
Documentation
```

If these pages do not exist yet, the navigation can be visually present but should not lead to broken pages.

Keep the header minimal.

---

# Hero Section

Centered.

Title:

```text
Software Engineering
Technology Standardization
```

Subtitle:

```text
Define, standardize, and document the technologies
and engineering practices used across your projects.
```

Use a strong but not oversized typography.

Example:

```text
text-4xl
font-bold
```

Desktop can use:

```text
text-5xl
```

Mobile should remain readable.

---

# Standard Category List

Below the hero, display the standard categories as a vertical list.

Do not use a large multi-column dashboard.

Use a centered vertical list because the number of main categories is small.

Each item should be a clickable card.

Recommended width:

```text
w-full
```

inside:

```text
max-w-2xl
```

---

# Category 1 — Technology Stack

Title:

```text
Technology Stack
```

Description:

```text
Define the technologies used by the application,
including frontend, backend, mobile, database, and supporting services.
```

Show small metadata:

```text
Frontend
Backend
Mobile
Database
Cache
Message Broker
```

Icon:

```text
Layers / Boxes / Code
```

---

# Category 2 — Architecture

Title:

```text
Architecture
```

Description:

```text
Define the architectural pattern and project structure
used to build and maintain the application.
```

Show metadata:

```text
MVC
Repository + Service
Clean Architecture
Modular Monolith
Microservices
```

Icon:

```text
Architecture / Network / Boxes
```

---

# Category 3 — Deployment

Title:

```text
Deployment
```

Description:

```text
Define how applications are packaged, deployed,
and operated across development, staging, and production environments.
```

Show metadata:

```text
Docker
Docker Compose
Windows Service
Linux Service
Nginx
Kubernetes
```

Icon:

```text
Rocket / Server
```

---

# Category 4 — Logging

Title:

```text
Logging
```

Description:

```text
Define application logging levels, structured logging,
log fields, storage, and observability standards.
```

Show metadata:

```text
Structured Logging
Serilog
OpenTelemetry
Elasticsearch
Kibana
```

Icon:

```text
File Text / Logs
```

---

# Category 5 — Security

Title:

```text
Security
```

Description:

```text
Define authentication, authorization, application security,
secret management, and security best practices.
```

Show metadata:

```text
JWT
OAuth 2.0
RBAC
HTTPS
Rate Limiting
Secret Management
```

Icon:

```text
Shield
```

---

# Card Design

Each category card should have:

```text
┌──────────────────────────────────────────────┐
│                                              │
│  [ICON]   Technology Stack             →     │
│           Define the technologies used...    │
│                                              │
│           Frontend · Backend · Database      │
│                                              │
└──────────────────────────────────────────────┘
```

Interaction:

- Entire card is clickable.
- Add subtle hover state.
- Slight border color change on hover.
- Slight background change.
- Arrow moves slightly to the right on hover.
- Use transition duration around 150–200ms.
- Do not create excessive animations.

---

# Visual Hierarchy

The order should be:

```text
Title
   ↓
Description
   ↓
Category List
   ↓
Category Details
```

The first and most important category is:

```text
Technology Stack
```

because it is the foundation of the project.

---

# Technology Stack Content

When the user clicks:

```text
Technology Stack
```

navigate to:

```text
/technology
```

The Technology page will later contain:

```text
Technology
│
├── Frontend
├── Backend
├── Mobile
├── Database
├── Cache
├── Message Broker
└── Other
```

---

# Technology Catalog

The technology catalog should support the following initial technologies.

## Frontend

```text
Next.js
React.js
Vue.js
Angular
Nuxt.js
```

## Backend

```text
ASP.NET Core
Laravel
Express.js
NestJS
Go
Spring Boot
FastAPI
Django
```

## Mobile

```text
React Native
Flutter
.NET MAUI
Kotlin
Swift
```

## Database

```text
SQL Server
MySQL
PostgreSQL
MariaDB
Oracle
MongoDB
Redis
```

## Supporting Technology

```text
RabbitMQ
Kafka
MQTT
Redis
Elasticsearch
```

---

# Architecture Content

When the user clicks:

```text
Architecture
```

navigate to:

```text
/architecture
```

Initial architecture options:

```text
MVC
Repository + Service
Clean Architecture
Modular Monolith
Microservices
```

Each architecture should have:

```text
Name
Description
Use Case
Project Structure
Dependency Rules
Example
Recommended Technology
```

---

# Deployment Content

When the user clicks:

```text
Deployment
```

navigate to:

```text
/deployment
```

Initial deployment options:

```text
Docker
Docker Compose
Windows Service
Linux Service
Nginx
Kubernetes
```

Each deployment technology should contain:

```text
Name
Description
Use Case
Requirements
Configuration
Deployment Flow
Advantages
Disadvantages
```

---

# Logging Content

When the user clicks:

```text
Logging
```

navigate to:

```text
/logging
```

Initial logging standard:

## Log Levels

```text
Trace
Debug
Information
Warning
Error
Critical
```

## Log Categories

```text
Application
API
Authentication
Authorization
Database
Integration
Background Job
Security
Audit
```

## Standard Fields

```text
Timestamp
Level
Service
Environment
Category
CorrelationId
RequestId
TraceId
UserId
Endpoint
HTTP Method
Status Code
Duration
Message
Exception
```

Recommended format:

```text
Structured JSON Logging
```

---

# Security Content

When the user clicks:

```text
Security
```

navigate to:

```text
/security
```

Initial security standard:

## Authentication

```text
JWT
OAuth 2.0
OpenID Connect
```

## Authorization

```text
RBAC
Permission Based Authorization
```

## Application Security

```text
HTTPS
Password Hashing
Input Validation
CORS
Rate Limiting
SQL Injection Prevention
XSS Prevention
CSRF Protection
Secure Headers
```

## Secret Management

Never store:

```text
Password
JWT Secret
API Key
Database Password
Access Token
Refresh Token
Connection String
```

directly in source code.

---

# Responsive Design

The homepage must be fully responsive.

Desktop:

```text
Centered content
Max width
Comfortable whitespace
```

Tablet:

```text
Same vertical card layout
Reduced spacing
```

Mobile:

```text
Full width cards
Smaller typography
Reduced padding
No horizontal overflow
```

The category list must remain vertical on all screen sizes.

---

# Accessibility

Implement basic accessibility:

- Semantic HTML
- Keyboard accessible cards
- Visible focus state
- Proper heading hierarchy
- Accessible icon labels
- Sufficient text contrast

Clickable cards should preferably use:

```html
<a></a>
```

or:

```tsx
<Link>
```

instead of clickable `<div>` elements.

---

# Component Structure

Create reusable components.

Suggested structure:

```text
src/
├── app/
│   └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   └── standard/
│       ├── StandardCard.tsx
│       └── StandardCardList.tsx
│
└── data/
    └── standards.ts
```

The category cards should be generated from data rather than hardcoded repeated JSX.

Example data concept:

```ts
type StandardCategory = {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  tags: string[];
};
```

---

# Initial Routes

Create these routes:

```text
/
├── /technology
├── /architecture
├── /deployment
├── /logging
└── /security
```

For the first implementation, the homepage and navigation structure are the priority.

The subpages can initially contain placeholder content, but their layout should already be prepared for future standardization content.

---

# Future Feature

Do not implement this yet, but keep the architecture ready for:

```text
Create Project
      ↓
Select Technology
      ↓
Select Architecture
      ↓
Select Deployment
      ↓
Select Logging
      ↓
Select Security
      ↓
Generate Standard Document
      ↓
Export PDF
```

The future generated document should contain:

```text
Project Information
Technology Stack
Architecture Standard
Deployment Standard
Logging Standard
Security Standard
```

---

# Important Implementation Rules

1. Use Next.js App Router.
2. Use TypeScript.
3. Use Tailwind CSS.
4. Keep components reusable.
5. Avoid hardcoding repeated category cards.
6. Use data-driven rendering.
7. Keep the homepage minimal.
8. Do not build a complex dashboard yet.
9. Do not implement authentication yet.
10. Do not implement database integration yet.
11. Do not implement PDF generation yet.
12. Focus on the UI foundation and navigation first.

---

# Definition of Done

Homepage is considered complete when:

- [ ] `/` displays the Software Engineering Technology Standardization title.
- [ ] Hero section is centered.
- [ ] Five standard categories are displayed.
- [ ] Categories are displayed as a vertical list.
- [ ] Cards have hover and focus states.
- [ ] Cards are responsive.
- [ ] Technology Stack navigates to `/technology`.
- [ ] Architecture navigates to `/architecture`.
- [ ] Deployment navigates to `/deployment`.
- [ ] Logging navigates to `/logging`.
- [ ] Security navigates to `/security`.
- [ ] UI works on desktop and mobile.
- [ ] No horizontal overflow.
- [ ] Components are reusable.
- [ ] Category data is separated from UI components.
