# 🪒 Barbaros - Barbershop Management System

> A comprehensive, modern barbershop management system built with Next.js 15, featuring multi-role authentication, QR code scanning, loyalty programs, and real-time analytics.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Core Systems](#core-systems)
- [Authentication & Authorization](#authentication--authorization)
- [Database Architecture](#database-architecture)
- [API Architecture](#api-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Security Features](#security-features)
- [Development Setup](#development-setup)
- [Deployment](#deployment)

## 🎯 Overview

Barbaros is a full-stack barbershop management platform that streamlines client management, visit tracking, loyalty programs, and business analytics. The system supports three distinct user roles (Admin/Owner, Barber, and Client) with role-specific dashboards and features.

### Key Features

- 🎫 **QR Code System**: Unique QR codes for client identification and quick visit recording
- 🎁 **Loyalty Program**: Automated reward tracking and redemption system
- 📊 **Analytics Dashboard**: Real-time business intelligence and reporting
- 👥 **Multi-Role Management**: Separate interfaces for owners, barbers, and clients
- 📅 **Reservation System**: Appointment booking and management
- 🏆 **Achievement System**: Barber performance tracking and rewards
- 📸 **Before/After Gallery**: Client transformation showcase
- 📱 **Mobile Responsive**: Optimized for desktop and mobile devices

## 🛠 Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.3.4 | React framework with App Router |
| **React** | 19.0.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **TailwindCSS** | 4.x | Utility-first CSS framework |
| **Framer Motion** | 12.22.0 | Animation library |
| **GSAP** | 3.13.0 | Advanced animations |
| **React Query** | 5.82.0 | Server state management |
| **React Hook Form** | 7.58.1 | Form handling |
| **Zod** | 3.25.67 | Schema validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 15.3.4 | Serverless API endpoints |
| **MongoDB** | 5.9.2 | NoSQL database driver |
| **Mongoose** | 7.6.3 | MongoDB ODM |
| **NextAuth.js** | 4.24.11 | Authentication framework |
| **bcryptjs** | 3.0.2 | Password hashing |

### Additional Libraries

- **Chart.js** (4.5.0) - Data visualization
- **html5-qrcode** (2.3.8) - QR code scanning
- **qrcode.react** (4.2.0) - QR code generation
- **exceljs** (4.4.0) - Excel export
- **jspdf** (3.0.1) - PDF generation
- **date-fns** (4.1.0) - Date utilities

## 🏗 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │    Admin     │  │    Client    │      │
│  │     Page     │  │  Dashboard   │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js App Router                      │   │
│  │  (Server Components, Client Components, Layouts)     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js API Routes                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Admin   │  │  Client  │  │  Barber  │          │   │
│  │  │   API    │  │   API    │  │   API    │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                        │   │
│  │  • Authentication (NextAuth.js)                      │   │
│  │  • Authorization (Role-based access control)         │   │
│  │  • Rate Limiting                                     │   │
│  │  • Security Headers                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MongoDB Atlas (Cloud)                   │   │
│  │  • Clients Collection                                │   │
│  │  • Visits Collection                                 │   │
│  │  • Services Collection                               │   │
│  │  • Rewards Collection                                │   │
│  │  • Admins Collection                                 │   │
│  │  • Barbers Collection                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Client Request** → Browser sends HTTP request
2. **Next.js Middleware** → Validates authentication and authorization
3. **Route Handler** → Server Component or API Route processes request
4. **Database API** → Mongoose models interact with MongoDB
5. **Response** → JSON (API) or HTML (Pages) returned to client

## 📁 Project Structure

```
barbaros/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── admin/                # Admin/Owner dashboard
│   │   │   │   ├── page.tsx          # Analytics overview
│   │   │   │   ├── clients/          # Client management
│   │   │   │   ├── barbers/          # Barber management
│   │   │   │   ├── services/         # Service catalog
│   │   │   │   ├── scanner/          # QR code scanner
│   │   │   │   ├── analytics/        # Business analytics
│   │   │   │   └── reports/          # Report generation
│   │   │   ├── barber/               # Barber dashboard
│   │   │   │   ├── page.tsx          # Barber overview
│   │   │   │   ├── scanner/          # Client scanner
│   │   │   │   └── achievements/     # Barber achievements
│   │   │   └── client/               # Client dashboard
│   │   │       ├── page.tsx          # Client overview
│   │   │       ├── qrcode/           # QR code display
│   │   │       ├── history/          # Visit history
│   │   │       └── reservations/     # Reservation management
│   │   ├── (landing)/                # Public landing pages
│   │   │   └── page.tsx              # Homepage
│   │   ├── api/                      # API Routes
│   │   │   ├── admin/                # Admin API endpoints
│   │   │   ├── clients/              # Client API endpoints
│   │   │   ├── barber/               # Barber API endpoints
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── loyalty/              # Loyalty program APIs
│   │   │   ├── visits/               # Visit tracking APIs
│   │   │   └── services/             # Service management APIs
│   │   ├── login/                    # Login page
│   │   ├── register/                 # Registration page
│   │   └── gallery/                  # Public gallery
│   ├── components/                   # React components
│   │   ├── admin/                    # Admin-specific components
│   │   │   ├── analytics/            # Analytics components
│   │   │   ├── barbers/              # Barber management UI
│   │   │   └── rewards/              # Reward management
│   │   ├── shared/                   # Shared components
│   │   │   ├── Header.tsx            # Navigation header
│   │   │   ├── Sidebar.tsx           # Dashboard sidebar
│   │   │   └── QRScanner.tsx         # QR code scanner
│   │   └── ui/                       # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Modal.tsx
│   ├── lib/                          # Utility libraries
│   │   ├── auth/                     # Authentication utilities
│   │   │   └── session.ts            # Session management
│   │   ├── db/                       # Database layer
│   │   │   ├── mongodb.ts            # Connection management
│   │   │   ├── models/               # Mongoose models
│   │   │   │   ├── client.ts
│   │   │   │   ├── visit.ts
│   │   │   │   ├── service.ts
│   │   │   │   ├── admin.ts
│   │   │   │   └── barber.ts
│   │   │   └── api/                  # Database API utilities
│   │   └── utils/                    # Helper functions
│   │       ├── apiOptimizer.ts       # API optimization
│   │       └── qrcode.ts             # QR code utilities
│   └── middleware.ts                 # Next.js middleware
├── public/                           # Static assets
│   ├── images/                       # Image files
│   └── animations/                   # Lottie animations
├── docs/                             # Documentation
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies
```

## 🔧 Core Systems

### 1. Authentication System

**Technology**: NextAuth.js with JWT tokens

**Features**:
- Multi-role authentication (Admin, Barber, Client)
- Session management with MongoDB adapter
- Secure password hashing with bcryptjs
- Token-based API authentication

**Roles**:
- **Owner/Admin**: Full system access
- **Receptionist**: Admin panel access
- **Barber**: Scanner and visit recording
- **Client**: Personal dashboard and reservations

### 2. QR Code System

**Technology**: `html5-qrcode` for scanning, `qrcode.react` for generation

**Features**:
- Unique QR code generation per client
- Camera-based QR code scanning
- Fast client identification
- Visit recording integration

**Flow**:
```
Client QR Code → Scanner → Client Identification → Visit Recording
```

### 3. Loyalty Program

**Components**:
- Visit counter tracking
- Reward milestone detection (6 visits = free haircut)
- Reward redemption system
- Loyalty history tracking

**Models**: `Reward`, `Visit`, `Client` collections

### 4. Analytics Dashboard

**Features**:
- Real-time business metrics
- Client growth tracking
- Service popularity analysis
- Revenue reporting
- Barber performance leaderboard
- Data export (PDF, Excel)

**Technology**: Chart.js for visualizations, React Query for data fetching

### 5. Reservation System

**Features**:
- Client self-booking
- Admin reservation management
- Guest reservations (non-registered users)
- Reservation analytics

## 🔐 Authentication & Authorization

### Middleware Flow

```typescript
Request → Middleware → Authentication Check → Role Validation → Route Access
```

### Role-Based Access Control (RBAC)

| Route Prefix | Allowed Roles |
|--------------|---------------|
| `/admin` | owner, admin, receptionist |
| `/barber` | barber, owner, admin |
| `/client` | client |

### Session Structure

```typescript
{
  id: string;           // User ID
  role: 'owner' | 'admin' | 'receptionist' | 'barber' | 'client';
  email?: string;       // Optional (clients use phone)
  name?: string;        // User display name
}
```

### Security Headers

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` (production)
- `Permissions-Policy: camera=(self)`
- Rate limiting (1000 req/min per IP)

## 🗄 Database Architecture

### Technology

- **Database**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose 7.6.3
- **Connection**: Native MongoDB driver with connection pooling

### Core Collections

#### 1. **Clients** (`clients`)
```typescript
{
  _id: ObjectId;
  name: string;
  phone: string;          // Unique identifier
  email?: string;
  qrCode: string;         // Unique QR code string
  passwordHash: string;
  totalVisits: number;
  loyaltyPoints: number;
  lastVisitDate?: Date;
  createdAt: Date;
}
```

#### 2. **Visits** (`visits`)
```typescript
{
  _id: ObjectId;
  clientId: ObjectId;     // Reference to Client
  barberId?: ObjectId;    // Reference to Barber
  services: ObjectId[];   // Array of Service IDs
  visitDate: Date;
  totalAmount: number;
  loyaltyPointsEarned: number;
}
```

#### 3. **Services** (`services`)
```typescript
{
  _id: ObjectId;
  name: string;
  description?: string;
  price: number;
  duration: number;       // Minutes
  categoryId?: ObjectId;
  imageUrl?: string;
  active: boolean;
}
```

#### 4. **Rewards** (`rewards`)
```typescript
{
  _id: ObjectId;
  clientId: ObjectId;
  rewardType: 'free_service' | 'discount' | 'custom';
  status: 'pending' | 'redeemed' | 'expired';
  redeemedAt?: Date;
  visitId?: ObjectId;     // Visit where reward was redeemed
}
```

#### 5. **Barbers** (`barbers`)
```typescript
{
  _id: ObjectId;
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  scannerEnabled: boolean;
  stats: {
    totalVisits: number;
    totalRevenue: number;
    averageRating?: number;
  };
}
```

#### 6. **Admins** (`admins`)
```typescript
{
  _id: ObjectId;
  name: string;
  email: string;          // Unique
  passwordHash: string;
  role: 'owner' | 'admin' | 'receptionist';
}
```

### Indexes

- `clients.phone`: Unique index
- `clients.qrCode`: Unique index
- `admins.email`: Unique index
- `visits.clientId`: Index for query optimization
- `visits.visitDate`: Index for date range queries

## 🌐 API Architecture

### API Structure

All API routes follow RESTful conventions:

```
/api/{resource}/{action}
```

### Example Endpoints

#### Client Management
- `GET /api/clients` - List all clients
- `GET /api/clients/[id]` - Get client details
- `POST /api/clients` - Create new client
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client
- `GET /api/clients/search?q={query}` - Search clients

#### Visit Tracking
- `GET /api/visits` - List visits with filters
- `POST /api/visits` - Create new visit
- `GET /api/clients/[id]/visits` - Client visit history

#### Analytics
- `GET /api/admin/analytics/overview` - Business overview
- `GET /api/admin/analytics/client-growth` - Growth metrics
- `GET /api/admin/analytics/service-popularity` - Service stats

### API Response Format

```typescript
// Success Response
{
  success: true;
  data: T;
  message?: string;
}

// Error Response
{
  success: false;
  error: string;
  details?: any;
}
```

### Error Handling

- HTTP status codes (200, 400, 401, 403, 404, 500)
- Structured error responses
- Client-side error handling with React Query

## 🎨 Frontend Architecture

### Component Architecture

```
Page Component
  ├── Layout Component
  │   ├── Header
  │   └── Sidebar
  └── Feature Components
      ├── Data Fetching (React Query)
      ├── State Management (React State/Context)
      └── UI Components (TailwindCSS)
```

### State Management

- **Server State**: React Query (`@tanstack/react-query`)
- **Client State**: React hooks (`useState`, `useReducer`)
- **Form State**: React Hook Form
- **Authentication State**: NextAuth.js session

### Styling Approach

- **Framework**: TailwindCSS 4.0
- **Utility Classes**: Rapid UI development
- **Custom Components**: Reusable UI components in `components/ui/`
- **Animations**: Framer Motion and GSAP for advanced animations

### Data Fetching

```typescript
// React Query Hook Example
const { data, isLoading, error } = useQuery({
  queryKey: ['clients'],
  queryFn: () => fetch('/api/clients').then(res => res.json())
});
```

## 🔒 Security Features

### Authentication Security

- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ JWT tokens with secure signing
- ✅ Session expiration and refresh
- ✅ Secure cookie handling

### Authorization Security

- ✅ Role-based access control (RBAC)
- ✅ Route-level authorization checks
- ✅ API endpoint protection
- ✅ Middleware-based validation

### Data Security

- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention (NoSQL safe queries)
- ✅ XSS protection with React's built-in escaping
- ✅ CSRF protection via NextAuth.js

### Infrastructure Security

- ✅ HTTPS enforcement in production
- ✅ Security headers (see Middleware)
- ✅ Rate limiting (1000 requests/minute)
- ✅ Environment variable protection
- ✅ MongoDB Atlas network access restrictions

## 🚀 Development Setup

### Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd barbaros

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Environment Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barbaros

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Database Setup

1. Create MongoDB Atlas cluster
2. Configure network access (allow your IP)
3. Create database user
4. Set `MONGODB_URI` in `.env.local`
5. Run database seeding (optional):
   ```bash
   # Visit /api/seed in browser or use API endpoint
   ```

## 📦 Deployment

### Vercel Deployment

The application is optimized for Vercel deployment:

1. **Connect Repository**: Link GitHub repository to Vercel
2. **Configure Environment Variables**: Add all required env vars
3. **Deploy**: Automatic deployment on push to main branch

### Build Configuration

- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas network access configured (allow Vercel IPs)
- [ ] `NEXTAUTH_URL` updated to production domain
- [ ] `NEXTAUTH_SECRET` set to secure random string
- [ ] HTTPS enabled
- [ ] Security headers verified

For detailed deployment instructions, see [`docs/DEPLOYMENT-CHECKLIST.md`](docs/DEPLOYMENT-CHECKLIST.md).

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- [`docs/README.md`](docs/README.md) - Documentation index
- [`docs/development-guide.md`](docs/development-guide.md) - Development guide
- [`docs/api-endpoints.md`](docs/api-endpoints.md) - API documentation
- [`docs/database-models.md`](docs/database-models.md) - Database schema
- [`docs/authentication.md`](docs/authentication.md) - Auth system details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Database powered by [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Authentication by [NextAuth.js](https://next-auth.js.org/)

---

**Barbaros** - Modern barbershop management, simplified. ✨
