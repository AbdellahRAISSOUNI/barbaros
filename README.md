# Barbaros Barbershop Management System

## 🏆 Advanced Business Management Platform

A comprehensive, modern barbershop and salon management system featuring **advanced analytics dashboard**, client management, loyalty programs, and business intelligence tools designed to optimize operations and drive growth.

## ✨ Key Features

### 📊 **Advanced Analytics Dashboard**
- **Real-time Business Metrics**: Revenue, client growth, visit trends, and performance KPIs
- **Client Growth Analysis**: Acquisition tracking, retention rates, and churn prediction
- **Service Popularity Analytics**: Performance ranking, revenue analysis, and trend forecasting
- **Visit Frequency Intelligence**: Peak time identification and operational optimization
- **Customizable Widgets**: Personalized dashboard with date range filtering and export capabilities

### 🎯 **Smart Loyalty Program**
- **Flexible Reward System**: Customizable visit-based rewards and redemption tiers
- **Real-time Progress Tracking**: Live loyalty status monitoring for clients and admins
- **Automated Updates**: Seamless integration with visit recording system
- **Analytics Integration**: Program effectiveness metrics and engagement analysis

### 👥 **Comprehensive Client Management**
- **Complete Profiles**: Contact information, visit history, and preference tracking
- **QR Code Integration**: Quick client lookup and visit recording
- **Behavior Analytics**: Client segmentation, lifetime value, and frequency analysis
- **Communication Tools**: Email and SMS integration for appointments and promotions

### 🔧 **Professional Service Administration**
- **Dynamic Service Catalog**: Comprehensive offerings with pricing and categories
- **Performance Analytics**: Service popularity, revenue contribution, and optimization insights
- **Staff Management**: Barber assignments and performance tracking
- **Inventory Integration**: Supply tracking and cost analysis

### 📱 **Modern User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Collapsible Sidebar**: **NEW** Smooth animated navigation with state persistence
- **Admin Dashboard**: Comprehensive business management interface
- **Client Portal**: Self-service profile management and loyalty tracking
- **Real-time Updates**: Live data synchronization across all interfaces

## 🚀 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: NextAuth.js with secure session management
- **Analytics**: Custom analytics engine with real-time dashboards
- **Deployment**: Vercel with automatic CI/CD
- **Icons**: React Icons with comprehensive icon library

## 📈 Analytics Dashboard Screenshots

### Business Overview Dashboard
- **8 Core Business Metrics** with trend indicators and growth percentages
- **Real-time Performance Monitoring** with color-coded health indicators
- **Period Comparison Analysis** with automated insights and recommendations

### Client Growth Analytics
- **Interactive Time-based Tracking** (daily/weekly/monthly views)
- **Visual Growth Charts** with hover details and trend analysis
- **Retention Analysis** with actionable business insights

### Service Performance Analytics
- **Multi-criteria Rankings** (bookings, revenue, clients, trends)
- **Category Filtering** with comparative performance visualization
- **Profitability Analysis** with margin calculations and optimization recommendations

### Visit Frequency Intelligence
- **Peak Time Analysis** for operational optimization
- **Client Behavior Patterns** with frequency categorization
- **Operational Insights** for queue management and resource allocation

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/barbaros-app.git
   cd barbaros-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your MongoDB connection string and NextAuth secret
   ```

4. **Database setup**
   ```bash
   # Seed the database with sample data
   npm run seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Admin Dashboard**: http://localhost:3000/admin
   - **Client Portal**: http://localhost:3000/client

### Environment Variables

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Analytics (optional)
ANALYTICS_CACHE_TTL=300
ANALYTICS_ENABLE_REAL_TIME=true
```

## 📖 Documentation

### Core Documentation
- **[Development Guide](docs/development-guide.md)** - Complete setup and development guidelines
- **[Analytics Dashboard](docs/analytics-dashboard.md)** - Comprehensive analytics system documentation
- **[API Endpoints](docs/api-endpoints.md)** - Complete REST API reference
- **[Database Models](docs/database-models.md)** - Enhanced data models with analytics schema
- **[UI Components](docs/ui-components.md)** - **NEW** Comprehensive UI component system with collapsible sidebar

### Feature Documentation
- **[Loyalty Program](docs/loyalty-program.md)** - Client retention and rewards system
- **[Service Management](docs/service-management.md)** - Service catalog administration
- **[Visit Recording](docs/visit-recording-system.md)** - Client visit tracking and analytics
- **[Authentication](docs/authentication.md)** - Security and session management

## 🎮 Usage Examples

### Admin Dashboard - Analytics Overview
```typescript
// Access comprehensive business metrics
const metrics = await fetch('/api/admin/analytics/overview');
// Returns: revenue, client growth, visit trends, loyalty metrics
```

### Client Growth Analysis
```typescript
// Track client acquisition and retention
const growth = await fetch('/api/admin/analytics/client-growth?period=monthly');
// Returns: growth data, retention rates, insights
```

### Service Performance Analytics
```typescript
// Analyze service popularity and profitability
const services = await fetch('/api/admin/analytics/service-popularity?sortBy=revenue');
// Returns: ranked services, revenue analysis, trends
```

### Visit Frequency Intelligence
```typescript
// Optimize operations with visit pattern analysis
const patterns = await fetch('/api/admin/analytics/visit-frequency');
// Returns: peak times, client patterns, optimization insights
```

## 🎯 Business Benefits

### For Barbershop Owners
- **📊 Data-Driven Decisions**: Comprehensive analytics for informed business strategy
- **💰 Revenue Optimization**: Service performance analysis and pricing optimization
- **👥 Customer Retention**: Advanced loyalty program with engagement tracking
- **⏰ Operational Efficiency**: Peak time analysis and resource optimization
- **📈 Growth Tracking**: Real-time monitoring of business health and growth

### For Staff Members
- **🎯 Performance Insights**: Individual and team productivity metrics
- **👤 Client History**: Complete client profiles and visit history
- **📅 Optimized Scheduling**: Peak time identification for better planning
- **🏆 Goal Tracking**: Service-specific performance monitoring

### For Clients
- **🎁 Reward Program**: Transparent loyalty tracking with real-time progress
- **📱 Self-Service Portal**: Profile management and appointment history
- **📊 Personal Analytics**: Visit frequency and spending insights
- **🔄 Seamless Experience**: QR code integration for quick check-ins

## 🔒 Security Features

- **🔐 Multi-level Authentication**: Admin and client authentication systems
- **🛡️ Data Protection**: Encrypted passwords and secure data transmission
- **🚦 Access Control**: Role-based permissions and API rate limiting
- **📝 Audit Logging**: Comprehensive activity logging for security monitoring
- **🔄 Session Management**: Secure session handling with automatic expiration

## 🚀 Performance Optimizations

### Database Performance
- **📊 Optimized Indexes**: Strategic indexing for analytics queries
- **🔄 Connection Pooling**: Efficient database connection management
- **⚡ Query Optimization**: Optimized aggregation pipelines for analytics
- **💾 Caching Strategy**: Multi-level caching for improved response times

### Frontend Performance
- **📦 Code Splitting**: Dynamic imports for reduced bundle size
- **🖼️ Image Optimization**: Automatic optimization and lazy loading
- **💾 Intelligent Caching**: API response and static asset caching
- **🎯 Bundle Optimization**: Tree shaking and code optimization

## 🗄️ API Reference

### Analytics Endpoints
```bash
GET /api/admin/analytics/overview          # Business metrics overview
GET /api/admin/analytics/client-growth     # Client acquisition analytics
GET /api/admin/analytics/service-popularity # Service performance analytics
GET /api/admin/analytics/visit-frequency   # Visit pattern analysis
```

### Client Management
```bash
GET    /api/clients                        # List all clients
POST   /api/clients                        # Create new client
GET    /api/clients/[id]                   # Get client details
PUT    /api/clients/[id]                   # Update client
DELETE /api/clients/[id]                   # Delete client
GET    /api/clients/qrcode/[qr]           # Lookup by QR code
```

### Visit Management
```bash
POST   /api/clients/[id]/visit            # Record new visit
GET    /api/clients/[id]/visits           # Get visit history
GET    /api/clients/[id]/visits/export    # Export visit data
```

### Loyalty Program
```bash
GET    /api/loyalty/[clientId]            # Get loyalty status
POST   /api/loyalty/[clientId]            # Select reward goal
POST   /api/loyalty/[clientId]/redeem     # Redeem reward
GET    /api/loyalty/statistics            # Program analytics
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
npm run type-check   # TypeScript type checking
```

### Code Structure
```
src/
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Dashboard layouts
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/             # Admin dashboard components
│   ├── shared/            # Shared components
│   └── ui/                # UI components
├── lib/                   # Utilities and configurations
│   ├── db/                # Database models and APIs
│   ├── utils/             # Helper functions
│   └── validations/       # Input validation schemas
└── middleware.ts          # Next.js middleware
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test                   # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Coverage report
```

## 📦 Deployment

### Vercel Deployment (Recommended)
1. **Connect GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on git push to main branch

### Manual Deployment
```bash
npm run build             # Build production bundle
npm start                 # Start production server
```

### Environment Setup for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_secret
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Update documentation for new features
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the incredible React framework
- **MongoDB** for the flexible database solution
- **Vercel** for seamless deployment platform
- **React Icons** for comprehensive icon library
- **Tailwind CSS** for rapid UI development

## 📞 Support

### Documentation
- **[Complete Documentation](docs/index.md)** - Comprehensive guides and references
- **[API Documentation](docs/api-endpoints.md)** - REST API reference
- **[Analytics Guide](docs/analytics-dashboard.md)** - Analytics system documentation

### Community
- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Community support and questions
- **Email Support** - Direct technical assistance

---

**Built with ❤️ for the barbershop community**

*Empowering barbers and salon owners with modern business intelligence and management tools.*
