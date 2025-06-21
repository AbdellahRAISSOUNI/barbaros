# Database Models Documentation

## Overview

This document provides comprehensive documentation for all database models in the Barbaros Barbershop application. The database uses MongoDB with Mongoose ODM for schema validation and data modeling.

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Core Models](#core-models)
3. [Analytics Schema](#analytics-schema)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Data Validation](#data-validation)
7. [Migration Guidelines](#migration-guidelines)

## Database Architecture

### Technology Stack
- **Database**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose v8.x
- **Connection**: MongoDB Native Driver
- **Hosting**: MongoDB Atlas (M0 Sandbox for development)

### Collection Structure
```
barbaros_db/
├── clients              # Client profiles and loyalty data
├── visits               # Service visit records
├── services             # Available services catalog
├── service_categories   # Service categorization
├── rewards              # Loyalty program rewards
├── admins              # Admin user accounts
└── sessions            # Authentication sessions
```

## Core Models

### Client Model

The Client model stores customer information, loyalty program data, and business analytics.

```typescript
// Path: src/lib/db/models/client.ts

interface IClient {
  // Basic Information
  _id: ObjectId;
  firstName: string;              // 2-50 characters, required
  lastName: string;               // 2-50 characters, required
  email: string;                  // Valid email, unique, required
  phone: string;                  // 10-15 digits, unique, required
  password: string;               // Hashed password, min 6 chars
  
  // Optional Profile Data
  dateOfBirth?: Date;             // ISO date format
  address?: string;               // Max 200 characters
  notes?: string;                 // Admin notes, max 500 characters
  
  // System Fields
  qrCode: string;                 // Unique QR identifier
  createdAt: Date;                // Registration timestamp
  updatedAt: Date;                // Last profile update
  
  // Loyalty Program Fields
  loyaltyStatus: 'new' | 'active' | 'milestone_reached' | 'inactive';
  loyaltyJoinDate?: Date;         // When client joined loyalty program
  selectedReward?: ObjectId;       // Currently selected reward goal
  selectedRewardStartVisits?: number; // Visit count when reward selected
  totalLifetimeVisits: number;     // Total visits ever (never resets)
  currentProgressVisits: number;   // Visits since last redemption
  nextRewardEligibleAt?: number;   // Visit count for next eligibility
  rewardsRedeemed: number;         // Total rewards redeemed lifetime
  
  // Business Intelligence Fields
  lastVisitDate?: Date;           // Most recent visit timestamp
  averageDaysBetweenVisits?: number; // Calculated visit frequency
  totalSpent: number;             // Lifetime spending amount
  averageVisitValue: number;      // Average spending per visit
  visitFrequency: 'high' | 'medium' | 'low'; // Calculated frequency tier
  clientSegment: 'new' | 'regular' | 'vip' | 'at_risk'; // Business segment
  lastContactDate?: Date;         // Last communication timestamp
  preferredContactMethod?: 'email' | 'phone' | 'sms'; // Communication preference
  
  // Analytics Computed Fields (not stored, calculated on query)
  monthlyVisitAverage?: number;   // Average visits per month
  yearlySpending?: number;        // Current year spending
  loyaltyScore?: number;          // Calculated loyalty score (0-100)
  churnRisk?: 'low' | 'medium' | 'high'; // Calculated churn probability
}
```

**Mongoose Schema:**
```typescript
const clientSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true, 
    minlength: 2, 
    maxlength: 50,
    trim: true
  },
  lastName: { 
    type: String, 
    required: true, 
    minlength: 2, 
    maxlength: 50,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email format'
    }
  },
  phone: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(phone: string) {
        return /^\d{10,15}$/.test(phone.replace(/\D/g, ''));
      },
      message: 'Phone must be 10-15 digits'
    }
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6,
    select: false  // Never return in queries
  },
  dateOfBirth: Date,
  address: { type: String, maxlength: 200 },
  notes: { type: String, maxlength: 500 },
  qrCode: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  
  // Loyalty Program
  loyaltyStatus: {
    type: String,
    enum: ['new', 'active', 'milestone_reached', 'inactive'],
    default: 'new'
  },
  loyaltyJoinDate: Date,
  selectedReward: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reward' 
  },
  selectedRewardStartVisits: { type: Number, default: 0 },
  totalLifetimeVisits: { type: Number, default: 0, min: 0 },
  currentProgressVisits: { type: Number, default: 0, min: 0 },
  nextRewardEligibleAt: Number,
  rewardsRedeemed: { type: Number, default: 0, min: 0 },
  
  // Business Intelligence
  lastVisitDate: Date,
  averageDaysBetweenVisits: Number,
  totalSpent: { type: Number, default: 0, min: 0 },
  averageVisitValue: { type: Number, default: 0, min: 0 },
  visitFrequency: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'low'
  },
  clientSegment: {
    type: String,
    enum: ['new', 'regular', 'vip', 'at_risk'],
    default: 'new'
  },
  lastContactDate: Date,
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'sms'],
    default: 'email'
  }
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

**Virtual Fields:**
```typescript
// Full name virtual field
clientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Progress percentage for selected reward
clientSchema.virtual('rewardProgressPercentage').get(function() {
  if (!this.selectedReward || !this.selectedRewardStartVisits) return 0;
  const progress = this.currentProgressVisits - this.selectedRewardStartVisits;
  const required = this.selectedReward.visitsRequired;
  return Math.min((progress / required) * 100, 100);
});

// Days since last visit
clientSchema.virtual('daysSinceLastVisit').get(function() {
  if (!this.lastVisitDate) return null;
  return Math.floor((Date.now() - this.lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
});
```

### Visit Model

The Visit model records all service appointments and transactions.

```typescript
// Path: src/lib/db/models/visit.ts

interface IVisit {
  // Core Visit Data
  _id: ObjectId;
  clientId: ObjectId;             // Reference to Client
  visitDate: Date;                // Service appointment date/time
  services: ServiceReceived[];    // Array of services provided
  totalPrice: number;             // Total visit cost
  notes?: string;                 // Visit notes/comments
  barber?: string;                // Staff member who provided service
  duration?: number;              // Total visit duration in minutes
  
  // System Fields
  createdAt: Date;                // Record creation timestamp
  updatedAt: Date;                // Last modification timestamp
  
  // Business Intelligence Fields
  visitType: 'walk_in' | 'appointment' | 'loyalty_redemption';
  paymentMethod?: 'cash' | 'card' | 'digital' | 'loyalty_redemption';
  customerSatisfaction?: number;   // Rating 1-5
  seasonalPeriod?: string;        // Q1, Q2, Q3, Q4
  dayOfWeek: string;              // Monday, Tuesday, etc.
  hourOfDay: number;              // 0-23 for peak time analysis
  weekOfYear: number;             // 1-52 for weekly patterns
  monthOfYear: number;            // 1-12 for monthly patterns
  
  // Loyalty Integration
  loyaltyPointsEarned?: number;   // Points earned this visit
  rewardRedeemed?: ObjectId;      // Reward used during visit
  preVisitLoyaltyStatus?: string; // Client's loyalty status before visit
  postVisitLoyaltyStatus?: string; // Client's loyalty status after visit
  
  // Performance Metrics
  serviceEfficiency?: number;     // Total minutes per service
  clientRetentionFlag?: boolean;  // True if first visit in 90+ days
  upsellFlag?: boolean;          // True if additional services added
  waitTime?: number;             // Wait time in minutes
  
  // Weather and External Factors (for advanced analytics)
  weatherCondition?: string;      // Weather during visit
  isHoliday?: boolean;           // Whether visit was on holiday
  localEvents?: string[];        // Local events that day
  
  // Referral Tracking
  referralSource?: string;        // How client found the business
  isReferralVisit?: boolean;     // True if visit from referral
  referredBy?: ObjectId;         // Client who made referral
}

interface ServiceReceived {
  serviceId: ObjectId;            // Reference to Service
  serviceName: string;            // Service name (denormalized for history)
  price: number;                  // Service price at time of visit
  duration?: number;              // Individual service duration
  category?: string;              // Service category (denormalized)
  barber?: string;               // Specific staff member for this service
  startTime?: Date;              // Service start time
  endTime?: Date;                // Service completion time
  notes?: string;                // Service-specific notes
  quality?: number;              // Service quality rating (1-5)
}
```

**Mongoose Schema:**
```typescript
const serviceReceivedSchema = new mongoose.Schema({
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service', 
    required: true 
  },
  serviceName: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, min: 0 },
  category: String,
  barber: String,
  startTime: Date,
  endTime: Date,
  notes: { type: String, maxlength: 200 },
  quality: { type: Number, min: 1, max: 5 }
}, { _id: false });

const visitSchema = new mongoose.Schema({
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true,
    index: true
  },
  visitDate: { type: Date, required: true, index: true },
  services: [serviceReceivedSchema],
  totalPrice: { type: Number, required: true, min: 0 },
  notes: { type: String, maxlength: 500 },
  barber: String,
  duration: { type: Number, min: 0 },
  
  // Business Intelligence
  visitType: {
    type: String,
    enum: ['walk_in', 'appointment', 'loyalty_redemption'],
    default: 'walk_in'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital', 'loyalty_redemption']
  },
  customerSatisfaction: { type: Number, min: 1, max: 5 },
  seasonalPeriod: String,
  dayOfWeek: { type: String, required: true },
  hourOfDay: { type: Number, required: true, min: 0, max: 23 },
  weekOfYear: { type: Number, required: true, min: 1, max: 52 },
  monthOfYear: { type: Number, required: true, min: 1, max: 12 },
  
  // Loyalty
  loyaltyPointsEarned: { type: Number, default: 0 },
  rewardRedeemed: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' },
  preVisitLoyaltyStatus: String,
  postVisitLoyaltyStatus: String,
  
  // Performance
  serviceEfficiency: Number,
  clientRetentionFlag: { type: Boolean, default: false },
  upsellFlag: { type: Boolean, default: false },
  waitTime: { type: Number, min: 0 },
  
  // External Factors
  weatherCondition: String,
  isHoliday: { type: Boolean, default: false },
  localEvents: [String],
  
  // Referral
  referralSource: String,
  isReferralVisit: { type: Boolean, default: false },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

**Pre-save Middleware:**
```typescript
visitSchema.pre('save', function(next) {
  // Automatically calculate day/week/month for analytics
  if (this.isModified('visitDate')) {
    const date = new Date(this.visitDate);
    this.dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    this.hourOfDay = date.getHours();
    this.weekOfYear = getWeekNumber(date);
    this.monthOfYear = date.getMonth() + 1;
    this.seasonalPeriod = getSeasonalPeriod(date);
  }
  
  // Calculate total duration if not provided
  if (!this.duration && this.services.length > 0) {
    this.duration = this.services.reduce((total, service) => {
      return total + (service.duration || 0);
    }, 0);
  }
  
  next();
});
```

### Service Model

The Service model defines available services with performance analytics.

```typescript
// Path: src/lib/db/models/service.ts

interface IService {
  // Basic Information
  _id: ObjectId;
  name: string;                   // Service name, unique
  description: string;            // Service description
  price: number;                  // Current price
  duration: number;               // Standard duration in minutes
  category: string;               // Service category
  isActive: boolean;             // Service availability
  
  // System Fields
  createdAt: Date;                // Service creation date
  updatedAt: Date;                // Last modification date
  
  // Media and Presentation
  image?: string;                 // Service image URL
  tags?: string[];               // Search tags
  displayOrder?: number;          // Sort order for display
  
  // Pricing Options
  priceVariants?: Array<{
    name: string;                 // Variant name (e.g., "Student", "Senior")
    price: number;                // Variant price
    conditions?: string;          // Qualification conditions
  }>;
  
  // Performance Metrics (calculated fields)
  totalBookings: number;          // Total times booked
  totalRevenue: number;           // Total revenue generated
  averageRating?: number;         // Customer satisfaction (1-5)
  popularityRank?: number;        // Relative popularity ranking
  
  // Business Intelligence
  seasonalDemand?: {             // Quarterly demand patterns
    Q1: number;
    Q2: number; 
    Q3: number;
    Q4: number;
  };
  peakHours?: number[];          // Hours of highest demand (0-23)
  clientDemographics?: {         // Client segment preferences
    new: number;
    regular: number;
    vip: number;
  };
  
  // Trend Analysis
  monthlyGrowth?: number;        // Month-over-month growth %
  yearlyGrowth?: number;         // Year-over-year growth %
  lastMonthBookings?: number;    // Previous month bookings
  thisMonthBookings?: number;    // Current month bookings
  
  // Operational Data
  averageServiceTime?: number;   // Actual vs scheduled duration
  noShowRate?: number;          // Percentage of no-shows
  rebookingRate?: number;       // Percentage of clients rebooking
  upsellRate?: number;          // Rate of additional services sold
  
  // Cost and Profitability
  costToProvide?: number;       // Estimated cost to provide service
  profitMargin?: number;        // Calculated profit margin
  breakEvenPrice?: number;      // Minimum profitable price
}
```

**Mongoose Schema:**
```typescript
const serviceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    minlength: 2,
    maxlength: 100,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  duration: { 
    type: Number, 
    required: true, 
    min: 5  // Minimum 5 minutes
  },
  category: { 
    type: String, 
    required: true,
    index: true
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  
  // Media
  image: String,
  tags: [String],
  displayOrder: { type: Number, default: 0 },
  
  // Pricing
  priceVariants: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    conditions: String,
    _id: false
  }],
  
  // Performance Metrics
  totalBookings: { type: Number, default: 0, min: 0 },
  totalRevenue: { type: Number, default: 0, min: 0 },
  averageRating: { type: Number, min: 1, max: 5 },
  popularityRank: Number,
  
  // Analytics
  seasonalDemand: {
    Q1: { type: Number, default: 0 },
    Q2: { type: Number, default: 0 },
    Q3: { type: Number, default: 0 },
    Q4: { type: Number, default: 0 }
  },
  peakHours: [{ type: Number, min: 0, max: 23 }],
  clientDemographics: {
    new: { type: Number, default: 0 },
    regular: { type: Number, default: 0 },
    vip: { type: Number, default: 0 }
  },
  
  // Trends
  monthlyGrowth: Number,
  yearlyGrowth: Number,
  lastMonthBookings: { type: Number, default: 0 },
  thisMonthBookings: { type: Number, default: 0 },
  
  // Operations
  averageServiceTime: Number,
  noShowRate: { type: Number, min: 0, max: 100 },
  rebookingRate: { type: Number, min: 0, max: 100 },
  upsellRate: { type: Number, min: 0, max: 100 },
  
  // Profitability
  costToProvide: { type: Number, min: 0 },
  profitMargin: { type: Number, min: -100, max: 100 },
  breakEvenPrice: { type: Number, min: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

### Reward Model

The Reward model defines loyalty program rewards with redemption analytics.

```typescript
// Path: src/lib/db/models/reward.ts

interface IReward {
  // Basic Information
  _id: ObjectId;
  name: string;                   // Reward name
  description: string;            // Reward description
  visitsRequired: number;         // Visits needed to earn
  value?: number;                 // Monetary value
  category: 'service_discount' | 'free_service' | 'product' | 'experience';
  isActive: boolean;             // Reward availability
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
  
  // Display and Presentation
  image?: string;                 // Reward image URL
  icon?: string;                  // Icon identifier
  displayOrder?: number;          // Sort order
  highlightColor?: string;        // Theme color for UI
  
  // Eligibility Rules
  minimumSpent?: number;          // Minimum lifetime spending required
  clientSegments?: string[];      // Eligible client segments
  validFrom?: Date;              // Reward availability start
  validUntil?: Date;             // Reward expiration
  maxRedemptionsPerClient?: number; // Limit per client
  maxTotalRedemptions?: number;   // Global limit
  
  // Performance Metrics
  totalRedemptions: number;       // Total times redeemed
  averageTimeToRedeem?: number;   // Average days to complete
  popularityScore: number;        // Relative popularity (0-100)
  
  // Business Impact
  clientRetentionImpact?: number; // Retention rate improvement %
  revenueImpact?: number;        // Revenue generated per redemption
  costToBusiness?: number;       // Cost to provide reward
  
  // Usage Analytics
  redemptionsBySegment?: {       // Redemptions by client type
    new: number;
    regular: number;
    vip: number;
  };
  seasonalRedemptions?: {        // Quarterly redemption patterns
    Q1: number;
    Q2: number;
    Q3: number; 
    Q4: number;
  };
  
  // Advanced Analytics
  completionRate?: number;       // % of clients who start and finish
  averageRevenuePerRedemption?: number; // Revenue during redemption visit
  clientLifetimeValueImpact?: number; // LTV increase from this reward
  referralGenerationRate?: number; // % leading to referrals
}
```

**Mongoose Schema:**
```typescript
const rewardSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    minlength: 2,
    maxlength: 100,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  visitsRequired: { 
    type: Number, 
    required: true, 
    min: 1,
    max: 50  // Reasonable maximum
  },
  value: { type: Number, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['service_discount', 'free_service', 'product', 'experience']
  },
  isActive: { type: Boolean, default: true },
  
  // Presentation
  image: String,
  icon: String,
  displayOrder: { type: Number, default: 0 },
  highlightColor: { type: String, default: '#3B82F6' },
  
  // Eligibility
  minimumSpent: { type: Number, min: 0 },
  clientSegments: [{
    type: String,
    enum: ['new', 'regular', 'vip', 'at_risk']
  }],
  validFrom: Date,
  validUntil: Date,
  maxRedemptionsPerClient: { type: Number, min: 1 },
  maxTotalRedemptions: { type: Number, min: 1 },
  
  // Performance
  totalRedemptions: { type: Number, default: 0, min: 0 },
  averageTimeToRedeem: Number,
  popularityScore: { type: Number, default: 0, min: 0, max: 100 },
  
  // Business Impact
  clientRetentionImpact: Number,
  revenueImpact: { type: Number, min: 0 },
  costToBusiness: { type: Number, min: 0 },
  
  // Analytics
  redemptionsBySegment: {
    new: { type: Number, default: 0 },
    regular: { type: Number, default: 0 },
    vip: { type: Number, default: 0 }
  },
  seasonalRedemptions: {
    Q1: { type: Number, default: 0 },
    Q2: { type: Number, default: 0 },
    Q3: { type: Number, default: 0 },
    Q4: { type: Number, default: 0 }
  },
  
  // Advanced Analytics
  completionRate: { type: Number, min: 0, max: 100 },
  averageRevenuePerRedemption: { type: Number, min: 0 },
  clientLifetimeValueImpact: Number,
  referralGenerationRate: { type: Number, min: 0, max: 100 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

## Analytics Schema

### Aggregated Analytics Collections

For performance optimization, we maintain pre-aggregated analytics collections:

#### Daily Analytics Collection

```typescript
interface IDailyAnalytics {
  _id: ObjectId;
  date: Date;                     // YYYY-MM-DD
  
  // Visit Metrics
  totalVisits: number;
  totalRevenue: number;
  averageVisitValue: number;
  uniqueClients: number;
  
  // Client Metrics
  newClients: number;
  returningClients: number;
  loyaltyRedemptions: number;
  
  // Service Breakdown
  servicePerformance: Array<{
    serviceId: ObjectId;
    serviceName: string;
    bookings: number;
    revenue: number;
  }>;
  
  // Peak Times
  hourlyDistribution: Array<{
    hour: number;
    visits: number;
    revenue: number;
  }>;
  
  // Business Health
  clientSatisfactionAverage: number;
  noShowRate: number;
  averageWaitTime: number;
}
```

#### Monthly Analytics Collection

```typescript
interface IMonthlyAnalytics {
  _id: ObjectId;
  year: number;
  month: number;
  
  // Comprehensive Metrics
  totalVisits: number;
  totalRevenue: number;
  totalNewClients: number;
  totalActiveClients: number;
  
  // Growth Metrics
  visitGrowthVsPreviousMonth: number;
  revenueGrowthVsPreviousMonth: number;
  clientGrowthVsPreviousMonth: number;
  
  // Service Analytics
  topServices: Array<{
    serviceId: ObjectId;
    serviceName: string;
    bookings: number;
    revenue: number;
    growth: number;
  }>;
  
  // Client Segmentation
  clientSegmentBreakdown: {
    new: number;
    regular: number;
    vip: number;
    at_risk: number;
  };
  
  // Loyalty Program
  loyaltyParticipationRate: number;
  rewardsRedeemed: number;
  averageVisitsToRedemption: number;
}
```

## Relationships

### Entity Relationship Diagram

```
Client (1) ←→ (N) Visit
Client (1) ←→ (0..1) Reward (selectedReward)
Visit (N) ←→ (N) Service (through services array)
Visit (0..1) ←→ (1) Reward (rewardRedeemed)
```

### Reference Integrity

All relationships use MongoDB ObjectIds with proper referencing:

```typescript
// Client → Visit relationship
const clientVisits = await Visit.find({ clientId: clientId });

// Visit → Service relationship (embedded)
const visitWithServices = await Visit.findById(visitId).populate('services.serviceId');

// Client → Reward relationship
const clientWithReward = await Client.findById(clientId).populate('selectedReward');
```

## Indexes

### Performance Indexes

```javascript
// Client collection indexes
db.clients.createIndex({ "email": 1 }, { unique: true });
db.clients.createIndex({ "phone": 1 }, { unique: true });
db.clients.createIndex({ "qrCode": 1 }, { unique: true });
db.clients.createIndex({ "loyaltyStatus": 1, "createdAt": -1 });
db.clients.createIndex({ "totalLifetimeVisits": -1 });
db.clients.createIndex({ "lastVisitDate": -1 });

// Visit collection indexes
db.visits.createIndex({ "clientId": 1, "visitDate": -1 });
db.visits.createIndex({ "visitDate": -1 });
db.visits.createIndex({ "services.serviceId": 1 });
db.visits.createIndex({ "dayOfWeek": 1, "hourOfDay": 1 });
db.visits.createIndex({ "monthOfYear": 1, "visitDate": -1 });

// Service collection indexes
db.services.createIndex({ "name": 1 }, { unique: true });
db.services.createIndex({ "category": 1, "isActive": 1 });
db.services.createIndex({ "totalBookings": -1 });
db.services.createIndex({ "popularityRank": 1 });

// Reward collection indexes
db.rewards.createIndex({ "name": 1 }, { unique: true });
db.rewards.createIndex({ "category": 1, "isActive": 1 });
db.rewards.createIndex({ "visitsRequired": 1 });
db.rewards.createIndex({ "popularityScore": -1 });

// Compound indexes for analytics
db.visits.createIndex({ 
  "visitDate": -1, 
  "totalPrice": -1, 
  "clientId": 1 
});

db.clients.createIndex({ 
  "loyaltyStatus": 1, 
  "totalLifetimeVisits": -1, 
  "createdAt": -1 
});
```

### Text Search Indexes

```javascript
// Full-text search indexes
db.clients.createIndex({
  "firstName": "text",
  "lastName": "text", 
  "email": "text",
  "phone": "text"
});

db.services.createIndex({
  "name": "text",
  "description": "text",
  "tags": "text"
});

db.rewards.createIndex({
  "name": "text",
  "description": "text"
});
```

## Data Validation

### Custom Validators

```typescript
// Email uniqueness validator
clientSchema.path('email').validate(async function(email) {
  const client = await this.constructor.findOne({ 
    email: email, 
    _id: { $ne: this._id } 
  });
  return !client;
}, 'Email already exists');

// Visit total price validation
visitSchema.path('totalPrice').validate(function(totalPrice) {
  const servicesTotal = this.services.reduce((sum, service) => sum + service.price, 0);
  return Math.abs(totalPrice - servicesTotal) < 0.01; // Allow for rounding
}, 'Total price must match sum of service prices');

// Loyalty visits validation
clientSchema.path('currentProgressVisits').validate(function(progress) {
  return progress <= this.totalLifetimeVisits;
}, 'Progress visits cannot exceed lifetime visits');
```

### Business Rules Validation

```typescript
// Reward redemption validation
rewardSchema.path('visitsRequired').validate(function(visits) {
  return visits > 0 && visits <= 50;
}, 'Visits required must be between 1 and 50');

// Service duration validation
serviceSchema.path('duration').validate(function(duration) {
  return duration >= 5 && duration <= 480; // 5 minutes to 8 hours
}, 'Service duration must be between 5 minutes and 8 hours');

// Client age validation (if date of birth provided)
clientSchema.path('dateOfBirth').validate(function(dob) {
  if (!dob) return true; // Optional field
  const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return age >= 13 && age <= 120;
}, 'Age must be between 13 and 120 years');
```

## Migration Guidelines

### Version Control for Schema Changes

```typescript
// Migration: Add new analytics fields to Client model
// Version: 2.1.0
// Date: 2024-01-15

db.clients.updateMany(
  { clientSegment: { $exists: false } },
  { 
    $set: { 
      clientSegment: 'new',
      visitFrequency: 'low',
      averageDaysBetweenVisits: null
    } 
  }
);

// Migration: Add indexes for new analytics fields
db.clients.createIndex({ "clientSegment": 1, "visitFrequency": 1 });
```

### Data Consistency Checks

```typescript
// Script to ensure data consistency
async function validateDataConsistency() {
  // Check for orphaned visits (client doesn't exist)
  const orphanedVisits = await Visit.aggregate([
    {
      $lookup: {
        from: 'clients',
        localField: 'clientId',
        foreignField: '_id',
        as: 'client'
      }
    },
    { $match: { client: { $size: 0 } } }
  ]);
  
  // Check for invalid service references in visits
  const invalidServiceRefs = await Visit.aggregate([
    { $unwind: '$services' },
    {
      $lookup: {
        from: 'services',
        localField: 'services.serviceId',
        foreignField: '_id',
        as: 'service'
      }
    },
    { $match: { service: { $size: 0 } } }
  ]);
  
  // Report issues
  console.log(`Found ${orphanedVisits.length} orphaned visits`);
  console.log(`Found ${invalidServiceRefs.length} invalid service references`);
}
```

### Backup and Recovery

```bash
# Create database backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/barbaros_db" --out=./backup

# Restore from backup
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/barbaros_db" --drop ./backup/barbaros_db

# Export specific collection
mongoexport --uri="mongodb+srv://username:password@cluster.mongodb.net/barbaros_db" --collection=clients --out=clients_backup.json

# Import specific collection
mongoimport --uri="mongodb+srv://username:password@cluster.mongodb.net/barbaros_db" --collection=clients --file=clients_backup.json --upsert
```

### Performance Monitoring

```typescript
// MongoDB performance monitoring queries
// Check slow queries
db.setProfilingLevel(2, { slowms: 100 });
db.system.profile.find().sort({ ts: -1 }).limit(5);

// Index usage statistics
db.clients.aggregate([{ $indexStats: {} }]);

// Collection statistics
db.stats();
db.clients.stats();
db.visits.stats();
```

This comprehensive database documentation provides the foundation for understanding and maintaining the Barbaros Barbershop application's data layer, with particular emphasis on the analytics capabilities that drive business intelligence and reporting. 