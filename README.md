# Barbaros - Advanced Barbershop Management System

## Overview
Barbaros is a comprehensive barbershop management platform featuring client management, loyalty programs, service tracking, and an advanced employee achievement system designed for maximum retention and motivation.

## 🚀 Key Features

### Enhanced Client Management System
- **Digital client profiles** with QR code generation
- **Advanced scanner interfaces** with modern UI and multiple input methods
- **Rich client overview** with loyalty progress and visit statistics  
- **Visit history tracking** with detailed service records and real data display
- **Enhanced loyalty point system** with improved validation logic
- **Client search and filtering** capabilities
- **View profile buttons** for quick access from admin panels
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

#### Admin Dashboard (Enhanced)
- **Comprehensive client management** with full CRUD operations
- **Enhanced scanner interface** with professional black/gray theme
- **View profile buttons** for direct client access
- **Rich client overview** with administrative controls
- **Barber profile management** and performance tracking
- **Achievement system administration** with visual builder
- **Reservation management** with real-time alerts and status tracking
- **Advanced analytics** including revenue and business metrics
- **Service and category management**
- **Complete leaderboard** with all performance metrics

#### Barber Dashboard (Redesigned)
- **Personal performance overview** with key statistics
- **Modern QR code scanner** with blue-purple gradient theme
- **Rich client overview** with loyalty progress visualization
- **Multi-method scanning** (camera, upload, manual search)
- **Streamlined visit recording** with automatic attribution
- **Enhanced reward redemption** with improved validation
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
2. **Enhanced scanner operations** with professional interface and rich client overview
3. **Client management** with view profile buttons and direct navigation
4. **Create barber profiles** with photos and essential information
5. **Manage achievement system** with visual builder and comprehensive options
6. **Reward validation** with enhanced logic and progress tracking

### Barber Functions  
1. **Login** with credentials (email or phone)
2. **Modern scanner interface** with blue-purple gradient theme
3. **Rich client overview** after scanning with loyalty progress
4. **Streamlined visit recording** with improved workflow
5. **Enhanced reward redemption** with proper validation
6. **Achievement tracking** with gamification elements

## 🆕 Recent Improvements (Latest Release)

### Scanner System Redesign
- **Complete UI overhaul** with modern gradients and animations
- **Enhanced client overview** with comprehensive information display
- **Multi-method scanning** support (QR camera, image upload, manual search)
- **Professional themes** (blue-purple for barbers, black-gray for admins)

### Bug Fixes & Enhancements
- **Fixed reward redemption validation** preventing premature redemptions
- **Eliminated duplicate toast notifications** for better user experience
- **Updated status badge text colors** to black for better readability
- **Replaced placeholder content** with real visit history data
- **Added view profile buttons** to admin client management

### Technical Improvements
- **Enhanced TypeScript interfaces** for better type safety
- **Parallel API calls** for improved loading performance
- **Better error handling** and user feedback
- **Improved component architecture** for maintainability
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

## Recent Updates ✨

### Enhanced Client Visit History (Latest)

The client visit history page has been completely redesigned with a modern, comprehensive interface that provides:

#### 🎨 Visual Enhancements
- **Beautiful gradient header** with barbershop branding
- **Dual view modes**: Cards and Timeline views for different user preferences
- **Distinct styling for reward redemptions** with golden/amber color scheme
- **Interactive hover effects** and smooth transitions
- **Responsive design** that works perfectly on all devices

#### 🔍 Advanced Filtering System
- **Date range filtering** for specific time periods
- **Service-based filtering** to find visits by service type
- **Barber filtering** to see visits with specific barbers
- **Reward type filtering** (All visits, Reward redemptions only, Regular visits only)
- **Smart filter combination** with clear all functionality

#### 📊 Comprehensive Statistics Dashboard
- **Total visits** with last visit information
- **Total amount spent** with average per visit
- **Rewards redemption tracking** with usage percentage
- **Total service time** with favorite barber information
- **Beautiful gradient cards** with relevant icons

#### 💎 Premium Features
- **Timeline view** with visual visit progression
- **Reward visit highlighting** with special badges and styling
- **Detailed visit modals** showing complete service breakdown
- **Export functionality** (CSV and JSON formats)
- **Smart pagination** with improved navigation
- **Real-time filtering** without page reloads

#### 🎯 User Experience Improvements
- **Intuitive navigation** between different view modes
- **Clear visual hierarchy** making information easy to scan
- **Contextual information** with relative time displays
- **Professional tooltips** and interactive elements
- **Accessibility-focused design** with proper contrast and focus states

#### 🔧 Technical Enhancements
- **Enhanced API filtering** supporting all new filter types
- **Optimized data fetching** with proper pagination
- **Type-safe interfaces** for all data structures
- **Error handling** with user-friendly messages
- **Performance optimizations** for large visit histories

The new visit history provides clients with a comprehensive view of their barbershop journey, making it easy to track their spending, favorite services, preferred barbers, and reward usage patterns.

## Core Features

### 🏪 Admin Dashboard
- Complete client management system
- Barber performance analytics
- Service management and pricing
- Loyalty program configuration
- Detailed reporting and insights

### ✂️ Barber Interface
- Client visit recording
- Service tracking
- Personal statistics
- Achievement system
- QR code scanning for client check-ins

### 👤 Client Portal
- Personal visit history (Enhanced!)
- Loyalty points tracking
- Reward redemption
- QR code for easy check-ins
- Service history analytics

### 🎯 Loyalty & Rewards System
- Automatic points calculation
- Flexible reward structures
- Achievement tracking
- Milestone celebrations
- Referral bonuses

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **UI Components**: Custom components with React Icons
- **Styling**: Tailwind CSS with custom gradients and animations

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Key Directories

- `/src/app` - Next.js 13+ app directory structure
- `/src/components` - Reusable UI components
- `/src/lib` - Database models and utility functions
- `/docs` - Comprehensive documentation

## Recent Performance Optimizations

- Database indexing for faster queries
- Enhanced security middleware
- API response caching for analytics endpoints
- Memory leak prevention in React components
- Query optimization with lean queries and field selection
- Rate limiting protection against abuse
- Enhanced input validation and sanitization
- Improved session security with proper token validation

### Database Performance
- **Text Search Indexes**: Full-text search capabilities for client lookup
- **Compound Indexes**: Optimized queries for common access patterns
- **Analytics Indexes**: Specialized indexes for reporting and dashboard queries
- **Background Index Creation**: Non-blocking index creation for production stability

### Security Enhancements
- **Rate Limiting**: 1000 requests per minute per IP address
- **Input Sanitization**: Protection against NoSQL injection attacks
- **Security Headers**: Comprehensive security headers on all responses
- **Enhanced Session Management**: Secure JWT token handling with proper validation
- **Password Security**: bcrypt hashing with increased salt rounds

### API Performance
- **Response Caching**: In-memory caching for expensive analytics operations
- **Query Optimization**: Lean queries and field selection for improved performance
- **Connection Pooling**: Optimized MongoDB connection management
- **Error Handling**: Graceful error handling without exposing sensitive data

## Contributing

Please read the development guide in `/docs/development-guide.md` for contribution guidelines.

## License

This project is proprietary software developed for Barbaros Barbershop.
