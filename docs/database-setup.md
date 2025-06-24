# Database Setup

## Overview

Barbaros uses MongoDB as its primary database. MongoDB is a NoSQL document database that provides high performance, high availability, and easy scalability. The application connects to MongoDB using Mongoose, an Object Data Modeling (ODM) library for MongoDB and Node.js.

## Connection Setup

The database connection is managed in the `src/lib/db/mongodb.ts` file. The connection implementation includes:

- Connection pooling to prevent connection leaks
- Error handling for connection failures
- Caching of the connection to prevent multiple connections during development
- Timeout settings for improved reliability
- **API response caching** for improved performance

### Connection Code

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barbaros';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Simple in-memory cache for API responses
class SimpleCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 300000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  set(key: string, data: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Export cache instance for use in API routes
export const cache = new SimpleCache();

// Define a type for the mongoose cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare the global mongoose cache
declare global {
  var mongoose: MongooseCache | undefined;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB database
 * @returns Mongoose connection instance
 */
async function connectToDatabase() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2,  // Maintain minimum 2 connections
    };

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
        });
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default connectToDatabase;
```

## Environment Configuration

The MongoDB connection string is configured in the `.env.local` file. For security reasons, this file is not committed to the repository. A template `.env.example` file is provided for reference.

### Required Environment Variables

```
# MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barbaros

# Other environment variables
NODE_ENV=development
```

## Database Seeding

The application includes a database seeding utility to populate the database with sample data for development and testing purposes. The seeding functionality is implemented in the `src/lib/db/seed.ts` file.

### Seeding Process

1. The seeding process first clears any existing data to ensure a clean state.
2. It then creates sample data for all collections in the following order:
   - Admin users
   - Service categories
   - Services
   - Rewards
   - Clients
   - Visits

### Running the Seed

The database can be seeded through the API endpoint:

```
POST /api/seed
```

With the following body:

```json
{
  "force": true
}
```

Or through the web interface at:

```
/api/seed-test
```

### Default Admin User

The seeding process creates a default admin user with the following credentials:

- **Email**: admin@barbaros.com
- **Password**: admin123
- **Role**: owner

## Database Testing

A testing utility is provided to verify the database connection and data retrieval. This can be accessed through:

```
GET /api/db-status
```

Or through the web interface at:

```
/api/seed-test
```

## Database Monitoring

For production deployments, it's recommended to set up database monitoring using MongoDB Atlas or a similar service to track:

- Connection status
- Query performance
- Database size
- Error rates

## Backup Strategy

For production deployments, a regular backup strategy should be implemented:

1. Daily automated backups
2. Point-in-time recovery
3. Geo-redundant storage

## Next Steps

For more information on the data models and schema, see the [Data Models](./data-models.md) documentation.

## Database Performance Optimizations

### Database Indexes

The application implements comprehensive database indexing for optimal query performance:

#### Client Collection Indexes
```javascript
// Text search index for full-text search capabilities
{
  firstName: 'text',
  lastName: 'text',
  phoneNumber: 'text',
  clientId: 'text'
}

// Compound indexes for common query patterns
{ phoneNumber: 1, isActive: 1 }      // Phone number lookup with status
{ clientId: 1 }                      // Unique client ID lookup
{ lastName: 1, firstName: 1 }        // Name-based sorting and search
{ createdAt: -1 }                    // Recently created clients
{ isActive: 1, createdAt: -1 }       // Active clients by creation date
```

#### Visit Collection Indexes
```javascript
// Analytics and reporting performance
{ clientId: 1, visitDate: -1 }       // Client visit history
{ visitDate: -1 }                    // Date-based analytics queries
{ barber: 1, visitDate: -1 }         // Barber performance analytics
{ createdAt: -1 }                    // Recent visits
{ clientId: 1, createdAt: -1 }       // Client timeline queries
```

#### BarberAchievement Collection Indexes
```javascript
// Leaderboard and achievement queries
{ barberId: 1, month: 1, year: 1 }   // Monthly barber stats
{ totalVisits: -1 }                  // Leaderboard sorting
{ month: 1, year: 1, totalVisits: -1 } // Monthly leaderboards
```

### Index Creation

Indexes are automatically created when the application starts. They are created with the `background: true` option to prevent blocking database operations:

```javascript
// Example index creation in model files
ClientSchema.index(
  { firstName: 'text', lastName: 'text', phoneNumber: 'text', clientId: 'text' },
  { background: true, name: 'client_text_search' }
);

ClientSchema.index(
  { phoneNumber: 1, isActive: 1 },
  { background: true, name: 'phone_active_lookup' }
);
```

### Query Optimization Best Practices

1. **Use Lean Queries**: For read-only operations, use `.lean()` to return plain JavaScript objects instead of Mongoose documents
2. **Field Selection**: Use `.select()` to only fetch required fields
3. **Limit Results**: Always use `.limit()` for pagination
4. **Proper Indexing**: Ensure queries use available indexes
5. **Avoid N+1 Queries**: Use population or aggregation for related data

```javascript
// Example optimized query
const clients = await Client.find({ isActive: true })
  .select('firstName lastName phoneNumber clientId')
  .lean()
  .limit(20)
  .sort({ createdAt: -1 });
```

### API Response Caching

The application implements in-memory caching for expensive operations:

- **Analytics Queries**: Cached for 10 minutes to reduce database load
- **Dashboard Metrics**: Cached for 5 minutes for real-time feel
- **Search Results**: Short-term caching for repeated searches

```javascript
// Example usage in API routes
const cacheKey = `analytics_overview_${startDate}_${endDate}`;
let cachedData = cache.get(cacheKey);

if (!cachedData) {
  cachedData = await computeExpensiveAnalytics();
  cache.set(cacheKey, cachedData, 600000); // 10 minutes
}

return cachedData;
``` 