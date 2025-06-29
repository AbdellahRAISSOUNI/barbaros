import { Service, IService } from '../models';
import connectToDatabase from '../mongodb';

/**
 * Create a new service
 */
export async function createService(serviceData: Partial<IService>) {
  try {
    await connectToDatabase();
    const service = new Service(serviceData);
    await service.save();
    return service;
  } catch (error: any) {
    console.error('Error creating service:', error);
    throw new Error(`Failed to create service: ${error.message}`);
  }
}

/**
 * Get service by ID
 */
export async function getServiceById(id: string) {
  try {
    await connectToDatabase();
    const service = await Service.findById(id).populate('categoryId');
    return service;
  } catch (error: any) {
    console.error('Error getting service:', error);
    throw new Error(`Failed to get service: ${error.message}`);
  }
}

/**
 * Update service
 */
export async function updateService(id: string, updateData: Partial<IService>) {
  try {
    await connectToDatabase();
    const service = await Service.findByIdAndUpdate(id, updateData, { new: true }).populate('categoryId');
    return service;
  } catch (error: any) {
    console.error('Error updating service:', error);
    throw new Error(`Failed to update service: ${error.message}`);
  }
}

/**
 * Delete service
 */
export async function deleteService(id: string) {
  try {
    await connectToDatabase();
    await Service.findByIdAndDelete(id);
    return true;
  } catch (error: any) {
    console.error('Error deleting service:', error);
    throw new Error(`Failed to delete service: ${error.message}`);
  }
}

/**
 * List all services with pagination and search
 */
export async function listServices(page = 1, limit = 10, filter: any = {}, search = '') {
  try {
    await connectToDatabase();
    const skip = (page - 1) * limit;
    
    // Build search query
    let query = { ...filter };
    if (search.trim()) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const services = await Service.find(query)
      .populate({
        path: 'categoryId',
        select: 'name description',
        model: 'ServiceCategory'
      })
      .sort({ popularityScore: -1, name: 1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Service.countDocuments(query);
    
    // Transform the response to match the expected format
    const transformedServices = services.map(service => ({
      ...service.toObject(),
      category: service.categoryId ? {
        _id: service.categoryId._id,
        name: service.categoryId.name,
        description: service.categoryId.description
      } : null
    }));
    
    return {
      services: transformedServices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error('Error listing services:', error);
    throw new Error(`Failed to list services: ${error.message}`);
  }
}

/**
 * Get services by category
 */
export async function getServicesByCategory(categoryId: string, activeOnly = true) {
  try {
    await connectToDatabase();
    const filter: any = { categoryId };
    
    if (activeOnly) {
      filter.isActive = true;
    }
    
    const services = await Service.find(filter).sort({ popularityScore: -1, name: 1 });
    return services;
  } catch (error: any) {
    console.error('Error getting services by category:', error);
    throw new Error(`Failed to get services by category: ${error.message}`);
  }
}

/**
 * Update service popularity score
 */
export async function updateServicePopularity(serviceId: string, increment = 1) {
  try {
    await connectToDatabase();
    const service = await Service.findById(serviceId);
    
    if (!service) {
      throw new Error('Service not found');
    }
    
    service.popularityScore += increment;
    await service.save();
    return service;
  } catch (error: any) {
    console.error('Error updating service popularity:', error);
    throw new Error(`Failed to update service popularity: ${error.message}`);
  }
}

/**
 * Toggle service status
 */
export async function toggleServiceStatus(id: string) {
  try {
    await connectToDatabase();
    const service = await Service.findById(id);
    
    if (!service) {
      throw new Error('Service not found');
    }
    
    service.isActive = !service.isActive;
    await service.save();
    return service;
  } catch (error: any) {
    console.error('Error toggling service status:', error);
    throw new Error(`Failed to toggle service status: ${error.message}`);
  }
}

/**
 * Search services
 */
export async function searchServices(searchTerm: string, categoryId?: string) {
  try {
    await connectToDatabase();
    
    let query: any = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    const services = await Service.find(query)
      .populate('categoryId')
      .sort({ popularityScore: -1, name: 1 })
      .limit(20);
      
    return services;
  } catch (error: any) {
    console.error('Error searching services:', error);
    throw new Error(`Failed to search services: ${error.message}`);
  }
} 