# Database Setup

## Overview

Barbaros uses MongoDB as its primary database. MongoDB is a NoSQL document database that provides high performance, high availability, and easy scalability. The application connects to MongoDB using Mongoose, an Object Data Modeling (ODM) library for MongoDB and Node.js.

## Connection Setup

The database connection is managed in the `src/lib/db/mongodb.ts` file. The connection implementation includes:

- Connection pooling to prevent connection leaks
- Error handling for connection failures
- Caching of the connection to prevent multiple connections during development
- Timeout settings for improved reliability

### Connection Code

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barbaros';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

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