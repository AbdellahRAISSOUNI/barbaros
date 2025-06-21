import { Visit, IVisit, Client } from '../models';
import connectToDatabase from '../mongodb';
import { updateClientVisitCount } from './clientApi';
import { updateServicePopularity } from './serviceApi';

/**
 * Create a new visit
 */
export async function createVisit(visitData: Partial<IVisit>) {
  try {
    await connectToDatabase();
    
    // Get client to determine visit number
    const client = await Client.findById(visitData.clientId);
    if (!client) {
      throw new Error('Client not found');
    }
    
    // Set visit number (will be updated by recordVisitForLoyalty)
    visitData.visitNumber = client.visitCount + 1;
    
    // Calculate total price if not provided
    if (!visitData.totalPrice && visitData.services && visitData.services.length > 0) {
      visitData.totalPrice = visitData.services.reduce((sum, service) => sum + service.price, 0);
    }
    
    // Create and save visit
    const visit = new Visit(visitData);
    await visit.save();
    
    // NOTE: Visit count is updated by recordVisitForLoyalty() to prevent double counting
    // Only update service popularity here
    if (visitData.services && visitData.services.length > 0) {
      for (const service of visitData.services) {
        await updateServicePopularity(String(service.serviceId));
      }
    }
    
    return visit;
  } catch (error: any) {
    console.error('Error creating visit:', error);
    throw new Error(`Failed to create visit: ${error.message}`);
  }
}

/**
 * Get visit by ID
 */
export async function getVisitById(id: string) {
  try {
    await connectToDatabase();
    const visit = await Visit.findById(id).populate('clientId');
    return visit;
  } catch (error: any) {
    console.error('Error getting visit:', error);
    throw new Error(`Failed to get visit: ${error.message}`);
  }
}

/**
 * Update visit
 */
export async function updateVisit(id: string, updateData: Partial<IVisit>) {
  try {
    await connectToDatabase();
    
    // Recalculate total price if services are updated
    if (updateData.services && updateData.services.length > 0) {
      updateData.totalPrice = updateData.services.reduce((sum, service) => sum + service.price, 0);
    }
    
    const visit = await Visit.findByIdAndUpdate(id, updateData, { new: true });
    return visit;
  } catch (error: any) {
    console.error('Error updating visit:', error);
    throw new Error(`Failed to update visit: ${error.message}`);
  }
}

/**
 * Delete visit
 */
export async function deleteVisit(id: string) {
  try {
    await connectToDatabase();
    
    // Get visit to update client count
    const visit = await Visit.findById(id);
    if (!visit) {
      throw new Error('Visit not found');
    }
    
    // Update client visit count (decrement)
    await updateClientVisitCount(String(visit.clientId), -1);
    
    // Delete the visit
    await Visit.findByIdAndDelete(id);
    return true;
  } catch (error: any) {
    console.error('Error deleting visit:', error);
    throw new Error(`Failed to delete visit: ${error.message}`);
  }
}

/**
 * List all visits with pagination
 */
export async function listVisits(page = 1, limit = 10, filter: any = {}) {
  try {
    await connectToDatabase();
    const skip = (page - 1) * limit;
    
    const visits = await Visit.find(filter)
      .populate('clientId')
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Visit.countDocuments(filter);
    
    return {
      visits,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error('Error listing visits:', error);
    throw new Error(`Failed to list visits: ${error.message}`);
  }
}

/**
 * Get visits by client
 */
export async function getVisitsByClient(clientId: string, page = 1, limit = 10) {
  try {
    await connectToDatabase();
    const skip = (page - 1) * limit;
    
    const visits = await Visit.find({ clientId })
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Visit.countDocuments({ clientId });
    
    return {
      visits,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error('Error getting visits by client:', error);
    throw new Error(`Failed to get visits by client: ${error.message}`);
  }
}

/**
 * Get visits by date range
 */
export async function getVisitsByDateRange(startDate: Date, endDate: Date, page = 1, limit = 10) {
  try {
    await connectToDatabase();
    const skip = (page - 1) * limit;
    
    const filter = {
      visitDate: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    const visits = await Visit.find(filter)
      .populate('clientId')
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Visit.countDocuments(filter);
    
    return {
      visits,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error('Error getting visits by date range:', error);
    throw new Error(`Failed to get visits by date range: ${error.message}`);
  }
}