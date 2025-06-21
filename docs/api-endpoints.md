# API Endpoints Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the Barbaros Barbershop application. The API follows RESTful conventions and returns JSON responses.

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://barbaros-app.vercel.app/api`

## Authentication

### Admin Authentication
Most admin endpoints require authentication. Include the session token in requests:

```javascript
// Using fetch with authentication
const response = await fetch('/api/admin/endpoint', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken}`
  }
});
```

## Error Responses

All endpoints return standardized error responses:

```typescript
{
  success: false,
  message: string,           // Human-readable error message
  error?: string,            // Technical error details
  code?: number              // Custom error code
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Analytics Endpoints

### Overview Analytics

#### GET `/api/admin/analytics/overview`

Retrieves comprehensive business metrics and KPIs for the specified time period.

**Authentication**: Admin required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Start date (ISO format). Default: 30 days ago |
| `endDate` | string | No | End date (ISO format). Default: today |

**Request Example:**
```bash
GET /api/admin/analytics/overview?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```typescript
{
  success: true,
  metrics: {
    // Client Metrics
    totalClients: number,              // Total registered clients
    activeClients: number,             // Clients with visits in last 30 days
    newClientsThisMonth: number,       // New registrations in period
    clientGrowthPercentage: number,    // Growth vs previous period
    
    // Visit Metrics
    totalVisits: number,               // Total visits ever
    visitsThisMonth: number,           // Visits in current period
    visitGrowthPercentage: number,     // Growth vs previous period
    averageVisitsPerClient: number,    // Visits/client ratio
    
    // Revenue Metrics
    totalRevenue: number,              // Total revenue ever
    revenueThisMonth: number,          // Revenue in current period
    revenueGrowthPercentage: number,   // Growth vs previous period
    averageVisitValue: number,         // Average spending per visit
    
    // Service Metrics
    totalServices: number,             // Active services count
    popularService: string,            // Most booked service name
    
    // Loyalty Metrics
    loyaltyMembersCount: number,       // Active loyalty members
    loyaltyParticipationRate: number,  // Participation percentage
    rewardsRedeemed: number,           // Total rewards redeemed
    
    // Business Health
    businessHealthScore: number        // Overall health score (0-100)
  }
}
```

**Response Time**: ~200-500ms  
**Cache Duration**: 5 minutes

---

### Client Growth Analytics

#### GET `/api/admin/analytics/client-growth`

Provides detailed client acquisition and retention data over time.

**Authentication**: Admin required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Analysis start date |
| `endDate` | string | No | Analysis end date |
| `period` | string | No | Grouping: 'daily', 'weekly', 'monthly'. Default: 'monthly' |

**Request Example:**
```bash
GET /api/admin/analytics/client-growth?startDate=2024-01-01&endDate=2024-03-31&period=monthly
```

**Response:**
```typescript
{
  success: true,
  growthData: Array<{
    date: string,                      // Period identifier (YYYY-MM, YYYY-MM-DD, etc.)
    newClients: number,                // New client registrations
    totalClients: number,              // Cumulative client count
    activeClients: number,             // Active clients in period
    retentionRate?: number,            // Client retention percentage
    churnRate?: number                 // Client churn percentage
  }>,
  insights: {
    averageGrowthRate: number,         // Average growth per period
    bestPerformingPeriod: string,      // Highest growth period
    retentionTrend: 'improving' | 'declining' | 'stable',
    predictedNextPeriod: number        // Forecasted new clients
  }
}
```

**Business Rules:**
- Active clients = clients with visits in last 30 days
- Retention rate = returning clients / total clients from previous period
- Growth rate = (current - previous) / previous * 100

---

### Service Popularity Analytics

#### GET `/api/admin/analytics/service-popularity`

Analyzes service performance, popularity trends, and revenue contribution.

**Authentication**: Admin required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Analysis start date |
| `endDate` | string | No | Analysis end date |
| `sortBy` | string | No | Sort: 'bookings', 'revenue', 'clients', 'trend'. Default: 'bookings' |
| `category` | string | No | Filter by service category or 'all'. Default: 'all' |

**Request Example:**
```bash
GET /api/admin/analytics/service-popularity?startDate=2024-01-01&endDate=2024-01-31&sortBy=revenue&category=all
```

**Response:**
```typescript
{
  success: true,
  services: Array<{
    serviceId: string,                 // Service unique identifier
    serviceName: string,               // Service display name
    category: string,                  // Service category
    
    // Performance Metrics
    totalBookings: number,             // Total bookings in period
    totalRevenue: number,              // Total revenue generated
    averagePrice: number,              // Average price per booking
    uniqueClients: number,             // Unique clients served
    
    // Trend Analysis
    trendPercentage: number,           // Growth vs previous period
    lastMonthBookings: number,         // Previous month performance
    thisMonthBookings: number,         // Current month performance
    
    // Quality Metrics
    averageRating?: number,            // Customer satisfaction (1-5)
    repeatClientRate?: number,         // Percentage of repeat clients
    
    // Business Intelligence
    profitMargin?: number,             // Profit margin percentage
    marketShare?: number,              // Share of total bookings
    seasonalityIndex?: number          // Seasonal demand index
  }>,
  categories: string[],                // Available categories
  summary: {
    totalBookings: number,             // Period total bookings
    totalRevenue: number,              // Period total revenue
    averageServiceValue: number,       // Average revenue per service
    topPerformer: string,              // Best performing service
    fastestGrowing: string             // Highest growth service
  }
}
```

**Sorting Options:**
- `bookings`: Sort by total number of bookings
- `revenue`: Sort by total revenue generated
- `clients`: Sort by number of unique clients
- `trend`: Sort by growth percentage

---

### Visit Frequency Analytics

#### GET `/api/admin/analytics/visit-frequency`

Analyzes visit patterns, peak times, and client behavior for operational optimization.

**Authentication**: Admin required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Analysis start date |
| `endDate` | string | No | Analysis end date |
| `frequency` | string | No | Filter: 'all', 'high', 'medium', 'low'. Default: 'all' |

**Request Example:**
```bash
GET /api/admin/analytics/visit-frequency?startDate=2024-01-01&endDate=2024-01-31&frequency=all
```

**Response:**
```typescript
{
  success: true,
  frequencyData: {
    period: string,                    // Analysis period description
    totalVisits: number,               // Total visits in period
    uniqueClients: number,             // Unique clients served
    averageVisitsPerClient: number,    // Average visits per client
    peakHour: string,                  // Busiest hour (e.g., "14:00")
    peakDay: string,                   // Busiest day (e.g., "Saturday")
    
    // Time Distribution
    hourlyDistribution: Array<{
      hour: number,                    // Hour (0-23)
      visits: number,                  // Visit count
      averageWaitTime?: number,        // Average wait time in minutes
      staffUtilization?: number        // Staff utilization percentage
    }>,
    
    dailyDistribution: Array<{
      day: string,                     // Day name (Monday, Tuesday, etc.)
      visits: number,                  // Visit count
      averageRevenue?: number,         // Average revenue per day
      clientSatisfaction?: number      // Average satisfaction score
    }>,
    
    weeklyPattern: Array<{
      week: string,                    // Week identifier
      visits: number,                  // Visit count
      trend: 'up' | 'down' | 'stable' // Trend direction
    }>
  },
  
  clientPatterns: Array<{
    clientId: string,                  // Client identifier
    clientName: string,                // Client display name
    totalVisits: number,               // Total visits in period
    averageDaysBetweenVisits: number,  // Visit frequency in days
    lastVisit: string,                 // Last visit date (ISO format)
    frequency: 'high' | 'medium' | 'low', // Frequency tier
    pattern: 'regular' | 'irregular' | 'new', // Visit pattern
    
    // Behavioral Insights
    preferredTimeSlot?: string,        // Most common booking time
    preferredDay?: string,             // Most common booking day
    loyaltySegment?: string,           // Client loyalty category
    churnRisk?: 'low' | 'medium' | 'high' // Churn probability
  }>,
  
  insights: {
    busyPeriods: Array<{
      timeRange: string,               // Time period description
      utilizationRate: number,         // Capacity utilization percentage
      recommendedAction: string        // Business recommendation
    }>,
    optimizationOpportunities: Array<{
      area: string,                    // Optimization area
      impact: 'high' | 'medium' | 'low', // Potential impact
      description: string              // Detailed description
    }>
  }
}
```

**Frequency Definitions:**
- **High**: 4+ visits per month (< 7 days between visits)
- **Medium**: 2-3 visits per month (7-15 days between visits)
- **Low**: 1 visit per month (> 15 days between visits)

## Client Management Endpoints

### Get All Clients

#### GET `/api/clients`

Retrieves a paginated list of all clients with optional filtering and sorting.

**Authentication**: Admin required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (1-based). Default: 1 |
| `limit` | number | No | Items per page (max 100). Default: 20 |
| `search` | string | No | Search in name, email, phone |
| `sortBy` | string | No | Sort field: 'name', 'email', 'createdAt', 'lastVisit' |
| `sortOrder` | string | No | Sort order: 'asc', 'desc'. Default: 'desc' |
| `loyaltyStatus` | string | No | Filter by loyalty status |

**Request Example:**
```bash
GET /api/clients?page=1&limit=20&search=john&sortBy=createdAt&sortOrder=desc
```

**Response:**
```typescript
{
  success: true,
  clients: Array<{
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    dateOfBirth?: string,
    address?: string,
    notes?: string,
    qrCode: string,
    
    // Analytics Data
    createdAt: string,
    totalLifetimeVisits: number,
    currentProgressVisits: number,
    loyaltyStatus: 'new' | 'active' | 'milestone_reached' | 'inactive',
    selectedReward?: {
      _id: string,
      name: string,
      visitsRequired: number
    },
    nextRewardEligibleAt?: number,
    rewardsRedeemed: number,
    lastVisitDate?: string,
    totalSpent: number,
    averageVisitValue: number
  }>,
  pagination: {
    currentPage: number,
    totalPages: number,
    totalClients: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  }
}
```

---

### Create Client

#### POST `/api/clients`

Creates a new client account with automatic QR code generation.

**Authentication**: Admin required

**Request Body:**
```typescript
{
  firstName: string,        // Required, 2-50 characters
  lastName: string,         // Required, 2-50 characters
  email: string,            // Required, valid email format
  phone: string,            // Required, 10-15 digits
  password: string,         // Required, min 6 characters
  dateOfBirth?: string,     // Optional, ISO date format
  address?: string,         // Optional, max 200 characters
  notes?: string            // Optional, max 500 characters
}
```

**Response:**
```typescript
{
  success: true,
  client: {
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    qrCode: string,           // Auto-generated unique QR code
    createdAt: string,
    loyaltyStatus: 'new',
    totalLifetimeVisits: 0,
    currentProgressVisits: 0
  }
}
```

**Validation Rules:**
- Email must be unique
- Phone must be unique
- Password is hashed before storage
- QR code is automatically generated and unique

---

### Get Client by ID

#### GET `/api/clients/[id]`

Retrieves detailed information for a specific client.

**Authentication**: Admin required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Client MongoDB ObjectId |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `includeVisits` | boolean | No | Include visit history. Default: false |
| `includeRewards` | boolean | No | Include rewards info. Default: false |

**Request Example:**
```bash
GET /api/clients/507f1f77bcf86cd799439011?includeVisits=true&includeRewards=true
```

**Response:**
```typescript
{
  success: true,
  client: {
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    dateOfBirth?: string,
    address?: string,
    notes?: string,
    qrCode: string,
    
    // Loyalty Information
    loyaltyStatus: string,
    loyaltyJoinDate?: string,
    selectedReward?: {
      _id: string,
      name: string,
      description: string,
      visitsRequired: number
    },
    selectedRewardStartVisits?: number,
    totalLifetimeVisits: number,
    currentProgressVisits: number,
    nextRewardEligibleAt?: number,
    rewardsRedeemed: number,
    
    // Visit History (if includeVisits=true)
    visits?: Array<{
      _id: string,
      visitDate: string,
      services: Array<{
        serviceName: string,
        price: number
      }>,
      totalPrice: number,
      notes?: string
    }>,
    
    // Rewards Information (if includeRewards=true)
    availableRewards?: Array<{
      _id: string,
      name: string,
      description: string,
      visitsRequired: number,
      isEligible: boolean
    }>,
    
    // Analytics
    createdAt: string,
    updatedAt: string,
    lastVisitDate?: string,
    totalSpent: number,
    averageVisitValue: number
  }
}
```

---

### Update Client

#### PUT `/api/clients/[id]`

Updates client information and profile data.

**Authentication**: Admin required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Client MongoDB ObjectId |

**Request Body:**
```typescript
{
  firstName?: string,       // 2-50 characters
  lastName?: string,        // 2-50 characters
  email?: string,           // Valid email format, must be unique
  phone?: string,           // 10-15 digits, must be unique
  dateOfBirth?: string,     // ISO date format
  address?: string,         // Max 200 characters
  notes?: string,           // Max 500 characters
  loyaltyStatus?: 'new' | 'active' | 'milestone_reached' | 'inactive'
}
```

**Response:**
```typescript
{
  success: true,
  client: {
    // Updated client object with all fields
  }
}
```

---

### Delete Client

#### DELETE `/api/clients/[id]`

Permanently deletes a client and all associated data.

**Authentication**: Admin required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Client MongoDB ObjectId |

**Response:**
```typescript
{
  success: true,
  message: "Client deleted successfully"
}
```

**⚠️ Warning**: This action permanently deletes:
- Client profile data
- All visit history
- Loyalty program progress
- QR code associations

## Visit Management Endpoints

### Record New Visit

#### POST `/api/clients/[id]/visit`

Records a new visit for a client with services and loyalty tracking.

**Authentication**: Admin required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Client MongoDB ObjectId |

**Request Body:**
```typescript
{
  services: Array<{
    serviceId: string,        // Service MongoDB ObjectId
    price: number,            // Service price at time of visit
    duration?: number         // Service duration in minutes
  }>,
  totalPrice: number,         // Total visit cost
  notes?: string,             // Visit notes (max 500 characters)
  barber?: string,            // Staff member name
  visitDate?: string,         // ISO date format (default: now)
  paymentMethod?: 'cash' | 'card' | 'digital'
}
```

**Response:**
```typescript
{
  success: true,
  visit: {
    _id: string,
    clientId: string,
    visitDate: string,
    services: Array<{
      serviceId: string,
      serviceName: string,
      price: number,
      duration?: number
    }>,
    totalPrice: number,
    notes?: string,
    barber?: string
  },
  loyaltyUpdate: {
    previousVisits: number,
    newVisits: number,
    progressToNextReward: number,
    rewardEarned?: {
      _id: string,
      name: string,
      description: string
    }
  }
}
```

**Business Logic:**
- Automatically updates client's loyalty progress
- Calculates progress toward selected reward
- Updates client's total spent and average visit value
- Records visit timestamp and analytics data

---

### Get Client Visits

#### GET `/api/clients/[id]/visits`

Retrieves paginated visit history for a specific client.

**Authentication**: Admin required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Client MongoDB ObjectId |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (1-based). Default: 1 |
| `limit` | number | No | Items per page (max 50). Default: 20 |
| `startDate` | string | No | Filter visits from date (ISO format) |
| `endDate` | string | No | Filter visits to date (ISO format) |
| `serviceId` | string | No | Filter by specific service |

**Request Example:**
```bash
GET /api/clients/507f1f77bcf86cd799439011/visits?page=1&limit=10&startDate=2024-01-01
```

**Response:**
```typescript
{
  success: true,
  visits: Array<{
    _id: string,
    visitDate: string,
    services: Array<{
      serviceId: string,
      serviceName: string,
      price: number,
      duration?: number,
      category?: string
    }>,
    totalPrice: number,
    notes?: string,
    barber?: string,
    duration?: number,
    paymentMethod?: string,
    
    // Analytics Data
    createdAt: string,
    dayOfWeek: string,
    hourOfDay: number,
    visitType: string
  }>,
  pagination: {
    currentPage: number,
    totalPages: number,
    totalVisits: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  },
  summary: {
    totalSpent: number,
    averageVisitValue: number,
    totalVisits: number,
    mostFrequentService: string,
    visitFrequency: number        // Average days between visits
  }
}
```

---

### Export Client Visits

#### GET `/api/clients/[id]/visits/export`

Exports client visit history in CSV format for reporting and analysis.

**Authentication**: Admin required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Client MongoDB ObjectId |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | Export format: 'csv', 'json'. Default: 'csv' |
| `startDate` | string | No | Filter visits from date |
| `endDate` | string | No | Filter visits to date |

**Response Headers:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="client-visits-{clientName}-{date}.csv"
```

**CSV Format:**
```csv
Date,Services,Total Price,Barber,Notes,Payment Method
2024-01-15,Haircut + Beard Trim,35.00,John,Regular trim,Card
2024-02-01,Haircut,25.00,Mike,Short cut,Cash
```

## Service Management Endpoints

### Get All Services

#### GET `/api/services`

Retrieves all services with optional category filtering and analytics data.

**Authentication**: Admin required (for full data), Public (for basic service list)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by service category |
| `active` | boolean | No | Filter by active status. Default: true |
| `includeAnalytics` | boolean | No | Include performance data (admin only) |

**Request Example:**
```bash
GET /api/services?category=haircut&active=true&includeAnalytics=true
```

**Response:**
```typescript
{
  success: true,
  services: Array<{
    _id: string,
    name: string,
    description: string,
    price: number,
    duration: number,              // Duration in minutes
    category: string,
    isActive: boolean,
    
    // Analytics Data (if includeAnalytics=true and admin)
    totalBookings?: number,
    totalRevenue?: number,
    averageRating?: number,
    popularityRank?: number,
    monthlyGrowth?: number,
    
    // Timestamps
    createdAt: string,
    updatedAt: string
  }>,
  categories: string[]             // Available service categories
}
```

---

### Create Service

#### POST `/api/services`

Creates a new service offering.

**Authentication**: Admin required

**Request Body:**
```typescript
{
  name: string,                   // Required, 2-100 characters, unique
  description: string,            // Required, max 500 characters
  price: number,                  // Required, positive number
  duration: number,               // Required, duration in minutes
  category: string,               // Required, service category
  isActive?: boolean              // Optional, default: true
}
```

**Response:**
```typescript
{
  success: true,
  service: {
    _id: string,
    name: string,
    description: string,
    price: number,
    duration: number,
    category: string,
    isActive: boolean,
    createdAt: string,
    
    // Initial Analytics
    totalBookings: 0,
    totalRevenue: 0
  }
}
```

---

### Update Service

#### PUT `/api/services/[id]`

Updates an existing service.

**Authentication**: Admin required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Service MongoDB ObjectId |

**Request Body:**
```typescript
{
  name?: string,                  // 2-100 characters, unique
  description?: string,           // Max 500 characters
  price?: number,                 // Positive number
  duration?: number,              // Duration in minutes
  category?: string,              // Service category
  isActive?: boolean              // Service availability
}
```

**Response:**
```typescript
{
  success: true,
  service: {
    // Updated service object with all fields
  }
}
```

---

### Get Service Analytics

#### GET `/api/services/[id]/popularity`

Retrieves detailed analytics for a specific service.

**Authentication**: Admin required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Service MongoDB ObjectId |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Analysis start date |
| `endDate` | string | No | Analysis end date |
| `compareWith` | string | No | Compare with previous period |

**Response:**
```typescript
{
  success: true,
  analytics: {
    service: {
      _id: string,
      name: string,
      category: string
    },
    
    // Performance Metrics
    totalBookings: number,
    totalRevenue: number,
    averagePrice: number,
    uniqueClients: number,
    
    // Trend Analysis
    periodGrowth: number,           // Growth percentage
    previousPeriodBookings: number,
    currentPeriodBookings: number,
    
    // Time Patterns
    peakDays: string[],             // Most popular days
    peakHours: number[],            // Most popular hours
    seasonalTrends: Array<{
      period: string,
      bookings: number,
      revenue: number
    }>,
    
    // Client Analysis
    clientSegmentation: {
      new: number,                  // New clients served
      returning: number,            // Returning clients
      loyal: number                 // Loyal clients
    },
    
    // Business Intelligence
    marketShare: number,            // Percentage of total bookings
    profitMargin: number,           // Calculated profit margin
    recommendationScore: number     // Business recommendation score
  }
}
```

## Loyalty Program Endpoints

### Get Client Loyalty Status

#### GET `/api/loyalty/[clientId]`

Retrieves comprehensive loyalty program information for a client.

**Authentication**: Admin required or Client self-access

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | string | Yes | Client MongoDB ObjectId |

**Response:**
```typescript
{
  success: true,
  loyalty: {
    clientId: string,
    status: 'new' | 'active' | 'milestone_reached' | 'inactive',
    joinDate?: string,
    
    // Progress Information
    totalLifetimeVisits: number,
    currentProgressVisits: number,
    nextRewardEligibleAt?: number,
    rewardsRedeemed: number,
    
    // Current Reward Goal
    selectedReward?: {
      _id: string,
      name: string,
      description: string,
      visitsRequired: number,
      progressPercentage: number,    // Calculated progress (0-100)
      visitsRemaining: number        // Visits still needed
    },
    
    // Available Rewards
    availableRewards: Array<{
      _id: string,
      name: string,
      description: string,
      visitsRequired: number,
      isEligible: boolean,
      category: string
    }>,
    
    // Historical Data
    redemptionHistory: Array<{
      rewardId: string,
      rewardName: string,
      redeemedAt: string,
      visitsAtRedemption: number
    }>
  }
}
```

---

### Select Reward Goal

#### POST `/api/loyalty/[clientId]`

Allows a client to select a reward goal to work towards.

**Authentication**: Admin required or Client self-access

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | string | Yes | Client MongoDB ObjectId |

**Request Body:**
```typescript
{
  rewardId: string              // Reward MongoDB ObjectId
}
```

**Response:**
```typescript
{
  success: true,
  loyalty: {
    selectedReward: {
      _id: string,
      name: string,
      description: string,
      visitsRequired: number
    },
    currentProgress: number,      // Current visit count
    visitsRemaining: number,      // Visits needed to complete
    progressPercentage: number    // Progress percentage (0-100)
  }
}
```

---

### Redeem Reward

#### POST `/api/loyalty/[clientId]/redeem`

Processes a reward redemption for an eligible client.

**Authentication**: Admin required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | string | Yes | Client MongoDB ObjectId |

**Request Body:**
```typescript
{
  rewardId: string,             // Reward MongoDB ObjectId
  visitId?: string              // Optional: Associate with specific visit
}
```

**Response:**
```typescript
{
  success: true,
  redemption: {
    rewardId: string,
    rewardName: string,
    redeemedAt: string,
    visitsUsed: number,
    
    // Updated Loyalty Status
    newProgressVisits: number,    // Remaining progress visits
    nextEligibleAt: number,       // Next reward eligibility
    totalRedemptions: number      // Lifetime redemptions
  }
}
```

**Validation Rules:**
- Client must have sufficient visits for the reward
- Reward must be active and available
- Automatically resets progress counter after redemption

---

### Get Loyalty Statistics

#### GET `/api/loyalty/statistics`

Retrieves program-wide loyalty statistics and effectiveness metrics.

**Authentication**: Admin required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Analysis start date |
| `endDate` | string | No | Analysis end date |

**Response:**
```typescript
{
  success: true,
  statistics: {
    // Program Overview
    totalMembers: number,              // Total loyalty members
    activeMembers: number,             // Active members (recent activity)
    participationRate: number,         // Percentage of all clients
    
    // Engagement Metrics
    averageVisitsToRedemption: number, // Average visits before redemption
    redemptionRate: number,            // Percentage completing rewards
    memberRetentionRate: number,       // Member retention percentage
    
    // Popular Rewards
    topRewards: Array<{
      rewardId: string,
      rewardName: string,
      redemptions: number,
      popularityScore: number
    }>,
    
    // Business Impact
    incrementalRevenue: number,        // Revenue attributed to loyalty
    memberLifetimeValue: number,       // Average member lifetime value
    programROI: number,                // Return on investment percentage
    
    // Trend Analysis
    monthlyGrowth: number,             // Monthly member growth
    redemptionTrend: 'up' | 'down' | 'stable',
    programHealthScore: number         // Overall program health (0-100)
  }
}
```

## Reward Management Endpoints

### Get All Rewards

#### GET `/api/rewards`

Retrieves all available rewards with optional filtering.

**Authentication**: Public (basic info), Admin (full analytics)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by reward category |
| `active` | boolean | No | Filter by active status. Default: true |
| `includeAnalytics` | boolean | No | Include performance data (admin only) |

**Response:**
```typescript
{
  success: true,
  rewards: Array<{
    _id: string,
    name: string,
    description: string,
    visitsRequired: number,
    value?: number,
    category: 'service_discount' | 'free_service' | 'product' | 'experience',
    isActive: boolean,
    
    // Analytics Data (if includeAnalytics=true and admin)
    totalRedemptions?: number,
    popularityScore?: number,
    averageTimeToRedeem?: number,
    clientRetentionImpact?: number,
    
    // Timestamps
    createdAt: string,
    updatedAt: string
  }>
}
```

---

### Create Reward

#### POST `/api/rewards`

Creates a new loyalty program reward.

**Authentication**: Admin required

**Request Body:**
```typescript
{
  name: string,                                    // Required, 2-100 characters
  description: string,                             // Required, max 500 characters
  visitsRequired: number,                          // Required, positive integer
  value?: number,                                  // Optional, monetary value
  category: 'service_discount' | 'free_service' | 'product' | 'experience',
  isActive?: boolean                               // Optional, default: true
}
```

**Response:**
```typescript
{
  success: true,
  reward: {
    _id: string,
    name: string,
    description: string,
    visitsRequired: number,
    value?: number,
    category: string,
    isActive: boolean,
    createdAt: string,
    
    // Initial Analytics
    totalRedemptions: 0,
    popularityScore: 0
  }
}
```

---

### Update Reward

#### PUT `/api/rewards/[id]`

Updates an existing reward.

**Authentication**: Admin required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Reward MongoDB ObjectId |

**Request Body:**
```typescript
{
  name?: string,
  description?: string,
  visitsRequired?: number,
  value?: number,
  category?: 'service_discount' | 'free_service' | 'product' | 'experience',
  isActive?: boolean
}
```

---

### Get Reward Statistics

#### GET `/api/rewards/statistics`

Retrieves comprehensive reward performance analytics.

**Authentication**: Admin required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Analysis start date |
| `endDate` | string | No | Analysis end date |
| `rewardId` | string | No | Filter by specific reward |

**Response:**
```typescript
{
  success: true,
  statistics: {
    totalRewards: number,                    // Total active rewards
    totalRedemptions: number,                // Total redemptions in period
    averageTimeToRedeem: number,             // Average days to complete
    
    rewardPerformance: Array<{
      rewardId: string,
      rewardName: string,
      redemptions: number,
      conversionRate: number,               // Percentage of clients completing
      averageCompletionTime: number,        // Average days to complete
      clientRetentionImpact: number,        // Retention improvement %
      revenueImpact: number                 // Revenue generated per redemption
    }>,
    
    trends: {
      redemptionGrowth: number,             // Month-over-month growth
      popularityShifts: Array<{
        rewardId: string,
        rewardName: string,
        trendDirection: 'up' | 'down' | 'stable',
        changePercentage: number
      }>
    }
  }
}
```

## Authentication Endpoints

### Admin Login

#### POST `/api/admin-login`

Authenticates admin users for dashboard access.

**Request Body:**
```typescript
{
  username: string,               // Admin username
  password: string                // Admin password
}
```

**Response:**
```typescript
{
  success: true,
  token: string,                  // JWT authentication token
  user: {
    id: string,
    username: string,
    role: 'admin',
    permissions: string[]
  },
  expiresAt: string               // Token expiration timestamp
}
```

---

### Client Registration

#### POST `/api/register`

Registers a new client account.

**Request Body:**
```typescript
{
  firstName: string,              // Required, 2-50 characters
  lastName: string,               // Required, 2-50 characters
  email: string,                  // Required, valid email, unique
  phone: string,                  // Required, 10-15 digits, unique
  password: string,               // Required, min 6 characters
  dateOfBirth?: string,           // Optional, ISO date format
  address?: string                // Optional, max 200 characters
}
```

**Response:**
```typescript
{
  success: true,
  client: {
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
    qrCode: string,
    loyaltyStatus: 'new'
  },
  message: "Account created successfully"
}
```

## QR Code Endpoints

### Get Client by QR Code

#### GET `/api/clients/qrcode/[id]`

Retrieves client information using their unique QR code for scanner functionality.

**Authentication**: Admin required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Client's unique QR code |

**Response:**
```typescript
{
  success: true,
  client: {
    _id: string,
    firstName: string,
    lastName: string,
    phone: string,
    qrCode: string,
    
    // Loyalty Information
    loyaltyStatus: string,
    totalLifetimeVisits: number,
    currentProgressVisits: number,
    selectedReward?: {
      _id: string,
      name: string,
      visitsRequired: number,
      progressPercentage: number
    },
    
    // Recent Activity
    lastVisitDate?: string,
    averageVisitValue: number
  }
}
```

---

### Regenerate QR Code

#### POST `/api/clients/[id]/regenerate-qr`

Generates a new QR code for a client (security purposes).

**Authentication**: Admin required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Client MongoDB ObjectId |

**Response:**
```typescript
{
  success: true,
  newQrCode: string,              // New unique QR code
  message: "QR code regenerated successfully"
}
```

## Utility Endpoints

### Database Status

#### GET `/api/db-status`

Checks database connectivity and health for system monitoring.

**Authentication**: Admin required

**Response:**
```typescript
{
  success: true,
  status: 'connected' | 'disconnected' | 'error',
  details: {
    database: string,             // Database name
    collections: number,          // Number of collections
    totalDocuments: number,       // Total document count
    lastUpdate: string,           // Last successful connection
    version: string               // MongoDB version
  },
  performance: {
    responseTime: number,         // Connection response time (ms)
    avgQueryTime: number,         // Average query time (ms)
    activeConnections: number     // Current active connections
  }
}
```

---

### Seed Database

#### POST `/api/seed`

Seeds the database with sample data for development and testing.

**Authentication**: Admin required (Development only)

**⚠️ Warning**: This endpoint is only available in development environment.

**Request Body:**
```typescript
{
  clients?: number,               // Number of sample clients (default: 50)
  visits?: number,                // Number of sample visits (default: 200)
  services?: boolean,             // Create sample services (default: true)
  rewards?: boolean               // Create sample rewards (default: true)
}
```

**Response:**
```typescript
{
  success: true,
  summary: {
    clientsCreated: number,
    visitsCreated: number,
    servicesCreated: number,
    rewardsCreated: number
  },
  message: "Database seeded successfully"
}
```

## Rate Limiting

All API endpoints are subject to rate limiting to prevent abuse:

**Rate Limits:**
- **Public endpoints**: 100 requests per 15 minutes per IP
- **Admin endpoints**: 500 requests per 15 minutes per authenticated user
- **Analytics endpoints**: 100 requests per 15 minutes per authenticated user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

**Rate Limit Exceeded Response:**
```typescript
{
  success: false,
  message: "Rate limit exceeded",
  retryAfter: 900,              // Seconds until reset
  limit: 100,
  remaining: 0
}
```

## Error Handling

### Standard Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `DUPLICATE_ENTRY` | Unique constraint violation | 422 |
| `DATABASE_ERROR` | Database operation failed | 500 |
| `INTERNAL_ERROR` | Unexpected server error | 500 |

### Error Response Format

```typescript
{
  success: false,
  message: string,              // Human-readable error message
  error?: string,               // Technical error details
  code?: string,                // Error code for programmatic handling
  field?: string,               // Field name for validation errors
  details?: object              // Additional error context
}
```

### Validation Errors

For validation errors, additional field information is provided:

```typescript
{
  success: false,
  message: "Validation failed",
  code: "VALIDATION_ERROR",
  errors: Array<{
    field: string,              // Field name
    message: string,            // Error message
    value?: any                 // Invalid value provided
  }>
}
```

## Webhooks (Future Implementation)

Documentation for webhook endpoints that can be implemented for real-time integrations:

### Visit Recorded Webhook

**Endpoint**: `POST /api/webhooks/visit-recorded`

Triggered when a new visit is recorded.

**Payload:**
```typescript
{
  event: "visit.recorded",
  timestamp: string,
  data: {
    clientId: string,
    visitId: string,
    totalPrice: number,
    services: string[],
    loyaltyProgressUpdated: boolean
  }
}
```

### Reward Redeemed Webhook

**Endpoint**: `POST /api/webhooks/reward-redeemed`

Triggered when a client redeems a reward.

**Payload:**
```typescript
{
  event: "reward.redeemed",
  timestamp: string,
  data: {
    clientId: string,
    rewardId: string,
    redemptionId: string,
    visitsUsed: number
  }
}
```

## API Versioning

Future API versions will be available with URL versioning:

- **v1**: `/api/v1/...` (current default)
- **v2**: `/api/v2/...` (future)

Version-specific documentation will be maintained separately for breaking changes.