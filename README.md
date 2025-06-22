# Barbaros - Advanced Barbershop Management System

## Overview
Barbaros is a comprehensive barbershop management platform featuring client management, loyalty programs, service tracking, and an advanced employee achievement system designed for maximum retention and motivation.

## 🚀 Key Features

### Client Management
- **Digital client profiles** with QR code generation
- **Visit history tracking** with detailed service records
- **Loyalty point system** with automatic reward calculations
- **Client search and filtering** capabilities
- **Data export** functionality for business analytics

### Barber Management System
- **Profile management** with photo uploads and essential information
- **Role-based authentication** (email or phone number login)
- **Performance tracking** with comprehensive statistics
- **Two-tier deletion system** (deactivate → permanent delete)
- **Automatic visit attribution** with smart barber selection

### Advanced Achievement System 🏆
A sophisticated employee loyalty and retention platform featuring:

#### **8 Achievement Categories**
- **🕒 Tenure & Loyalty**: Time-based achievements for employee retention
- **📊 Performance**: Visit count and productivity goals (NO revenue tracking)
- **👥 Client Relations**: Customer service and relationship building
- **🔥 Consistency**: Work pattern reliability and streak tracking
- **⭐ Quality & Craft**: Service excellence and skill mastery
- **📚 Growth & Learning**: Professional development and education
- **🏆 Major Milestones**: Significant career achievements
- **🤝 Teamwork**: Collaborative goals and team building

#### **5-Tier Progression System**
- **🥉 Bronze**: Entry-level (10-100 points)
- **🥈 Silver**: Intermediate (100-300 points)
- **🥇 Gold**: Advanced (300-500 points)
- **💎 Platinum**: Expert (500-1000 points)
- **💠 Diamond**: Elite (1000+ points)

#### **Advanced Features**
- **Automatic Progress Tracking**: Real-time updates on visit completion
- **Flexible Reward System**: Monetary, time off, recognition, privileges, training
- **Streak Detection**: Consecutive achievement tracking
- **Repeatable Goals**: Daily/weekly/monthly recurring achievements
- **Prerequisites**: Achievement chains and progression paths
- **Admin Dashboard**: Visual achievement builder with comprehensive management

### Reservation System
- **Dual booking flows**: Guest reservations and client account bookings
- **Guest reservations**: Quick booking without account creation (name + phone only)
- **Client reservations**: Account-based booking with auto-filled information
- **Smart routing**: Non-logged users directed to guest booking, logged users to client dashboard
- **Admin management**: Comprehensive reservation tracking with status updates
- **Real-time alerts**: Eye-catching notifications for new reservations
- **Status tracking**: Complete lifecycle from pending to confirmed/cancelled

### Service Management
- **Service catalog** with pricing and duration
- **Category organization** for better service discovery
- **Service popularity tracking** and analytics
- **Bulk upload capabilities** for efficient management

### Analytics & Reporting
- **Client growth tracking** with visual charts
- **Service popularity analysis** 
- **Visit frequency patterns** and trends
- **Revenue analytics** (admin-only, excluded from barber interface)
- **Achievement completion rates** and employee engagement metrics
- **Export capabilities** for external analysis

### Role-Based Dashboards

#### Admin Dashboard
- **Comprehensive client management** with full CRUD operations
- **Barber profile management** and performance tracking
- **Achievement system administration** with visual builder
- **Reservation management** with real-time alerts and status tracking
- **Advanced analytics** including revenue and business metrics
- **Service and category management**
- **Complete leaderboard** with all performance metrics

#### Barber Dashboard
- **Personal performance overview** with key statistics
- **QR code scanner** with multiple input methods (camera, upload, manual)
- **Visit recording** with automatic attribution
- **Personal achievement tracking** with gamification elements
- **Visit history** with filtering and export capabilities
- **Profile management** with photo upload
- **Privacy-focused leaderboard** (excludes revenue data)

#### Client Dashboard
- **Personal reservation management** with booking history
- **New reservation booking** with account benefits
- **Visit history tracking** with detailed service records
- **QR code access** for quick check-ins
- **Loyalty rewards** and points tracking
- **Profile management** and preferences

## 🛠️ Technical Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **React Hot Toast** for notifications
- **React Icons** for consistent iconography

### Backend
- **Next.js API Routes** for serverless functions
- **MongoDB** with Mongoose ODM
- **NextAuth.js** for authentication
- **bcrypt** for secure password hashing

### Key Libraries
- **QR Code Generation**: qrcode library
- **Image Upload**: Built-in file handling with validation
- **Charts**: Chart.js for analytics visualization
- **Export Functionality**: CSV generation for data export

## 📊 Database Models

### Core Models
- **Client**: Personal info, contact details, loyalty points, QR codes
- **Visit**: Service records, pricing, barber attribution, dates
- **Service**: Catalog with categories, pricing, duration
- **Reward**: Loyalty system rewards and redemption tracking
- **Reservation**: Guest and client bookings with status tracking
- **Admin/Barber**: User profiles with role-based permissions

### Achievement System Models
- **Achievement**: Comprehensive achievement definitions with tiers, categories, and rewards
- **BarberAchievement**: Individual progress tracking with streaks and metadata
- **BarberStats**: Performance metrics and analytics data

## 🔐 Security Features

### Authentication
- **NextAuth.js** session management
- **Bcrypt password hashing** with automatic salt generation
- **Role-based access control** (admin vs barber permissions)
- **Route protection** with middleware
- **Dual login methods** (email or phone number)

### Data Protection
- **Input validation** at all API endpoints
- **Type safety** with TypeScript throughout
- **Error handling** with graceful degradation
- **Database constraints** to prevent corruption
- **Privacy controls** (revenue data excluded from barber interface)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd barbaros-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Database Seeding**
```bash
# Seed with sample data including advanced achievements
curl -X POST http://localhost:3000/api/seed
```

5. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📱 Usage

### Admin Functions
1. **Login** with admin credentials
2. **Create barber profiles** with photos and essential information
3. **Manage achievement system** with visual builder and comprehensive options
4. **Manage reservations** with real-time alerts and status tracking
5. **Record visits** for clients with automatic barber attribution
6. **Monitor performance** through analytics dashboard
7. **Export data** for business analysis

### Barber Functions
1. **Login** with email or phone number
2. **Scan QR codes** using camera, image upload, or manual search
3. **Record visits** with automatic self-attribution
4. **Track achievements** and career progression
5. **View personal statistics** and performance metrics
6. **Manage profile** and update personal information

### Client Functions
1. **Create account** or **book as guest** without registration
2. **Make reservations** with smart routing (guest vs account booking)
3. **Track reservation status** and booking history
4. **View visit history** and service records
5. **Access QR code** for quick check-ins
6. **Manage loyalty points** and redeem rewards
7. **Update profile** and preferences

## 🏆 Achievement System Highlights

### Sample Achievements

#### Tenure & Loyalty
- **Welcome Aboard** (7 days) - Bronze, 50pts, Welcome Certificate
- **One Month Strong** (30 days) - Bronze, 100pts, $25 bonus
- **Annual Veteran** (365 days) - Platinum, 1000pts, $300 + benefits

#### Performance Excellence
- **First Cut** (1 service) - Bronze, 25pts, First Cut Certificate
- **Century Club** (100 services) - Platinum, 500pts, $150 milestone
- **Elite Professional** (500 services) - Diamond, 1500pts, $500 + recognition

#### Consistency & Quality
- **Daily Achiever** (3+ services/day) - Repeatable, Bronze, 15pts
- **Reliability Expert** (8 weeks consistent) - Gold, 300pts, Half day off
- **Quality Craftsman** (80%+ retention) - Gold, 300pts, $60 bonus

### Business Benefits
- **Employee Retention**: Clear career progression and meaningful rewards
- **Performance Improvement**: Focus on quality and consistency
- **Reduced Turnover**: Long-term loyalty incentives
- **Better Service Quality**: Client-focused achievement goals
- **Transparent Recognition**: Automatic, fair tracking system

## 📁 Project Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── admin/               # Admin-only pages
│   │   │   ├── achievements/    # Achievement management
│   │   │   ├── barbers/         # Barber management
│   │   │   ├── clients/         # Client management
│   │   │   ├── reservations/    # Reservation management with alerts
│   │   │   └── leaderboard/     # Full analytics leaderboard
│   │   ├── barber/              # Barber-only pages
│   │   │   ├── achievements/    # Personal achievement tracking
│   │   │   ├── scanner/         # QR code scanning
│   │   │   ├── visits/          # Visit history
│   │   │   └── leaderboard/     # Privacy-focused leaderboard
│   │   └── client/              # Client-facing pages
│   │       ├── reservations/    # Client reservation management
│   │       │   └── new/         # New reservation booking
│   │       ├── history/         # Visit history
│   │       ├── qrcode/          # QR code access
│   │       └── rewards/         # Loyalty rewards
│   ├── (landing)/               # Public landing page
│   ├── reservations/new/        # Guest reservation booking
│   ├── api/                     # API routes
│   │   ├── admin/               # Admin APIs
│   │   │   ├── achievements/    # Achievement CRUD
│   │   │   └── barbers/         # Barber management
│   │   ├── barber/              # Barber-specific APIs
│   │   │   ├── achievements/    # Achievement progress
│   │   │   └── leaderboard/     # Privacy-focused rankings
│   │   ├── reservations/        # Reservation management APIs
│   │   └── clients/             # Client management APIs
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── admin/                   # Admin-specific components
│   │   ├── achievements/        # Achievement management UI
│   │   └── barbers/             # Barber management UI
│   ├── shared/                  # Shared components
│   └── ui/                      # Reusable UI components
├── lib/                         # Utility libraries
│   ├── db/                      # Database layer
│   │   ├── api/                 # Database API functions
│   │   │   └── achievementEngine.ts  # Achievement calculation engine
│   │   └── models/              # Database models
│   │       └── reservation.ts   # Reservation data model
│   └── utils/                   # Helper utilities
└── middleware.ts                # Route protection middleware
```

## 🔧 API Documentation

### Reservation System APIs
- `GET /api/reservations` - List reservations with filtering and pagination
- `POST /api/reservations` - Create guest or client reservations
- `PUT /api/reservations/[id]` - Update reservation status
- `GET /api/reservations/stats` - Real-time reservation statistics

### Achievement System APIs
- `GET /api/admin/achievements` - List and manage all achievements
- `POST /api/admin/achievements` - Create new achievements with advanced options
- `GET /api/barber/achievements` - Get barber's achievement progress
- `POST /api/clients/[id]/visit` - Record visit (auto-updates achievements)

### Barber Management APIs
- `GET /api/admin/barbers` - List all barbers with statistics
- `POST /api/admin/barbers` - Create new barber profiles
- `GET /api/admin/barbers/[id]/stats` - Detailed barber analytics

### Analytics APIs
- `GET /api/admin/leaderboard` - Complete performance leaderboard
- `GET /api/barber/leaderboard` - Privacy-focused barber rankings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

## 🌟 Key Differentiators

### Employee-First Design
- **No revenue pressure** on barbers through achievement system
- **Privacy-focused** barber leaderboard excludes financial data
- **Meaningful rewards** beyond monetary compensation
- **Clear career progression** through tier system

### Advanced Automation
- **Real-time achievement tracking** with every visit
- **Automatic progress calculation** across multiple metrics
- **Smart barber attribution** for accurate statistics
- **Background processing** with minimal performance impact

### Comprehensive Management
- **Visual achievement builder** for easy administration
- **Flexible reward system** with multiple types
- **Role-based interfaces** tailored to user needs
- **Export capabilities** for business intelligence

This system represents a complete solution for modern barbershop management with a focus on employee satisfaction, customer loyalty, and business growth through advanced technology and thoughtful design.
