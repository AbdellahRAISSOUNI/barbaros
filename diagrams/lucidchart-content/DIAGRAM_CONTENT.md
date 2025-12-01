# 📋 LucidChart Diagram Content - Copy & Paste Ready

All the text content and structure for recreating diagrams in LucidChart. Just copy and paste!

---

## 1. SYSTEM ARCHITECTURE - Content

### Title Section:
**Main Title:** 
BARBAROS - System Architecture Overview

**Subtitle:**
Full-Stack Barbershop Management Platform

### Client Layer Section:
**Layer Title:** CLIENT LAYER

**Components:**
1. Landing Page
   - Public Marketing Site
   - Services Gallery
   - Contact Information

2. Admin Dashboard
   - Analytics & Reports
   - Client Management
   - Service Management
   - Barber Management
   - Business Intelligence

3. Barber Dashboard
   - QR Code Scanner
   - Visit Recording
   - Client Overview
   - Achievement Tracking
   - Personal Stats

4. Client Dashboard
   - QR Code Display
   - Visit History
   - Loyalty Progress
   - Reward Status
   - Reservations

5. Gallery
   - Before/After Showcase
   - Transformation Portfolio

### Application Layer Section:
**Layer Title:** APPLICATION LAYER

**Components:**
1. Next.js 15 Application
   - React 19 + TypeScript

2. App Router
   - Server Components
   - Client Components
   - Layouts & Pages

3. API Routes
   - /api/admin/*
   - /api/clients/*
   - /api/barber/*
   - /api/visits/*
   - /api/loyalty/*
   - /api/rewards/*
   - /api/services/*
   - /api/reservations/*

4. Middleware Layer
   - Authentication (NextAuth.js)
   - Authorization (RBAC)
   - Rate Limiting
   - Security Headers
   - Route Protection

### Business Logic Layer Section:
**Layer Title:** BUSINESS LOGIC LAYER

**Components:**
1. QR Code System
   - Generation
   - Scanning (Camera)
   - Client Identification
   - Image Upload Support

2. Loyalty Program
   - Visit Tracking
   - Reward Calculation
   - Milestone Detection
   - Progress Management

3. Analytics Engine
   - Real-time Metrics
   - Revenue Tracking
   - Client Growth
   - Service Popularity
   - Barber Performance

4. Authentication System
   - Multi-role Auth
   - Session Management
   - JWT Tokens
   - Password Hashing

5. Visit Recording
   - Service Selection
   - Payment Tracking
   - Barber Attribution
   - History Management

### Data Layer Section:
**Layer Title:** DATA LAYER

**Component:**
- MongoDB Atlas (Cloud)
  - NoSQL Database

**Collections:**
- Clients | Visits | Services | Rewards | Barbers | Admins | Reservations | ServiceCategories | BarberAchievements | Transformations

### Footer:
Built with: Next.js 15 • React 19 • TypeScript • TailwindCSS • MongoDB • NextAuth.js • Framer Motion • Chart.js

---

## 2. DATABASE SCHEMA - Content

### Entities:

**CLIENT**
- _id: ObjectId (PK)
- clientId: String (Unique)
- firstName: String
- lastName: String
- phoneNumber: String (Unique)
- passwordHash: String
- qrCodeId: String
- qrCodeUrl: String
- dateCreated: Date
- lastLogin: Date
- visitCount: Number
- totalLifetimeVisits: Number
- currentProgressVisits: Number
- rewardsEarned: Number
- rewardsRedeemed: Number
- loyaltyStatus: Enum
- selectedReward: ObjectId (FK → Reward)
- selectedRewardStartVisits: Number
- loyaltyJoinDate: Date
- lastVisit: Date
- totalSpent: Number
- averageVisitValue: Number
- accountActive: Boolean
- preferredServices: String[]

**VISIT**
- _id: ObjectId (PK)
- clientId: ObjectId (FK → Client)
- visitDate: Date
- services: ServiceReceived[]
  - serviceId: ObjectId (FK)
  - name: String
  - price: Number
  - duration: Number
- totalPrice: Number
- barber: String
- barberId: ObjectId (FK → Barber)
- notes: String
- rewardRedeemed: Boolean
- redeemedRewardId: ObjectId (FK → Reward)
- visitNumber: Number
- isRewardRedemption: Boolean
- createdAt: Date
- updatedAt: Date

**SERVICE**
- _id: ObjectId (PK)
- name: String
- description: String
- price: Number
- durationMinutes: Number
- imageUrl: String (Base64)
- categoryId: ObjectId (FK → ServiceCategory)
- isActive: Boolean
- popularityScore: Number
- createdAt: Date
- updatedAt: Date

**SERVICE CATEGORY**
- _id: ObjectId (PK)
- name: String (Unique)
- description: String
- displayOrder: Number
- isActive: Boolean
- createdAt: Date
- updatedAt: Date

**REWARD**
- _id: ObjectId (PK)
- name: String
- description: String
- visitsRequired: Number
- rewardType: Enum (free/discount)
- discountPercentage: Number
- isActive: Boolean
- applicableServices: ObjectId[] (FK → Service)
- maxRedemptions: Number
- validForDays: Number
- createdAt: Date
- updatedAt: Date

**BARBER / ADMIN**
- _id: ObjectId (PK)
- name: String
- email: String (Unique)
- phone: String
- username: String
- passwordHash: String
- role: Enum (owner/admin/receptionist/barber)
- profilePicture: String (Base64)
- scannerEnabled: Boolean
- stats: Object
  - totalVisits: Number
  - totalRevenue: Number
  - averageRating: Number
- active: Boolean
- lastLogin: Date
- createdAt: Date
- updatedAt: Date

**RESERVATION**
- _id: ObjectId (PK)
- clientId: ObjectId (FK → Client)
- clientName: String
- clientPhone: String
- clientEmail: String
- serviceId: ObjectId (FK → Service)
- reservationDate: Date
- reservationTime: String
- status: Enum
- notes: String
- isGuest: Boolean
- createdAt: Date
- updatedAt: Date

**BARBER ACHIEVEMENT**
- _id: ObjectId (PK)
- barberId: ObjectId (FK → Barber)
- month: Number
- year: Number
- totalVisits: Number
- totalRevenue: Number
- averageRating: Number
- rank: Number
- createdAt: Date
- updatedAt: Date

### Relationships:
- CLIENT 1 → * VISIT (has)
- VISIT * → 1 SERVICE (includes)
- SERVICE * → 1 SERVICE_CATEGORY (belongs to)
- CLIENT * → * REWARD (earns)
- VISIT * → 1 BARBER (served by)
- VISIT * → 0..1 REWARD (redeems)
- CLIENT 1 → * RESERVATION (makes)
- BARBER 1 → * BARBER_ACHIEVEMENT (has)

### Indexes Section:
**KEY INDEXES (Performance Optimized):**

**Client:**
- phoneNumber (unique)
- clientId (unique)
- text search (name/phone)
- loyaltyStatus + totalLifetimeVisits
- lastVisit

**Visit:**
- clientId + visitDate (compound)
- visitDate (desc)
- barberId
- barber + visitDate (compound)

**Service:**
- categoryId
- popularityScore (desc)
- isActive

**Reward:**
- visitsRequired
- isActive

**Barber:**
- email (unique)
- role + active

**Reservation:**
- reservationDate
- clientId
- status

---

## 3. QR CODE & LOYALTY FLOW - Content

### PHASE 1: CLIENT REGISTRATION

**Step 1:** Client Registration
- Name, Phone, Email
- Password Creation
- Account Setup

**Step 2:** QR Code Generation
- Unique clientId Generated
- QR Code Created (JSON format)
  - type: 'barbaros-client'
  - id: clientId
- Stored in Client Profile

**Step 3:** Client Dashboard Access
- View QR Code
- Download/Save QR
- Track Loyalty Progress

### PHASE 2: VISIT RECORDING (QR SCAN)

**Step 1:** Client Arrives
- Shows QR Code

**Step 2:** QR Code Scanning
- Multiple Methods:
  - Camera Scan (Real-time)
  - Image Upload
  - Manual Search (Phone/ID)

**Step 3:** Client Identification
- Parse QR Data
- Fetch Client Profile
- Display Client Info
- Show Visit History
- Display Loyalty Status

**Step 4:** Service Selection
- Choose Services
- Set Barber
- Calculate Total
- Add Notes

**Step 5:** Visit Recorded
- Create Visit Document
- Update Client Stats
- Increment Visit Count

### PHASE 3: LOYALTY PROGRAM PROCESSING

**Step 1:** Update Loyalty Status
- Increment totalLifetimeVisits
- Increment currentProgressVisits
- Update lastVisit Date
- Check Reward Eligibility

**Step 2:** Check Reward Milestone
IF currentProgressVisits >= selectedReward.visitsRequired:
- Set loyaltyStatus = 'milestone_reached'
- Enable Reward Redemption
- Show Progress to Client

**Decision Point:** Milestone Reached?
- Yes → Step 3
- No → Continue Earning

**Step 3:** Reward Redemption (During Next Visit)
- Barber Confirms Redemption
- Create Reward Visit Record
- Apply Free Service/Discount
- Reset Progress Counter
- Update Reward History

**Step 4:** Reset Progress
- currentProgressVisits = 0
- Clear selectedReward
- Set loyaltyStatus = 'active'
- Increment rewardsRedeemed

### DATA FLOW:
**MongoDB Collections:**
- Client (updated)
- Visit (created)
- Reward (referenced)
- BarberAchievement (updated)

### TECHNOLOGIES:
- html5-qrcode (Scanning)
- jsQR (Image Processing)
- qrcode.react (Generation)
- Next.js API Routes
- MongoDB Aggregation

---

## 4. USER JOURNEY - Content

### CLIENT JOURNEY:

1. Landing Page
   - Browse Services
   - View Gallery
   - Learn About Shop

2. Registration
   - Create Account
   - Phone/Email Login
   - Receive QR Code

3. Client Dashboard
   - View QR Code
   - Track Visits
   - Check Loyalty
   - View History

4. Select Reward
   - Choose Goal
   - View Progress
   - Track Milestone

5. Make Reservation
   - Choose Service
   - Pick Date/Time
   - Confirm Booking

6. Visit Shop
   - Show QR Code
   - Get Service
   - Earn Progress

7. Redeem Reward
   - Reach Milestone
   - Claim Free Service
   - Continue Earning

### BARBER JOURNEY:

1. Login
   - Email/Phone Auth
   - Access Dashboard

2. Open Scanner
   - QR Code Scanner
   - Camera Access
   - Multiple Methods

3. Scan Client QR
   - Identify Client
   - View Profile
   - Check History

4. Record Visit
   - Select Services
   - Set Price
   - Add Notes
   - Choose Self/Other

5. Process Reward
   - Check Eligibility
   - Redeem if Ready
   - Apply Discount

6. View Stats
   - Personal Visits
   - Revenue Tracked
   - Achievements

7. Leaderboard
   - Team Rankings
   - Performance Metrics
   - Monthly Stats

### ADMIN/OWNER JOURNEY:

1. Admin Login
   - Secure Access
   - Role Verification

2. Analytics Dashboard
   - Revenue Overview
   - Client Growth
   - Service Stats

3. Manage Clients
   - View All Clients
   - Search & Filter
   - Edit Profiles
   - Create Accounts

4. Manage Services
   - Add/Edit Services
   - Set Prices
   - Categorize
   - Upload Images

5. Manage Barbers
   - Add Team Members
   - Set Permissions
   - View Performance

6. Manage Rewards
   - Create Programs
   - Set Milestones
   - Track Redemptions

7. Generate Reports
   - Export Data
   - PDF/Excel Reports
   - Business Insights

### KEY INTERACTION POINTS:
- QR Code Scan: Client ↔ Barber
- Visit Recording: Barber → Database
- Reward Redemption: Barber → Client
- Analytics Viewing: Admin → Reports
- Service Management: Admin → Catalog
- Reservation Booking: Client → System

---

## 5. TECHNICAL STACK - Content

### FRONTEND LAYER:

**Core Framework:**
- Next.js 15.3.4 (React Framework)
- React 19.0.0 (UI Library)
- TypeScript 5.x (Type Safety)
- TailwindCSS 4.x (Utility Framework)

**UI Libraries:**
- Framer Motion 12.22.0 (Animations)
- GSAP 3.13.0 (Advanced Animations)
- React Query 5.82.0 (Server State)

**Forms & Validation:**
- React Hook Form 7.58.1
- Zod 3.25.67 (Validation)
- Radix UI (Components)

### BACKEND LAYER:

- Next.js API Routes (Serverless Endpoints)
- NextAuth.js 4.24.11 (Authentication)
- bcryptjs 3.0.2 (Password Hashing)
- Next.js Middleware
  - Auth Check
  - RBAC
  - Rate Limiting
  - Security Headers

### DATABASE LAYER:

- MongoDB Atlas (Cloud Database)
- Mongoose 7.6.3 (ODM Layer)
- Optimized Indexes
  - Compound Indexes
  - Text Search
  - Performance Queries

### SPECIALIZED LIBRARIES:

**QR Code:**
- html5-qrcode (Scan)
- jsQR (Process)
- qrcode.react (Generate)

**Visualization:**
- Chart.js 4.5.0
- react-chartjs-2

**Export:**
- ExcelJS (Excel)
- jsPDF (PDF)
- AutoTables

**Animations:**
- Lottie React
- Locomotive Scroll

### DEPLOYMENT & INFRASTRUCTURE:

- Vercel (Hosting Platform)
- Global CDN (Edge Network)
- SSL/TLS (HTTPS Only)
- Environment Variables (Secure Configuration)

### PERFORMANCE OPTIMIZATIONS:
- Server Components
- Image Optimization
- Code Splitting
- Lazy Loading
- API Caching
- Connection Pooling

### SECURITY FEATURES:
- JWT Authentication
- RBAC (Role-Based)
- Password Hashing
- Input Validation
- XSS Protection
- CSRF Protection
- Rate Limiting
- Security Headers

---

## 6. FEATURES OVERVIEW - Content

### CORE FEATURES:

**QR CODE SYSTEM**
- Unique QR per Client
- Camera Scanning
- Image Upload Support
- Manual Search Fallback
- Fast Client Identification

**LOYALTY PROGRAM**
- Visit-based Rewards
- Milestone Tracking
- Progress Visualization
- Reward Selection
- Automated Calculation
- Redemption System

**VISIT TRACKING**
- Service Selection
- Barber Attribution
- Payment Recording
- History Management
- Notes & Details

### MANAGEMENT FEATURES:

**CLIENT MANAGEMENT**
- Full CRUD Operations
- Search & Filter
- Profile Management
- Visit History View
- Bulk Operations

**SERVICE MANAGEMENT**
- Service Catalog
- Category Organization
- Price Management
- Image Uploads
- Active/Inactive Toggle
- Popularity Tracking

**BARBER MANAGEMENT**
- Team Member Profiles
- Performance Tracking
- Achievement System
- Leaderboard
- Permissions

### ANALYTICS & REPORTING:

**ANALYTICS DASHBOARD**
- Revenue Overview
- Client Growth Charts
- Service Popularity
- Peak Time Analysis
- Real-time Metrics

**REPORT GENERATION**
- PDF Export
- Excel Export
- Custom Date Ranges
- Client Reports
- Financial Reports
- Performance Reports

**BARBER STATISTICS**
- Monthly Rankings
- Visit Counts
- Revenue Tracking
- Achievement Badges
- Team Leaderboard

### USER EXPERIENCE FEATURES:

**RESPONSIVE DESIGN**
- Mobile Optimized
- Tablet Support
- Desktop Experience
- Touch-Friendly
- Adaptive Layout

**ANIMATIONS**
- Framer Motion
- GSAP Effects
- Lottie Animations
- Smooth Transitions
- Loading States

**THEME SYSTEM**
- Modern Design
- Consistent UI
- Professional Look
- Accessible Colors

### ADDITIONAL FEATURES:

**MULTI-ROLE AUTH**
- Admin/Owner
- Receptionist
- Barber
- Client
- Role-Based Access

**RESERVATION SYSTEM**
- Client Booking
- Guest Reservations
- Calendar View
- Time Slot Management

**BEFORE/AFTER GALLERY**
- Image Upload
- Transformation Showcase
- Public Gallery Page
- Client Portfolio

**REWARD MANAGEMENT**
- Create Rewards
- Set Milestones
- Track Redemptions
- Flexible Rules

**ADVANCED SEARCH**
- Full-Text Search
- Filter Options
- Sort Functionality
- Quick Access

**NOTIFICATIONS**
- Toast Messages
- Success/Error States
- Real-time Updates

**DATA VALIDATION**
- Input Validation
- Form Validation
- Error Handling
- Type Safety

### SYSTEM STATISTICS:
📊 10+ Database Collections • 50+ API Endpoints • 3 User Roles • 20+ Dashboard Pages • Real-time Analytics • Secure Authentication • Production-Ready Deployment

---

## Color Reference Guide:

**Primary Red (Client):** #8B2635
**Primary Green (Admin):** #1B3B36
**Secondary Green (Barber):** #2A5A4B
**Gold/Beige (Highlights):** #E6D7B8
**Dark Brown (Text):** #2D1B14
**Off White (Background):** #FAFAF8
**Warm Beige:** #EAE2D6
**MongoDB Green:** #10AA50

---

Copy and paste this content into LucidChart and style it beautifully! 🎨

