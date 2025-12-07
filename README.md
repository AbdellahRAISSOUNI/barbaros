<div align="center">

# 🪒 Barbaros

### Modern Barbershop Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Production-ready platform with multi-role dashboards, QR-powered loyalty, real-time analytics, and enterprise-grade architecture.**

---

</div>

<div align="center">

## 🎨 Hero Banner

![Barbaros Platform Banner](docs/screenshots/Banner.png)

</div>

---

## 📋 Quick Navigation

| Section | Description |
|:--------|:------------|
| [🎯 Features](#-features) | Core capabilities & business value |
| [🖼️ Visual Tour](#️-visual-tour) | UI screenshots & architecture diagrams |
| [🏗️ Architecture](#️-architecture) | Technical design & infrastructure |
| [💻 Tech Stack](#-tech-stack) | Technologies & frameworks |
| [🚀 Quick Start](#-quick-start) | Get running in 5 minutes |
| [📚 Documentation](#-documentation) | Deep-dive guides |

---

## 🎯 Features

### 👥 Multi-Role System
- **Admin/Owner Dashboard** — Complete business control, analytics, and management
- **Barber Portal** — Performance tracking, scanner, and achievement system
- **Client Portal** — Loyalty tracking, reservations, and personal dashboard

### 🎫 QR Code System
- Unique QR codes for instant client identification
- Camera-based scanning with manual fallback
- Seamless visit recording and loyalty tracking

### 🎁 Intelligent Loyalty Program
- Automated visit tracking and milestone detection
- Customizable reward tiers and redemption
- Real-time progress visualization

### 📊 Advanced Analytics
- Real-time business intelligence dashboards
- Client growth and retention metrics
- Service popularity analysis
- Revenue tracking and forecasting
- Export reports (PDF, Excel)

### 🔒 Enterprise Security
- Role-based access control (RBAC)
- Secure authentication with NextAuth.js
- Rate limiting and DDoS protection
- Production-ready security headers

---

## 🖼️ Visual Tour

### Application Screenshots

<div align="center">

#### 🏠 Landing & Marketing
<table>
<tr>
<td width="33%"><strong>Landing Page</strong><br><img src="docs/screenshots/landing-hero.png" alt="Landing Page" width="100%"></td>
<td width="33%"><strong>Gallery</strong><br><img src="docs/screenshots/gallery-transformations.png" alt="Gallery" width="100%"></td>
<td width="33%"><strong>Client QR Code</strong><br><img src="docs/screenshots/client-qrcode.png" alt="Client QR Code" width="100%"></td>
</tr>
</table>

#### 👨‍💼 Admin Dashboard
<table>
<tr>
<td width="50%"><strong>Dashboard Overview</strong><br><img src="docs/screenshots/admin-dashboard-overview.png" alt="Admin Dashboard" width="100%"></td>
<td width="50%"><strong>QR Scanner</strong><br><img src="docs/screenshots/admin-qr-scanner.png" alt="Admin Scanner" width="100%"></td>
</tr>
<tr>
<td width="50%"><strong>Client Management</strong><br><img src="docs/screenshots/admin-clients-table.png" alt="Clients Table" width="100%"></td>
<td width="50%"><strong>Reports & Analytics</strong><br><img src="docs/screenshots/admin-reports.png" alt="Admin Reports" width="100%"></td>
</tr>
</table>

#### ✂️ Barber Experience
<table>
<tr>
<td width="50%"><strong>Barber Dashboard</strong><br><img src="docs/screenshots/barber-dashboard.png" alt="Barber Dashboard" width="100%"></td>
<td width="50%"><strong>Barber Scanner</strong><br><img src="docs/screenshots/barber-scanner.png" alt="Barber Scanner" width="100%"></td>
</tr>
</table>

#### 👤 Client Portal
<table>
<tr>
<td width="50%"><strong>Client Dashboard</strong><br><img src="docs/screenshots/client-dashboard.png" alt="Client Dashboard" width="100%"></td>
<td width="50%"><strong>Reservations</strong><br><img src="docs/screenshots/client-reservations.png" alt="Client Reservations" width="100%"></td>
</tr>
</table>

</div>

### 🏗️ System Architecture

<div align="center">

#### High-Level Architecture
![System Architecture](diagrams/MASTER-Architecture.png)

**Shows:** CI/CD pipeline, Edge Network (WAF/CDN), Serverless compute, MongoDB replica sets, and object storage.

#### Data Flow & Loyalty Engine
![Data Flow](diagrams/MASTER-DataFlow.png)

**Shows:** Domain models, transaction pipelines, ACID guarantees, and reward processing.

</div>

---

## 🏗️ Architecture

### Deployment Pipeline
```
GitHub → GitHub Actions (CI/CD) → Vercel Edge → Serverless Functions → MongoDB Atlas
```

### Infrastructure Layers

#### 🌐 Edge Layer
- **WAF & DDoS Protection** — Enterprise-grade security at the edge
- **Global CDN** — Static asset delivery worldwide
- **Edge Middleware** — Authentication, routing, and A/B testing

#### ⚡ Compute Layer
- **Next.js 15 App Router** — Server & Client Components
- **Serverless API Routes** — Auto-scaling backend functions
- **Connection Pooling** — Optimized database connections

#### 💾 Data Layer
- **MongoDB Atlas Replica Set** — High availability with primary/secondary nodes
- **Object Storage** — Scalable media storage (S3-compatible)

### Request Flow
1. **Client Request** → Edge Network (WAF/CDN)
2. **Edge Middleware** → Authentication & Rate Limiting
3. **Serverless Function** → Business Logic Processing
4. **MongoDB** → Data Persistence & Retrieval
5. **Response** → Edge Cache → Client

---

## 💻 Tech Stack

### Frontend
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| **Next.js** | 15.3.4 | React framework with App Router |
| **React** | 19.0.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **TailwindCSS** | 4.x | Utility-first styling |
| **Framer Motion** | 12.22.0 | Animations |
| **GSAP** | 3.13.0 | Advanced scroll effects |
| **React Query** | 5.82.0 | Server state management |
| **React Hook Form** | 7.58.1 | Form handling |
| **Zod** | 3.25.67 | Schema validation |

### Backend
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| **Next.js API Routes** | 15.3.4 | Serverless backend |
| **MongoDB** | 5.9.2 | Document database |
| **Mongoose** | 7.6.3 | ODM & models |
| **NextAuth.js** | 4.24.11 | Authentication |
| **bcryptjs** | 3.0.2 | Password hashing |

### Supporting Libraries
- **Chart.js** — Data visualization
- **html5-qrcode** — QR scanning
- **qrcode.react** — QR generation
- **exceljs** / **jspdf** — Report exports
- **date-fns** — Date utilities

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.17.0+ 
- **npm** 9.0.0+
- **MongoDB Atlas** account (or local MongoDB)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd barbaros

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and NextAuth secrets
```

### Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barbaros

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

**Visit** `http://localhost:3000` to see the application.

---

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](docs) directory:

- **[Project Overview](docs/project_description.md)** — Business logic and features
- **[Data Models](docs/data-models.md)** — Database schema and relationships
- **[Loyalty Program](docs/loyalty-program.md)** — Reward system details
- **[API Endpoints](docs/api-endpoints.md)** — API reference
- **[Development Guide](docs/development-guide.md)** — Development setup
- **[Deployment Checklist](docs/DEPLOYMENT-CHECKLIST.md)** — Production deployment

---

## 🔒 Security

- ✅ **Authentication** — NextAuth.js with JWT tokens
- ✅ **Authorization** — Role-based access control (RBAC)
- ✅ **Password Security** — bcrypt hashing (10 rounds)
- ✅ **Rate Limiting** — 1000 requests/minute per IP
- ✅ **Security Headers** — HSTS, X-Frame-Options, CSP
- ✅ **Input Validation** — Zod schema validation
- ✅ **HTTPS** — Enforced in production

---

## 📦 Deployment

Optimized for **Vercel** deployment:

1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to `main`

**Production Checklist:**
- [ ] Environment variables configured
- [ ] MongoDB Atlas network access configured
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXTAUTH_SECRET` set to secure random string
- [ ] HTTPS enabled
- [ ] Security headers verified

---

## 🎯 Project Structure

```
barbaros/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── admin/          # Admin dashboard
│   │   │   ├── barber/         # Barber portal
│   │   │   └── client/         # Client portal
│   │   ├── api/                # API routes
│   │   └── (landing)/          # Public pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities & helpers
│   │   ├── db/                 # Database models & APIs
│   │   ├── auth/               # Authentication
│   │   └── utils/              # Helper functions
│   └── middleware.ts           # Global middleware
├── diagrams/                   # Architecture diagrams
├── docs/                       # Documentation
└── public/                     # Static assets
```

---

<div align="center">

## 📄 License

Proprietary Software — All Rights Reserved

---

**Built with ❤️ using Next.js, MongoDB, and modern web technologies.**

[⬆ Back to Top](#-barbaros)

</div>