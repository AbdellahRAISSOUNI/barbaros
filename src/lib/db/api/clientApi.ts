import { Client, IClient } from '../models';
import connectToDatabase from '../mongodb';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { Visit } from '../models';

/**
 * Create a new client
 */
export async function createClient(clientData: Partial<IClient>) {
  try {
    await connectToDatabase();
    
    // Generate client ID if not provided
    if (!clientData.clientId) {
      clientData.clientId = `C${nanoid(8)}`;
    }
    
    // Hash password if provided
    if (clientData.password) {
      const saltRounds = 12;
      clientData.passwordHash = await bcrypt.hash(clientData.password, saltRounds);
      // Remove password from clientData to avoid storing it
      delete clientData.password;
    } else if (!clientData.passwordHash) {
      // Generate a default password if none provided (for admin-created clients)
      const defaultPassword = nanoid(12);
      const saltRounds = 12;
      clientData.passwordHash = await bcrypt.hash(defaultPassword, saltRounds);
    }
    
    // Generate QR code URL (in a real app, this would generate and store an actual QR code)
    if (!clientData.qrCodeUrl) {
      clientData.qrCodeUrl = `/api/qrcode/${clientData.clientId}`;
    }
    
    const client = new Client(clientData);
    await client.save();
    return client;
  } catch (error: any) {
    console.error('Error creating client:', error);
    throw new Error(`Failed to create client: ${error.message}`);
  }
}

/**
 * Get client by ID (MongoDB _id)
 */
export async function getClientById(id: string) {
  try {
    await connectToDatabase();
    // Check if the id is a valid MongoDB ObjectId format
    // If not, return null instead of throwing an error
    // This allows the route handler to try getClientByClientId instead
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return null;
    }
    const client = await Client.findById(id);
    return client;
  } catch (error: any) {
    console.error('Error getting client:', error);
    // Return null instead of throwing to allow fallback to getClientByClientId
    return null;
  }
}

/**
 * Get client by client ID
 */
export async function getClientByClientId(clientId: string) {
  try {
    await connectToDatabase();
    const client = await Client.findOne({ clientId });
    return client;
  } catch (error: any) {
    console.error('Error getting client by client ID:', error);
    throw new Error(`Failed to get client by client ID: ${error.message}`);
  }
}

/**
 * Get client by phone number
 */
export async function getClientByPhone(phoneNumber: string) {
  try {
    await connectToDatabase();
    const client = await Client.findOne({ phoneNumber });
    return client;
  } catch (error: any) {
    console.error('Error getting client by phone number:', error);
    throw new Error(`Failed to get client by phone number: ${error.message}`);
  }
}

/**
 * Update client
 */
export async function updateClient(id: string, updateData: Partial<IClient>) {
  try {
    await connectToDatabase();
    const client = await Client.findByIdAndUpdate(id, updateData, { new: true });
    return client;
  } catch (error: any) {
    console.error('Error updating client:', error);
    throw new Error(`Failed to update client: ${error.message}`);
  }
}

/**
 * Delete client
 */
export async function deleteClient(id: string) {
  try {
    await connectToDatabase();
    await Client.findByIdAndDelete(id);
    return true;
  } catch (error: any) {
    console.error('Error deleting client:', error);
    throw new Error(`Failed to delete client: ${error.message}`);
  }
}

/**
 * List all clients with pagination, filtering, and sorting
 */
export async function listClients(page = 1, limit = 10, filter: any = {}, sort: any = { lastName: 1, firstName: 1 }) {
  try {
    await connectToDatabase();
    const skip = (page - 1) * limit;
    
    // PHASE 2 FIX: Use lean queries and select only needed fields
    const clients = await Client.find(filter)
      .select('clientId firstName lastName phoneNumber visitCount totalLifetimeVisits currentProgressVisits rewardsEarned rewardsRedeemed accountActive lastVisit loyaltyStatus createdAt updatedAt')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(); // Lean for better performance
    
    // Calculate total spent and average visit value for each client
    const clientsWithFinancials = await Promise.all(
      clients.map(async (client) => {
        const totalSpent = await calculateClientTotalSpent(client._id.toString());
        const averageVisitValue = await calculateClientAverageVisitValue(client._id.toString());
        
        return {
          ...client,
          totalSpent,
          averageVisitValue
        };
      })
    );
      
    const total = await Client.countDocuments(filter);
    
    return {
      clients: clientsWithFinancials,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error('Error listing clients:', error);
    throw new Error(`Failed to list clients: ${error.message}`);
  }
}

/**
 * Update client visit count
 */
export async function updateClientVisitCount(clientId: string, increment = 1) {
  try {
    await connectToDatabase();
    const client = await Client.findById(clientId);
    
    if (!client) {
      throw new Error('Client not found');
    }
    
    client.visitCount += increment;
    client.lastVisit = new Date();
    
    // Check if client has earned a new reward based on visit count
    // This is a simplified version, you might want to implement more complex logic
    const visitsPerReward = 10; // Example: reward every 10 visits
    if (client.visitCount % visitsPerReward === 0) {
      client.rewardsEarned += 1;
    }
    
    await client.save();
    return client;
  } catch (error: any) {
    console.error('Error updating client visit count:', error);
    throw new Error(`Failed to update client visit count: ${error.message}`);
  }
}

/**
 * Search clients with enhanced filtering and sorting
 */
export async function searchClients(query: string, page = 1, limit = 10, options: any = {}) {
  try {
    await connectToDatabase();
    const skip = (page - 1) * limit;
    
    // PHASE 2 FIX: Use text search if available, fallback to regex
    let searchQuery: any;
    let sortOption: any = { lastName: 1, firstName: 1 };
    
    // Check if query looks like a phone number
    const isPhoneQuery = /^[\d\s\-\+\(\)\.]+$/.test(query);
    
    if (isPhoneQuery) {
      // Exact phone number search with partial matching
      const cleanQuery = query.replace(/[\s\-\+\(\)\.]/g, '');
      searchQuery = {
        $or: [
          { phoneNumber: new RegExp(cleanQuery, 'i') },
          { phoneNumber: new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
        ]
      };
    } else if (query.length >= 3) {
      // Use text search for better performance on longer queries
      try {
        searchQuery = { $text: { $search: query } };
        sortOption = { score: { $meta: 'textScore' }, lastName: 1 };
      } catch (textSearchError) {
        // Fallback to regex if text search fails
        console.warn('Text search not available, using regex fallback');
        const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        searchQuery = {
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { clientId: searchRegex }
      ]
        };
      }
    } else {
      // For short queries, use targeted regex search
      const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      searchQuery = {
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { phoneNumber: searchRegex },
        { clientId: searchRegex }
      ]
      };
    }
    
    // Apply additional filters
    if (options.status && options.status !== 'all') {
      searchQuery.accountActive = options.status === 'active';
    }
    
    if (options.loyaltyStatus && options.loyaltyStatus !== 'all') {
      searchQuery.loyaltyStatus = options.loyaltyStatus;
    }
    
    if (options.visitRange && options.visitRange !== 'all') {
      switch (options.visitRange) {
        case '0-5':
          searchQuery.totalLifetimeVisits = { $gte: 0, $lte: 5 };
          break;
        case '6-15':
          searchQuery.totalLifetimeVisits = { $gte: 6, $lte: 15 };
          break;
        case '16-30':
          searchQuery.totalLifetimeVisits = { $gte: 16, $lte: 30 };
          break;
        case '30+':
          searchQuery.totalLifetimeVisits = { $gt: 30 };
          break;
      }
    }
    
    if (options.dateRange && options.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (options.dateRange) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      searchQuery.createdAt = { $gte: startDate };
    }
    
    // Apply custom sorting if provided
    if (options.sortBy && options.sortOrder) {
      sortOption = {};
      sortOption[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
    }
    
    // PHASE 2 FIX: Use lean queries for better performance
    const clients = await Client.find(searchQuery)
      .select('clientId firstName lastName phoneNumber visitCount totalLifetimeVisits currentProgressVisits rewardsEarned rewardsRedeemed accountActive lastVisit loyaltyStatus createdAt updatedAt')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(); // Lean for better performance
    
    // Calculate total spent and average visit value for each client
    const clientsWithFinancials = await Promise.all(
      clients.map(async (client) => {
        const totalSpent = await calculateClientTotalSpent(client._id.toString());
        const averageVisitValue = await calculateClientAverageVisitValue(client._id.toString());
        
        return {
          ...client,
          totalSpent,
          averageVisitValue
        };
      })
    );
      
    const total = await Client.countDocuments(searchQuery);
    
    return {
      clients: clientsWithFinancials,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error('Error searching clients:', error);
    throw new Error(`Failed to search clients: ${error.message}`);
  }
}

/**
 * Calculate total spent for a client
 */
export async function calculateClientTotalSpent(clientId: string): Promise<number> {
  try {
    await connectToDatabase();
    
    // Aggregate visits to calculate total spent
    const result = await Visit.aggregate([
      { $match: { clientId: new mongoose.Types.ObjectId(clientId) } },
      { $group: { _id: null, totalSpent: { $sum: '$totalPrice' } } }
    ]);
    
    return result.length > 0 ? result[0].totalSpent : 0;
  } catch (error: any) {
    console.error('Error calculating client total spent:', error);
    return 0;
  }
}

/**
 * Calculate average visit value for a client
 */
export async function calculateClientAverageVisitValue(clientId: string): Promise<number> {
  try {
    await connectToDatabase();
    
    // Aggregate visits to calculate average
    const result = await Visit.aggregate([
      { $match: { clientId: new mongoose.Types.ObjectId(clientId) } },
      { 
        $group: { 
          _id: null, 
          totalSpent: { $sum: '$totalPrice' },
          visitCount: { $sum: 1 }
        } 
      }
    ]);
    
    if (result.length > 0 && result[0].visitCount > 0) {
      return Math.round((result[0].totalSpent / result[0].visitCount) * 100) / 100;
    }
    
    return 0;
  } catch (error: any) {
    console.error('Error calculating client average visit value:', error);
    return 0;
  }
}