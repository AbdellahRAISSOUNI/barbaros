import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Client } from '@/lib/db/models';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { firstName, lastName, phoneNumber, password } = body;
    
    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'All fields are required',
        },
        { status: 400 }
      );
    }
    
    // Check if phone number already exists
    const existingClient = await Client.findOne({ phoneNumber });
    
    if (existingClient) {
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number already in use',
        },
        { status: 409 }
      );
    }
    
    // Generate a unique client ID
    const clientId = `C${Math.floor(10000000 + Math.random() * 90000000)}`;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    try {
      // Try to create the client
      const client = await Client.create({
        clientId,
        firstName,
        lastName,
        phoneNumber,
        passwordHash,
        dateCreated: new Date(),
        visitCount: 0,
        rewardsEarned: 0,
        rewardsRedeemed: 0,
        accountActive: true,
        preferredServices: []
      });
      
      // Return success with client info (excluding password)
      const clientInfo = {
        id: client._id,
        clientId: client.clientId,
        firstName: client.firstName,
        lastName: client.lastName,
        phoneNumber: client.phoneNumber,
        dateCreated: client.dateCreated,
      };
      
      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        client: clientInfo,
      });
    } catch (createError: any) {
      // If the error is due to the email index, try to drop it and retry
      if (createError.code === 11000 && createError.message.includes('email')) {
        try {
          // Drop the email index
          const clientsCollection = mongoose.connection.collection('clients');
          await clientsCollection.dropIndex('email_1');
          
          // Retry creating the client
          const client = await Client.create({
            clientId,
            firstName,
            lastName,
            phoneNumber,
            passwordHash,
            dateCreated: new Date(),
            visitCount: 0,
            rewardsEarned: 0,
            rewardsRedeemed: 0,
            accountActive: true,
            preferredServices: []
          });
          
          // Return success with client info (excluding password)
          const clientInfo = {
            id: client._id,
            clientId: client.clientId,
            firstName: client.firstName,
            lastName: client.lastName,
            phoneNumber: client.phoneNumber,
            dateCreated: client.dateCreated,
          };
          
          return NextResponse.json({
            success: true,
            message: 'Registration successful',
            client: clientInfo,
          });
        } catch (retryError: any) {
          throw retryError;
        }
      } else {
        throw createError;
      }
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Registration failed: ${error.message}`,
        error: error.toString(),
      },
      { status: 500 }
    );
  }
} 