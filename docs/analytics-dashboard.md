# Analytics Dashboard Documentation

## Overview

The Analytics Dashboard provides comprehensive business intelligence and performance metrics for the Barbaros Barbershop application. It offers real-time insights into client growth, service popularity, visit patterns, and loyalty program effectiveness.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Models](#database-models)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [Data Flow](#data-flow)
6. [Implementation Guide](#implementation-guide)
7. [Configuration](#configuration)
8. [Performance Considerations](#performance-considerations)
9. [Troubleshooting](#troubleshooting)

## System Architecture

The analytics system follows a modular architecture with the following layers:

```
┌─────────────────────────────────────────┐
│            Frontend Layer               │
├─────────────────────────────────────────┤
│  • DashboardWidgets (Container)         │
│  • MetricsOverview                      │
│  • ClientGrowthChart                    │
│  • ServicePopularityChart               │
│  • VisitFrequencyChart                  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│             API Layer                   │
├─────────────────────────────────────────┤
│  • /api/admin/analytics/overview        │
│  • /api/admin/analytics/client-growth   │
│  • /api/admin/analytics/service-popularity │
│  • /api/admin/analytics/visit-frequency │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           Database Layer                │
├─────────────────────────────────────────┤
│  • Client Collection                    │
│  • Visit Collection                     │
│  • Service Collection                   │
│  • Reward Collection                    │
└─────────────────────────────────────────┘
```

## Database Models

### Client Model
Enhanced with analytics-specific fields for tracking business metrics.

```typescript
interface IClient {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth?: Date;
  address?: string;
  notes?: string;
  qrCode: string;
  
  // Analytics Fields
  createdAt: Date;                    // Client registration date
  updatedAt: Date;                    // Last profile update
  
  // Loyalty Program Fields
  loyaltyStatus: 'new' | 'active' | 'milestone_reached' | 'inactive';
  loyaltyJoinDate?: Date;
  selectedReward?: ObjectId;          // Current reward goal
  selectedRewardStartVisits?: number; // Visit count when reward selected
  totalLifetimeVisits: number;        // Total visits (never resets)
  currentProgressVisits: number;      // Visits since last redemption
  nextRewardEligibleAt?: number;      // Visit count for next eligibility
  rewardsRedeemed: number;           // Total rewards redeemed
  
  // Business Intelligence Fields
  lastVisitDate?: Date;              // Most recent visit
  averageDaysBetweenVisits?: number; // Calculated visit frequency
  totalSpent: number;                // Lifetime spending
  averageVisitValue: number;         // Average spending per visit
  visitFrequency: 'high' | 'medium' | 'low'; // Calculated frequency tier
  clientSegment: 'new' | 'regular' | 'vip' | 'at_risk'; // Business segment
}
```

### Visit Model
Core model for tracking service appointments and business transactions.

```typescript
interface IVisit {
  _id: ObjectId;
  clientId: ObjectId;               // Reference to Client
  visitDate: Date;                  // Service appointment date
  services: ServiceReceived[];      // Array of services provided
  totalPrice: number;               // Total visit cost
  notes?: string;                   // Visit notes/comments
  barber?: string;                  // Staff member who provided service
  duration?: number;                // Visit duration in minutes
  
  // Analytics Fields
  createdAt: Date;                  // Record creation timestamp
  updatedAt: Date;                  // Last modification timestamp
  
  // Business Intelligence Fields
  visitType: 'walk_in' | 'appointment' | 'loyalty_redemption';
  paymentMethod?: 'cash' | 'card' | 'digital';
  customerSatisfaction?: number;    // Rating 1-5
  seasonalPeriod?: string;          // Q1, Q2, Q3, Q4
  dayOfWeek: string;               // Monday, Tuesday, etc.
  hourOfDay: number;               // 0-23 for peak time analysis
  
  // Loyalty Integration
  loyaltyPointsEarned?: number;     // Points earned this visit
  rewardRedeemed?: ObjectId;        // Reward used during visit
  
  // Performance Metrics
  serviceEfficiency?: number;       // Minutes per service
  clientRetentionFlag?: boolean;    // First visit in 90+ days
}

interface ServiceReceived {
  serviceId: ObjectId;              // Reference to Service
  serviceName: string;              // Service name (denormalized)
  price: number;                    // Service price at time of visit
  duration?: number;                // Service duration
  category?: string;                // Service category
}
```

### Service Model
Enhanced for popularity and performance analytics.

```typescript
interface IService {
  _id: ObjectId;
  name: string;                     // Service name
  description: string;              // Service description
  price: number;                    // Current price
  duration: number;                 // Duration in minutes
  category: string;                 // Service category
  isActive: boolean;               // Service availability
  
  // Analytics Fields
  createdAt: Date;                  // Service creation date
  updatedAt: Date;                  // Last modification date
  
  // Performance Metrics
  totalBookings: number;            // Total times booked
  totalRevenue: number;             // Total revenue generated
  averageRating?: number;           // Customer satisfaction (1-5)
  popularityRank?: number;          // Relative popularity ranking
  
  // Business Intelligence
  seasonalDemand?: {               // Quarterly demand patterns
    Q1: number;
    Q2: number; 
    Q3: number;
    Q4: number;
  };
  peakHours?: number[];            // Hours of highest demand
  clientDemographics?: {           // Client segment preferences
    new: number;
    regular: number;
    vip: number;
  };
  
  // Trend Analysis
  monthlyGrowth?: number;          // Month-over-month growth %
  yearlyGrowth?: number;           // Year-over-year growth %
  lastMonthBookings?: number;      // Previous month bookings
  thisMonthBookings?: number;      // Current month bookings
}
```

### Reward Model
Loyalty program rewards with redemption analytics.

```typescript
interface IReward {
  _id: ObjectId;
  name: string;                     // Reward name
  description: string;              // Reward description
  visitsRequired: number;           // Visits needed to earn
  value?: number;                   // Monetary value
  category: 'service_discount' | 'free_service' | 'product' | 'experience';
  isActive: boolean;               // Reward availability
  
  // Analytics Fields
  createdAt: Date;
  updatedAt: Date;
  
  // Performance Metrics
  totalRedemptions: number;         // Total times redeemed
  averageTimeToRedeem?: number;     // Average days to complete
  popularityScore: number;          // Relative popularity (0-100)
  
  // Business Impact
  clientRetentionImpact?: number;   // Retention rate improvement %
  revenueImpact?: number;          // Revenue generated per redemption
  costToBusinesss?: number;        // Cost to provide reward
  
  // Usage Analytics
  redemptionsBySegment?: {         // Redemptions by client type
    new: number;
    regular: number;
    vip: number;
  };
  seasonalRedemptions?: {          // Quarterly redemption patterns
    Q1: number;
    Q2: number;
    Q3: number; 
    Q4: number;
  };
}
```

## API Endpoints

### Overview Analytics

#### GET `/api/admin/analytics/overview`

Returns comprehensive business metrics and KPIs.

**Query Parameters:**
- `startDate` (string): Start date for analysis period (ISO format)
- `endDate` (string): End date for analysis period (ISO format)

**Request Example:**
```bash
GET /api/admin/analytics/overview?startDate=2024-01-01&endDate=2024-01-31
```

**Response Schema:**
```typescript
{
  success: boolean;
  metrics: {
    // Client Metrics
    totalClients: number;                 // Total registered clients
    activeClients: number;                // Clients with visits in last 30 days
    newClientsThisMonth: number;          // New registrations in period
    clientGrowthPercentage: number;       // Growth vs previous period
    
    // Visit Metrics
    totalVisits: number;                  // Total visits ever
    visitsThisMonth: number;              // Visits in current period
    visitGrowthPercentage: number;        // Growth vs previous period
    averageVisitsPerClient: number;       // Visits/client ratio
    
    // Revenue Metrics
    totalRevenue: number;                 // Total revenue ever
    revenueThisMonth: number;             // Revenue in current period
    revenueGrowthPercentage: number;      // Growth vs previous period
    averageVisitValue: number;            // Average spending per visit
    
    // Service Metrics
    totalServices: number;                // Active services count
    popularService: string;               // Most booked service name
    
    // Loyalty Metrics
    loyaltyMembersCount: number;          // Active loyalty members
    loyaltyParticipationRate: number;     // Participation percentage
    rewardsRedeemed: number;              // Total rewards redeemed
  };
}
```

**Error Response:**
```typescript
{
  success: false;
  message: string;
  error?: string;
}
```

**Performance Notes:**
- Cached for 5 minutes to reduce database load
- Uses optimized aggregation pipelines
- Response time: ~200-500ms

---

### Client Growth Analytics

#### GET `/api/admin/analytics/client-growth`

Provides detailed client acquisition and retention data over time.

**Query Parameters:**
- `startDate` (string): Analysis start date
- `endDate` (string): Analysis end date  
- `period` (string): Grouping period - 'daily', 'weekly', 'monthly'

**Request Example:**
```bash
GET /api/admin/analytics/client-growth?startDate=2024-01-01&endDate=2024-03-31&period=monthly
```

**Response Schema:**
```typescript
{
  success: boolean;
  growthData: Array<{
    date: string;                        // Period identifier (YYYY-MM, YYYY-MM-DD, etc.)
    newClients: number;                  // New client registrations
    totalClients: number;                // Cumulative client count
    activeClients: number;               // Active clients in period
    retentionRate?: number;              // Client retention percentage
    churnRate?: number;                  // Client churn percentage
  }>;
  insights: {
    averageGrowthRate: number;           // Average growth per period
    bestPerformingPeriod: string;        // Highest growth period
    retentionTrend: 'improving' | 'declining' | 'stable';
    predictedNextPeriod: number;         // Forecasted new clients
  };
}
```

**Implementation Details:**
```typescript
// Database aggregation pipeline for monthly growth
const pipeline = [
  {
    $match: {
      createdAt: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      },
      newClients: { $sum: 1 },
      date: { 
        $first: { 
          $dateToString: { 
            format: '%Y-%m', 
            date: '$createdAt' 
          } 
        } 
      }
    }
  },
  { $sort: { '_id.year': 1, '_id.month': 1 } }
];
```

---

### Service Popularity Analytics

#### GET `/api/admin/analytics/service-popularity`

Analyzes service performance, popularity trends, and revenue contribution.

**Query Parameters:**
- `startDate` (string): Analysis start date
- `endDate` (string): Analysis end date
- `sortBy` (string): Sort criteria - 'bookings', 'revenue', 'clients', 'trend'
- `category` (string): Filter by service category or 'all'

**Request Example:**
```bash
GET /api/admin/analytics/service-popularity?startDate=2024-01-01&endDate=2024-01-31&sortBy=revenue&category=all
```

**Response Schema:**
```typescript
{
  success: boolean;
  services: Array<{
    serviceId: string;                   // Service unique identifier
    serviceName: string;                 // Service display name
    category: string;                    // Service category
    
    // Performance Metrics
    totalBookings: number;               // Total bookings in period
    totalRevenue: number;                // Total revenue generated
    averagePrice: number;                // Average price per booking
    uniqueClients: number;               // Unique clients served
    
    // Trend Analysis
    trendPercentage: number;             // Growth vs previous period
    lastMonthBookings: number;           // Previous month performance
    thisMonthBookings: number;           // Current month performance
    
    // Quality Metrics
    averageRating?: number;              // Customer satisfaction (1-5)
    repeatClientRate?: number;           // Percentage of repeat clients
    
    // Business Intelligence
    profitMargin?: number;               // Profit margin percentage
    marketShare?: number;                // Share of total bookings
    seasonalityIndex?: number;           // Seasonal demand index
  }>;
  categories: string[];                  // Available categories
  summary: {
    totalBookings: number;               // Period total bookings
    totalRevenue: number;                // Period total revenue
    averageServiceValue: number;         // Average revenue per service
    topPerformer: string;                // Best performing service
    fastestGrowing: string;              // Highest growth service
  };
}
```

**Database Queries:**
```typescript
// Service popularity aggregation
const servicePopularityPipeline = [
  {
    $match: {
      visitDate: { $gte: startDate, $lte: endDate }
    }
  },
  { $unwind: '$services' },
  {
    $group: {
      _id: '$services.serviceId',
      serviceName: { $first: '$services.serviceName' },
      totalBookings: { $sum: 1 },
      totalRevenue: { $sum: '$services.price' },
      uniqueClients: { $addToSet: '$clientId' },
      averagePrice: { $avg: '$services.price' }
    }
  },
  {
    $addFields: {
      uniqueClients: { $size: '$uniqueClients' }
    }
  },
  { $sort: { totalBookings: -1 } }
];
```

---

### Visit Frequency Analytics

#### GET `/api/admin/analytics/visit-frequency`

Analyzes visit patterns, peak times, and client behavior.

**Query Parameters:**
- `startDate` (string): Analysis start date
- `endDate` (string): Analysis end date
- `frequency` (string): Filter by frequency tier - 'all', 'high', 'medium', 'low'

**Request Example:**
```bash
GET /api/admin/analytics/visit-frequency?startDate=2024-01-01&endDate=2024-01-31&frequency=all
```

**Response Schema:**
```typescript
{
  success: boolean;
  frequencyData: {
    period: string;                      // Analysis period description
    totalVisits: number;                 // Total visits in period
    uniqueClients: number;               // Unique clients served
    averageVisitsPerClient: number;      // Average visits per client
    peakHour: string;                    // Busiest hour (e.g., "14:00")
    peakDay: string;                     // Busiest day (e.g., "Saturday")
    
    // Time Distribution
    hourlyDistribution: Array<{
      hour: number;                      // Hour (0-23)
      visits: number;                    // Visit count
      averageWaitTime?: number;          // Average wait time
      staffUtilization?: number;         // Staff utilization %
    }>;
    
    dailyDistribution: Array<{
      day: string;                       // Day name
      visits: number;                    // Visit count
      averageRevenue?: number;           // Average revenue per day
      clientSatisfaction?: number;       // Average satisfaction score
    }>;
    
    weeklyPattern: Array<{
      week: string;                      // Week identifier
      visits: number;                    // Visit count
      trend: 'up' | 'down' | 'stable';  // Trend direction
    }>;
  };
  
  clientPatterns: Array<{
    clientId: string;                    // Client identifier
    clientName: string;                  // Client display name
    totalVisits: number;                 // Total visits in period
    averageDaysBetweenVisits: number;    // Visit frequency in days
    lastVisit: string;                   // Last visit date
    frequency: 'high' | 'medium' | 'low'; // Frequency tier
    pattern: 'regular' | 'irregular' | 'new'; // Visit pattern
    
    // Behavioral Insights
    preferredTimeSlot?: string;          // Most common booking time
    preferredDay?: string;               // Most common booking day
    loyaltySegment?: string;             // Client loyalty category
    churnRisk?: 'low' | 'medium' | 'high'; // Churn probability
  }>;
  
  insights: {
    busyPeriods: Array<{
      timeRange: string;                 // Time period description
      utilizationRate: number;           // Capacity utilization %
      recommendedAction: string;         // Business recommendation
    }>;
    optimizationOpportunities: Array<{
      area: string;                      // Optimization area
      impact: 'high' | 'medium' | 'low'; // Potential impact
      description: string;               // Detailed description
    }>;
  };
}
```

**Peak Time Analysis Query:**
```typescript
// Hourly visit distribution
const hourlyAnalytics = await Visit.aggregate([
  {
    $match: {
      visitDate: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $group: {
      _id: { $hour: '$visitDate' },
      visits: { $sum: 1 },
      averageRevenue: { $avg: '$totalPrice' },
      uniqueClients: { $addToSet: '$clientId' }
    }
  },
  {
    $addFields: {
      hour: '$_id',
      uniqueClients: { $size: '$uniqueClients' }
    }
  },
  { $sort: { visits: -1 } }
]);
```

## Frontend Components

### DashboardWidgets Container

Main container component that orchestrates all analytics widgets.

**Props:**
```typescript
interface DashboardWidgetsProps {
  initialDateRange?: {
    startDate: string;
    endDate: string;
  };
}
```

**Features:**
- Date range selection with quick presets
- Widget toggle controls
- Layout switching (grid/vertical)
- Export functionality
- Real-time data refresh

**Usage:**
```tsx
<DashboardWidgets 
  initialDateRange={{
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  }}
/>
```

### MetricsOverview Component

Displays key business metrics in a card-based layout.

**Features:**
- 8 core business metrics
- Trend indicators with growth percentages
- Color-coded performance indicators
- Responsive grid layout
- Real-time updates

**Implementation:**
```tsx
const MetricsOverview = ({ dateRange }: MetricsOverviewProps) => {
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
    
    const response = await fetch(`/api/admin/analytics/overview?${params}`);
    const data = await response.json();
    
    if (data.success) {
      setMetrics(data.metrics);
    }
  };

  // ... rendering logic
};
```

### ClientGrowthChart Component

Interactive visualization of client acquisition and retention.

**Features:**
- Multiple time period views (daily/weekly/monthly)
- Interactive bar charts with hover details
- Growth rate calculations
- Trend analysis with insights
- Export capabilities

### ServicePopularityChart Component

Service performance analysis with ranking and filtering.

**Features:**
- Multi-criteria sorting (bookings, revenue, clients, trends)
- Category-based filtering
- Visual performance bars
- Trend indicators
- Comparative analysis

### VisitFrequencyChart Component

Client behavior and visit pattern analysis.

**Features:**
- Multiple view modes (overview, hourly, daily, client patterns)
- Peak time identification
- Client frequency categorization
- Pattern recognition
- Business optimization insights

## Data Flow

### Real-time Data Pipeline

```
Client Interaction → Visit Recording → Database Update → Cache Invalidation → UI Refresh
```

1. **Data Collection**: Visit data captured through admin scanner
2. **Database Storage**: Structured data stored in MongoDB collections
3. **Aggregation**: Real-time aggregation pipelines calculate metrics
4. **Caching**: Results cached for performance optimization
5. **API Response**: Formatted data returned via REST endpoints
6. **Frontend Update**: Components update with new data

### Cache Strategy

**Cache Levels:**
- **L1 - MongoDB**: Database-level query result caching
- **L2 - Application**: In-memory caching for frequently accessed data
- **L3 - CDN**: Static asset caching for UI components

**Cache Invalidation:**
- **Time-based**: 5-minute TTL for metrics data
- **Event-based**: Immediate invalidation on data changes
- **Manual**: Admin-triggered cache refresh

## Implementation Guide

### Setting Up Analytics

1. **Database Setup**
```javascript
// Ensure proper indexes for analytics queries
db.visits.createIndex({ "visitDate": 1, "clientId": 1 });
db.visits.createIndex({ "services.serviceId": 1 });
db.clients.createIndex({ "createdAt": 1, "loyaltyStatus": 1 });
db.services.createIndex({ "category": 1, "isActive": 1 });
```

2. **Environment Configuration**
```env
# Analytics Configuration
ANALYTICS_CACHE_TTL=300
ANALYTICS_BATCH_SIZE=1000
ANALYTICS_ENABLE_REAL_TIME=true
```

3. **API Integration**
```typescript
// Initialize analytics service
import { AnalyticsService } from '@/lib/analytics';

const analytics = new AnalyticsService({
  cacheEnabled: true,
  batchSize: 1000,
  realTimeUpdates: true
});
```

### Component Integration

1. **Basic Usage**
```tsx
import DashboardWidgets from '@/components/admin/analytics/DashboardWidgets';

function AdminDashboard() {
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <DashboardWidgets />
    </div>
  );
}
```

2. **Custom Date Range**
```tsx
const customRange = {
  startDate: '2024-01-01',
  endDate: '2024-12-31'
};

<DashboardWidgets initialDateRange={customRange} />
```

3. **Event Handling**
```tsx
const handleDataRefresh = () => {
  // Custom refresh logic
  analytics.invalidateCache();
  // Trigger component refresh
};
```

## Configuration

### Analytics Settings

```typescript
interface AnalyticsConfig {
  // Data Processing
  batchSize: number;                    // Batch size for large queries
  cacheTimeout: number;                 // Cache TTL in seconds
  maxDateRange: number;                 // Maximum analysis period in days
  
  // Performance
  enableRealTimeUpdates: boolean;       // Real-time data updates
  enableAdvancedMetrics: boolean;       // Advanced calculations
  parallelProcessing: boolean;          // Parallel query execution
  
  // Export
  maxExportRecords: number;             // Maximum records per export
  exportFormats: string[];              // Supported export formats
  
  // Visualization
  defaultChartType: string;             // Default chart style
  animationDuration: number;            // Animation timing
  colorScheme: string;                  // Chart color palette
}
```

### Default Configuration

```typescript
const defaultConfig: AnalyticsConfig = {
  batchSize: 1000,
  cacheTimeout: 300,
  maxDateRange: 365,
  enableRealTimeUpdates: true,
  enableAdvancedMetrics: true,
  parallelProcessing: true,
  maxExportRecords: 10000,
  exportFormats: ['csv', 'json', 'pdf'],
  defaultChartType: 'bar',
  animationDuration: 300,
  colorScheme: 'default'
};
```

## Performance Considerations

### Database Optimization

1. **Indexing Strategy**
```javascript
// Primary indexes for analytics queries
db.visits.createIndex({ 
  "visitDate": 1, 
  "clientId": 1 
}, { background: true });

db.visits.createIndex({ 
  "services.serviceId": 1, 
  "visitDate": 1 
}, { background: true });

// Compound indexes for complex queries
db.clients.createIndex({ 
  "loyaltyStatus": 1, 
  "createdAt": 1,
  "totalLifetimeVisits": 1 
}, { background: true });
```

2. **Query Optimization**
```typescript
// Use aggregation pipelines for complex analytics
const optimizedPipeline = [
  { $match: { /* filter early */ } },
  { $project: { /* only needed fields */ } },
  { $group: { /* aggregate data */ } },
  { $sort: { /* sort last */ } },
  { $limit: 100 } // Limit results
];
```

3. **Connection Pooling**
```typescript
// MongoDB connection optimization
const mongoOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000
};
```

### Frontend Optimization

1. **Component Optimization**
```tsx
// Use React.memo for expensive components
const MetricsOverview = React.memo(({ dateRange }) => {
  // Component logic
});

// Virtualize large datasets
import { FixedSizeList as List } from 'react-window';
```

2. **Data Fetching**
```typescript
// Implement SWR for caching and revalidation
import useSWR from 'swr';

const { data, error } = useSWR(
  `/api/analytics/overview?${params}`,
  fetcher,
  { 
    refreshInterval: 300000, // 5 minutes
    revalidateOnFocus: false
  }
);
```

### Monitoring and Alerting

1. **Performance Metrics**
```typescript
// Track API response times
const analyticsMetrics = {
  avgResponseTime: 250, // ms
  p95ResponseTime: 500, // ms
  errorRate: 0.1, // %
  cacheHitRate: 85 // %
};
```

2. **Error Tracking**
```typescript
// Implement error boundary for analytics
class AnalyticsErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to monitoring service
    console.error('Analytics Error:', error, errorInfo);
  }
}
```

## Troubleshooting

### Common Issues

1. **Slow Query Performance**
```bash
# Check for missing indexes
db.visits.explain("executionStats").find({
  visitDate: { $gte: ISODate("2024-01-01") }
});

# Add missing indexes
db.visits.createIndex({ "visitDate": 1 });
```

2. **Memory Usage Issues**
```typescript
// Implement pagination for large datasets
const PAGE_SIZE = 100;
const pipeline = [
  { $match: query },
  { $skip: page * PAGE_SIZE },
  { $limit: PAGE_SIZE }
];
```

3. **Cache Invalidation Problems**
```typescript
// Manual cache clearing
const clearAnalyticsCache = async () => {
  await redis.del('analytics:*');
  console.log('Analytics cache cleared');
};
```

### Debug Mode

Enable debug logging for detailed analytics information:

```typescript
// Debug configuration
const debugConfig = {
  enableQueryLogging: true,
  enablePerformanceMetrics: true,
  logLevel: 'debug'
};

// Usage
if (process.env.NODE_ENV === 'development') {
  analytics.setDebugMode(true);
}
```

### Health Checks

Implement health monitoring for the analytics system:

```typescript
// Analytics health check endpoint
export async function GET() {
  try {
    const healthStatus = {
      database: await checkDatabaseConnection(),
      cache: await checkCacheConnection(),
      queries: await testAnalyticsQueries(),
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json({ 
      status: 'healthy', 
      details: healthStatus 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy', 
      error: error.message 
    }, { status: 500 });
  }
}
```

## Security Considerations

1. **Data Access Control**
```typescript
// Admin-only access middleware
export function withAdminAuth(handler) {
  return async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    return handler(req, res);
  };
}
```

2. **Data Sanitization**
```typescript
// Sanitize date range inputs
const sanitizeDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Validate date range
  if (end - start > 365 * 24 * 60 * 60 * 1000) {
    throw new Error('Date range cannot exceed 1 year');
  }
  
  return { start, end };
};
```

3. **Rate Limiting**
```typescript
// Implement rate limiting for analytics APIs
import rateLimit from 'express-rate-limit';

const analyticsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many analytics requests'
});
``` 