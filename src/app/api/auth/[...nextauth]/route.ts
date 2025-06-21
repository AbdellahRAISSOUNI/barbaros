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
        identifier: { label: "Email/Phone", type: "text" },
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
            // Find admin by email (admins still use email)
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
            // Find client by phone number (clients use phone numbers)
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 