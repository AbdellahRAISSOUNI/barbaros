# Authentication

## Overview

The Barbaros system implements authentication using NextAuth.js, a complete authentication solution for Next.js applications. The system supports multiple authentication methods and provides role-based access control.

## Authentication Methods

The following authentication methods are supported:

1. **Credentials Authentication**: 
   - **Admin Users**: Email and password-based authentication
   - **Client Users**: Phone number and password-based authentication
2. **OAuth Providers**: Support for Google, Facebook, etc. (planned for future)

## User Types

The system supports multiple user types with different roles and permissions:

1. **Admin Users**: Staff members who can access the admin dashboard
   - Owner: Full access to all features
   - Barber: Access to client management and appointment scheduling
   - Receptionist: Access to client management and appointment scheduling

2. **Client Users**: Customers who can access the client portal
   - Regular clients with loyalty tracking

## Authentication Flow

### Admin Authentication

1. Admin navigates to the login page (`/login`)
2. Admin selects "Admin" user type
3. Admin enters email and password
4. System validates credentials against the Admin collection
5. If valid, system creates a session and redirects to the admin dashboard
6. If invalid, system displays an error message

### Client Authentication

1. Client navigates to the login page (`/login`) 
2. Client selects "Client" user type (default)
3. Client enters phone number and password
4. System validates credentials against the Client collection using phone number
5. If valid, system creates a session and redirects to the client dashboard
6. If invalid, system displays an error message

## Client Registration

The system supports self-registration for clients:

1. Client navigates to the registration page (`/register`)
2. Client fills out the registration form with:
   - First name
   - Last name
   - Phone number
   - Password (with confirmation)
   - Optional: Date of birth, address
3. System validates the input:
   - Checks for required fields
   - Validates phone number format
   - Ensures password meets complexity requirements
   - Confirms passwords match
4. System checks for duplicate phone number
5. If validation passes:
   - Password is hashed using bcrypt
   - New client record is created
   - Client is automatically logged in
   - Client is redirected to the client dashboard

## NextAuth.js Configuration

The NextAuth.js configuration is located in `src/app/api/auth/[...nextauth]/route.ts`. The configuration includes:

- Session management
- JWT configuration
- Credentials provider setup
- Callbacks for custom authentication logic

### Example Configuration

```typescript
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/db/mongodb";
import { Admin, Client } from "@/lib/db/models";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import { JWT } from "next-auth/jwt";

// Define custom user types
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    userType: 'admin' | 'client';
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      userType: 'admin' | 'client';
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    userType: 'admin' | 'client';
  }
}

// MongoDB client for the adapter
const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/barbaros");
const clientPromise = client.connect();

// Auth options
export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password || !credentials?.userType) {
          return null;
        }

        try {
          await connectToDatabase();
          
          // Determine if admin or client login
          if (credentials.userType === 'admin') {
            // Find admin by email
            const admin = await Admin.findOne({ email: credentials.identifier });
            
            if (!admin) {
              return null;
            }
            
            // Compare password
            const passwordMatch = await admin.comparePassword(credentials.password);
            
            if (!passwordMatch) {
              return null;
            }
            
            // Update last login time
            admin.lastLogin = new Date();
            await admin.save();
            
            // Return user object
            return {
              id: admin._id.toString(),
              name: admin.name,
              email: admin.email,
              role: admin.role,
              userType: 'admin'
            };
          } else {
            // Find client by phone number
            const client = await Client.findOne({ phoneNumber: credentials.identifier });
            
            if (!client) {
              return null;
            }
            
            // Compare password
            const passwordMatch = await client.comparePassword(credentials.password);
            
            if (!passwordMatch) {
              return null;
            }
            
            // Update last login time
            client.lastLogin = new Date();
            await client.save();
            
            // Return user object (note: email field will be empty for clients)
            return {
              id: client._id.toString(),
              name: `${client.firstName} ${client.lastName}`,
              email: '', // Empty email for clients
              role: 'client',
              userType: 'client'
            };
          }
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-do-not-use-in-production",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.userType = token.userType;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
```

## Session Management

Sessions are managed using JSON Web Tokens (JWT) with a 30-day expiration by default. The session contains user information including:

- User ID
- Email
- Name
- Role
- User Type (admin or client)

## Password Security

The system implements secure password handling:

- **Minimum Length**: 6 characters (configurable)
- **Hashing**: bcrypt with salt rounds for secure storage
- **Validation**: Real-time validation during registration and password changes

```javascript
// Password hashing implementation
import bcrypt from 'bcrypt';

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### Enhanced Security Features

#### Rate Limiting
Login attempts are rate-limited to prevent brute force attacks:

```javascript
// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute window
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
};
```

#### Session Security
Enhanced session management includes:

- **Secure Tokens**: JWT tokens with proper signing and validation
- **Session Timeout**: Automatic session expiration
- **Token Refresh**: Secure token refresh mechanism
- **Cross-Site Protection**: CSRF protection and secure cookies

```javascript
// Enhanced session validation
const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      // Enhanced token validation
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      // Secure session data
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.userType = token.userType;
      }
      return session;
    }
  }
};
```

#### Input Validation and Sanitization
All authentication inputs are validated and sanitized:

```javascript
// Input validation for login
function validateAuthInput(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid input type');
  }
  
  // Sanitize and limit length
  const sanitized = input.trim().slice(0, 100);
  
  // Basic validation
  if (sanitized.length < 3) {
    throw new Error('Input too short');
  }
  
  return sanitized;
}

// Phone number validation
function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
}
```

#### Security Headers
Authentication endpoints include enhanced security headers:

```javascript
// Security headers for auth endpoints
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-XSS-Protection': '1; mode=block'
};
```

## Protected Routes

Routes are protected using middleware that checks for valid sessions. The middleware is implemented in `src/middleware.ts` and protects:

- `/admin/*` routes: Accessible only to authenticated admin users
- `/client/*` routes: Accessible only to authenticated client users

### Example Middleware

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isClientRoute = request.nextUrl.pathname.startsWith('/client');
  const isAuthRoute = request.nextUrl.pathname === '/login' || 
                      request.nextUrl.pathname === '/register';
  
  // Redirect unauthenticated users to login
  if ((isAdminRoute || isClientRoute) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect authenticated users away from auth routes
  if (isAuthRoute && token) {
    if (token.userType === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (token.userType === 'client') {
      return NextResponse.redirect(new URL('/client', request.url));
    }
  }
  
  // Check role-based access for admin routes
  if (isAdminRoute && token && token.userType !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check role-based access for client routes
  if (isClientRoute && token && token.userType !== 'client') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/client/:path*', 
    '/login',
    '/register'
  ],
};
```

## Client-Side Authentication Components

### AuthCheck Component

The `AuthCheck` component provides client-side protection for routes, showing a loading state while checking authentication and redirecting unauthorized users:

```typescript
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthCheckProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  clientOnly?: boolean;
}

export function AuthCheck({ children, adminOnly = false, clientOnly = false }: AuthCheckProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (adminOnly && session.user.userType !== 'admin') {
      router.push('/login');
      return;
    }
    
    if (clientOnly && session.user.userType !== 'client') {
      router.push('/login');
      return;
    }
  }, [session, status, router, adminOnly, clientOnly]);
  
  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Don't render children if not authenticated
  if (!session) {
    return null;
  }
  
  // Don't render children if wrong user type
  if (adminOnly && session.user.userType !== 'admin') {
    return null;
  }
  
  if (clientOnly && session.user.userType !== 'client') {
    return null;
  }
  
  return <>{children}</>;
}
```

## Database Status Checking

Both admin and client dashboards include database status checking to ensure the application is properly connected to MongoDB:

```typescript
// Example of database status check in client component
const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');

useEffect(() => {
  const checkDbStatus = async () => {
    try {
      const response = await axios.get('/api/db-status');
      setDbStatus(response.data.connected ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Error checking database status:', error);
      setDbStatus('disconnected');
    }
  };
  
  checkDbStatus();
}, []);
```

## Security Considerations

The authentication system implements several security best practices:

- Password hashing with bcrypt
- CSRF protection with NextAuth.js
- JWT-based sessions with secure cookies
- Rate limiting for login attempts
- Secure password reset flow
- HTTP-only cookies for session storage
- HTTPS-only in production

## Next Steps

For information on development setup and guidelines, see the [Development Guide](./development-guide.md). 