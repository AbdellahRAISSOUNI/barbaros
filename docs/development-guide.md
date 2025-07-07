# Development Guide

## Overview

This guide provides comprehensive instructions for setting up, developing, and contributing to the Barbaros Barbershop application, with special focus on the enhanced analytics dashboard and business intelligence features.

## 🆕 **Latest Updates (December 2024)**

### Critical System Improvements
- **Enhanced MongoDB Connectivity**: Robust connection management with automatic reconnection and connection pooling
- **Complete TypeScript Compliance**: Zero compilation errors with comprehensive type safety across the entire codebase
- **Performance Optimizations**: Optimized database queries using `.lean()` operations for better memory usage and speed
- **Null Safety Implementation**: Comprehensive null checking and validation throughout the system
- **Barber Management Enhancements**: Updated form validation (phone mandatory, email optional) and full deletion system

### Development Experience Improvements
- **Build Performance**: Optimized build time to 10 seconds with zero errors
- **Type Safety**: Complete TypeScript type coverage for all database models and API endpoints
- **Error Handling**: Enhanced error recovery and graceful degradation
- **Code Quality**: Improved import organization and centralized type management

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Development Environment](#development-environment)
4. [Analytics Dashboard Development](#analytics-dashboard-development)
5. [Database Development](#database-development)
6. [API Development](#api-development)
7. [Frontend Development](#frontend-development)
8. [Performance and Security](#performance-and-security)
9. [Testing Guidelines](#testing-guidelines)
10. [Deployment](#deployment)
11. [Contributing](#contributing)

## Prerequisites

### Required Software
- **Node.js**: Version 18.17.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions
- **MongoDB Compass**: For database management (optional but recommended)

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "mongodb.mongodb-vscode",
    "ms-vscode.vscode-thunder-client"
  ]
}
```

### Account Requirements
- **MongoDB Atlas Account**: For cloud database hosting
- **Vercel Account**: For deployment (optional for development)
- **GitHub Account**: For version control and collaboration

## Initial Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-username/barbaros-app.git
cd barbaros-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 2. Environment Configuration

Create and configure your `.env.local` file:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barbaros_db

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-secret-here

# Analytics Configuration (Optional)
ANALYTICS_CACHE_TTL=300
ANALYTICS_BATCH_SIZE=1000
ANALYTICS_ENABLE_REAL_TIME=true

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Rate Limiting
API_RATE_LIMIT_MAX=100
API_RATE_LIMIT_WINDOW=900000

# Email Configuration (Optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@barbarosapp.com
```

### 3. Database Setup

#### MongoDB Atlas Configuration

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free M0 cluster
   - Create database user with read/write permissions
   - Whitelist your IP address (or use 0.0.0.0/0 for development)

2. **Get Connection String**
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

3. **Database Initialization**
   ```bash
   # Seed database with sample data
   npm run seed
   
   # Verify database connection
   npm run test-db
   ```

### 4. Development Server

```bash
# Start development server
npm run dev

# Server will be available at:
# Frontend: http://localhost:3000
# Admin Dashboard: http://localhost:3000/admin
# Client Portal: http://localhost:3000/client
```

## Development Environment

### Project Structure

```
barbaros-app/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (dashboard)/              # Dashboard layout group
│   │   │   ├── admin/                # Admin dashboard pages
│   │   │   │   ├── clients/          # Client management
│   │   │   │   ├── services/         # Service management
│   │   │   │   ├── rewards/          # Reward management
│   │   │   │   ├── scanner/          # QR code scanner
│   │   │   │   └── page.tsx          # Main dashboard with analytics
│   │   │   └── client/               # Client portal pages
│   │   ├── (landing)/                # Landing page layout
│   │   ├── api/                      # API routes
│   │   │   ├── admin/                # Admin-only endpoints
│   │   │   │   └── analytics/        # Analytics endpoints
│   │   │   ├── clients/              # Client management APIs
│   │   │   ├── services/             # Service management APIs
│   │   │   ├── loyalty/              # Loyalty program APIs
│   │   │   └── rewards/              # Reward management APIs
│   │   ├── login/                    # Authentication pages
│   │   ├── register/                 # Registration pages
│   │   ├── globals.css               # Global styles
│   │   └── layout.tsx                # Root layout
│   ├── components/                   # React components
│   │   ├── admin/                    # Admin-specific components
│   │   │   ├── analytics/            # Analytics dashboard components
│   │   │   │   ├── DashboardWidgets.tsx
│   │   │   │   ├── MetricsOverview.tsx
│   │   │   │   ├── ClientGrowthChart.tsx
│   │   │   │   ├── ServicePopularityChart.tsx
│   │   │   │   └── VisitFrequencyChart.tsx
│   │   │   ├── clients/              # Client management components
│   │   │   ├── rewards/              # Reward management components
│   │   │   └── services/             # Service management components
│   │   ├── shared/                   # Shared components
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── ClientHeader.tsx
│   │   │   ├── ClientSidebar.tsx
│   │   │   ├── CollapsibleSidebar.tsx
│   │   │   └── AuthProvider.tsx
│   │   └── ui/                       # UI components
│   │       ├── ClientForm.tsx
│   │       ├── QRCodeScanner.tsx
│   │       ├── VisitRecordingForm.tsx
│   │       └── LoyaltyDashboard.tsx
│   ├── lib/                          # Utility libraries
│   │   ├── db/                       # Database utilities
│   │   │   ├── api/                  # Database API functions
│   │   │   │   ├── clientApi.ts
│   │   │   │   ├── serviceApi.ts
│   │   │   │   ├── visitApi.ts
│   │   │   │   ├── loyaltyApi.ts
│   │   │   │   └── rewardApi.ts
│   │   │   ├── models/               # Mongoose models
│   │   │   │   ├── client.ts
│   │   │   │   ├── visit.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── reward.ts
│   │   │   ├── mongodb.ts            # Database connection
│   │   │   └── seed.ts               # Database seeding
│   │   ├── auth/                     # Authentication utilities
│   │   ├── utils/                    # General utilities
│   │   └── validations/              # Input validation schemas
│   └── middleware.ts                 # Next.js middleware
├── docs/                             # Documentation
├── public/                           # Static assets
├── .env.example                      # Environment template
├── package.json                      # Dependencies and scripts
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── next.config.ts                    # Next.js configuration
```

### Development Scripts

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build production bundle
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run lint:fix              # Fix ESLint issues

# Database
npm run seed                   # Seed database with sample data
npm run seed:reset            # Reset and reseed database
npm run test-db               # Test database connection

# Type Checking
npm run type-check            # TypeScript type checking
npm run type-check:watch      # Watch mode type checking

# Utilities
npm run analyze               # Bundle analysis
npm run clean                 # Clean build artifacts
```

## Analytics Dashboard Development

### Component Architecture

The analytics dashboard follows a modular component architecture:

```typescript
// Main container component
DashboardWidgets
├── MetricsOverview           // 8 core business metrics
├── ClientGrowthChart         // Client acquisition analytics
├── ServicePopularityChart    // Service performance analytics
└── VisitFrequencyChart       // Visit pattern analytics
```

## UI Components Development

### Collapsible Sidebar System

The application now features a universal collapsible sidebar system that provides smooth, animated navigation for both admin and client dashboards.

#### Component Architecture

```typescript
// Shared sidebar system
CollapsibleSidebar            // Universal base component
├── AdminSidebar             // Admin-specific implementation
└── ClientSidebar            // Client-specific implementation
```

#### Key Features

- **Smooth Animations**: 300ms transitions with easing functions
- **State Persistence**: localStorage integration for session persistence
- **Mobile Responsive**: Overlay behavior on mobile, collapsible on desktop
- **Tooltip System**: Hover tooltips when collapsed
- **Beautiful Design**: Gradient backgrounds and modern styling

#### Implementation Example

```typescript
// Creating a new sidebar implementation
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { FaHome, FaUsers, FaCog } from 'react-icons/fa';

const MySidebar = ({ onCollapsedChange }: { onCollapsedChange?: (collapsed: boolean) => void }) => {
  const sections = [
    {
      title: 'Management',
      items: [
        { href: '/dashboard', icon: FaHome, label: 'Dashboard', exactMatch: true },
        { href: '/users', icon: FaUsers, label: 'Users' },
        { href: '/settings', icon: FaCog, label: 'Settings' }
      ]
    }
  ];

  return (
    <CollapsibleSidebar
      title="My App"
      subtitle="Dashboard"
      sections={sections}
      onCollapsedChange={onCollapsedChange}
    />
  );
};
```

#### Layout Integration

```typescript
'use client';

import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <MySidebar onCollapsedChange={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col transition-all duration-300">
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Enhanced UI Components

The application includes several enhanced UI components with improved responsive design:

#### VisitRecordingForm
- **Mobile-first responsive design**: Single column → 2-column → 3-column layouts
- **Text handling**: Proper truncation with `line-clamp` utilities
- **Enhanced service selection**: Grid layouts with responsive gaps

#### ClientInfoCard  
- **Real data integration**: Live loyalty status and visit data
- **Visual enhancements**: Gradient backgrounds and improved typography
- **Better responsive spacing**: Consistent padding patterns

#### VisitHistoryView
- **Enhanced statistics**: Color-coded cards with gradient backgrounds
- **Improved modals**: Better layouts and responsive design
- **Export functionality**: CSV and JSON export options

### Responsive Design Patterns

#### Grid Systems

```css
/* Statistics cards */
.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-4

/* Service grids */
.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-3

/* Form layouts */
.grid.grid-cols-1.lg:grid-cols-2.xl:grid-cols-3
```

#### Text Handling

```css
/* Single line truncation */
.truncate

/* Multi-line truncation */
.line-clamp-2

/* Overflow prevention */
.min-w-0
```

#### Button Patterns

```css
/* Responsive buttons */
.flex-1.sm:flex-none
.w-full.sm:w-auto

/* Responsive padding */
.px-4.py-2.lg:px-6.lg:py-3
```

### Animation Guidelines

```css
/* Standard transitions */
.transition-all.duration-300    /* Standard animations */
.transition-colors.duration-200 /* Hover effects */

/* Sidebar animations */
.transition-all.duration-300.ease-in-out  /* Width changes */
.transition-all.duration-300              /* Text fade */
.transition-all.duration-200              /* Icon scaling */
```

For detailed UI component documentation, see [UI Components](ui-components.md).

## API Development

### Route Handler Template

```typescript
// src/app/api/example/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { getExamples, createExample } from '@/lib/db/api/exampleApi';

// GET endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    // Build filters from query parameters
    const filters: Record<string, any> = {};
    const search = searchParams.get('search');
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await getExamples({
      page,
      limit,
      sortBy,
      sortOrder,
      filters
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('GET /api/example error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, value } = body;
    if (!name || typeof value !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Name and value are required' },
        { status: 400 }
      );
    }

    const result = await createExample({ name, value });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('POST /api/example error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### API Testing with Thunder Client

Create API test collections in `.vscode/thunder-client-collections/`:

```json
{
  "collectionName": "Barbaros API",
  "dateExported": "2024-01-15",
  "version": "1.0",
  "folders": [
    {
      "name": "Analytics",
      "requests": [
        {
          "name": "Get Overview Analytics",
          "url": "{{baseUrl}}/api/admin/analytics/overview",
          "method": "GET",
          "params": [
            {
              "name": "startDate",
              "value": "2024-01-01"
            },
            {
              "name": "endDate", 
              "value": "2024-01-31"
            }
          ]
        }
      ]
    }
  ]
}
```

## Frontend Development

### Component Development Guidelines

#### 1. TypeScript Best Practices

```typescript
// Define proper interfaces
interface ComponentProps {
  data: DataType[];
  onUpdate: (id: string, data: Partial<DataType>) => void;
  className?: string;
  children?: React.ReactNode;
}

// Use proper generics for reusable components
interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
}

function Table<T>({ data, columns, onRowClick }: TableProps<T>) {
  // Implementation
}
```

#### 2. Custom Hooks

```typescript
// src/lib/hooks/useAnalytics.ts

import { useState, useEffect, useCallback } from 'react';

interface UseAnalyticsOptions {
  endpoint: string;
  params?: Record<string, string>;
  refreshInterval?: number;
}

interface UseAnalyticsReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAnalytics<T>({ 
  endpoint, 
  params = {}, 
  refreshInterval 
}: UseAnalyticsOptions): UseAnalyticsReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = new URL(endpoint, window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data || result);
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, params]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, isLoading, error, refresh: fetchData };
}
```

#### 3. Form Handling

```typescript
// src/components/forms/ExampleForm.tsx

import { useState } from 'react';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  value: z.number().min(0, 'Value must be non-negative'),
  email: z.string().email('Invalid email format')
});

type FormData = z.infer<typeof formSchema>;

interface ExampleFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function ExampleForm({ 
  initialData, 
  onSubmit, 
  onCancel 
}: ExampleFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    value: initialData?.value || 0,
    email: initialData?.email || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validatedData = formSchema.parse(formData);
      
      setIsSubmitting(true);
      setErrors({});
      
      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
            errors.name ? 'border-red-500' : ''
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Other form fields... */}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
```

## Performance and Security

### Database Performance Optimizations

The application includes several database performance optimizations:

#### Database Indexes
```javascript
// Client model indexes for search performance
{
  // Text search index for full-text search
  firstName: 'text',
  lastName: 'text', 
  phoneNumber: 'text',
  clientId: 'text'
}

// Compound indexes for common query patterns
{ phoneNumber: 1, isActive: 1 }
{ clientId: 1 }
{ lastName: 1, firstName: 1 }
{ createdAt: -1 }
```

#### Visit Model Indexes
```javascript
// Analytics and reporting indexes
{ clientId: 1, visitDate: -1 }
{ visitDate: -1 }
{ barber: 1, visitDate: -1 }
{ createdAt: -1 }
```

#### Query Optimization
- **Lean Queries**: Use `.lean()` for read-only operations to improve performance
- **Field Selection**: Only fetch required fields using `.select()`
- **Text Search**: Intelligent routing between phone number regex and text search
- **Pagination**: Efficient pagination using cursor-based approach

```javascript
// Example optimized query
const clients = await Client.find(query)
  .select('firstName lastName phoneNumber clientId')
  .lean()
  .limit(limit)
  .skip(skip);
```

### API Response Caching

The application implements a simple in-memory caching system:

```javascript
// Cache configuration in mongodb.ts
class SimpleCache {
  constructor(defaultTTL = 300000) // 5 minutes default
  
  // Usage in API endpoints
  const cacheKey = `analytics_overview_${startDate}_${endDate}`;
  let cachedData = cache.get(cacheKey);
  
  if (!cachedData) {
    cachedData = await computeAnalytics();
    cache.set(cacheKey, cachedData, 600000); // 10 minutes
  }
}
```

### Security Enhancements

#### Rate Limiting
```javascript
// Global rate limiting configuration
const rateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
};
```

#### Input Validation and Sanitization
```javascript
// Enhanced search query sanitization
function sanitizeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// NoSQL injection prevention
function validateAndSanitizeInput(input) {
  if (typeof input !== 'string') {
    throw new Error('Invalid input type');
  }
  return input.trim().slice(0, 100); // Limit length
}
```

#### Enhanced Security Headers
```javascript
// Security headers in middleware
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};
```

#### Session Security
- Enhanced session validation using `withAuth` middleware
- Proper token verification and user context validation
- Automatic session cleanup and timeout handling

### Performance Monitoring

#### Memory Management
- Proper cleanup of polling intervals and event listeners
- Efficient component re-rendering using `React.memo` and `useMemo`
- Optimized state management to prevent memory leaks

#### Database Connection Optimization
```javascript
// Optimized connection pooling
const mongooseOptions = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
  minPoolSize: 2
};
```

### Best Practices

#### Frontend Performance
1. **Component Optimization**: Use `React.memo` for expensive components
2. **State Management**: Minimize re-renders with proper dependency arrays
3. **Code Splitting**: Lazy load heavy components and routes
4. **Bundle Optimization**: Tree shaking and dead code elimination

#### Backend Performance
1. **Database Queries**: Always use appropriate indexes
2. **API Responses**: Implement caching for expensive operations
3. **Pagination**: Use cursor-based pagination for large datasets
4. **Error Handling**: Graceful error handling without exposing sensitive data

#### Security Guidelines
1. **Input Validation**: Validate and sanitize all user inputs
2. **Authentication**: Use secure session management
3. **Authorization**: Implement proper role-based access control
4. **Data Protection**: Never expose sensitive data in error messages

### Development Environment Security
```env
# Security-related environment variables
API_RATE_LIMIT_MAX=1000
API_RATE_LIMIT_WINDOW=60000
SESSION_TIMEOUT=3600000
CACHE_TTL=300000
```

## Testing Guidelines

### Unit Testing Setup

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

```typescript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Example Test

```typescript
// __tests__/components/MetricsOverview.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import MetricsOverview from '@/components/admin/analytics/MetricsOverview';

// Mock fetch
global.fetch = jest.fn();

describe('MetricsOverview', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<MetricsOverview dateRange={{ startDate: '2024-01-01', endDate: '2024-01-31' }} refreshTrigger={0} />);
    
    expect(screen.getByText('Loading metrics...')).toBeInTheDocument();
  });

  it('displays metrics when data is loaded', async () => {
    const mockData = {
      success: true,
      metrics: {
        totalClients: 150,
        activeClients: 120,
        totalRevenue: 5000,
        // ... other metrics
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    render(<MetricsOverview dateRange={{ startDate: '2024-01-01', endDate: '2024-01-31' }} refreshTrigger={0} />);

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('5,000 MAD')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<MetricsOverview dateRange={{ startDate: '2024-01-01', endDate: '2024-01-31' }} refreshTrigger={0} />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading metrics/)).toBeInTheDocument();
    });
  });
});
```

## Deployment

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barbaros_production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-production-key
```

### Vercel Deployment

1. **Connect GitHub Repository**
   - Import project in Vercel dashboard
   - Configure environment variables
   - Set up automatic deployments

2. **Build Configuration**
   ```json
   // vercel.json
   {
     "framework": "nextjs",
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "outputDirectory": ".next",
     "functions": {
       "src/app/api/**/*.ts": {
         "maxDuration": 10
       }
     }
   }
   ```

### Performance Optimization

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig;
```

## Contributing

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/analytics-enhancement

# Make changes and commit
git add .
git commit -m "feat: add new analytics component for revenue tracking"

# Push and create PR
git push origin feature/analytics-enhancement
```

### Code Standards

- Use TypeScript for all new code
- Follow ESLint configuration
- Maintain 80%+ test coverage
- Update documentation for new features
- Use conventional commit messages

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] API endpoints tested

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass
```

This comprehensive development guide provides everything needed to work effectively with the Barbaros Barbershop application, from initial setup to advanced analytics development and deployment. 