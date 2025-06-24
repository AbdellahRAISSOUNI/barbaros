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

// PHASE 1 FIX: Simple in-memory cache for API responses
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache: Map<string, CacheEntry> = new Map();

  set(key: string, data: any, ttlSeconds: number = 300): void {
    const ttl = ttlSeconds * 1000; // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const apiCache = new SimpleCache();

// Run cleanup every 5 minutes
setInterval(() => {
  apiCache.cleanup();
}, 5 * 60 * 1000);

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
export { connectToDatabase }; 