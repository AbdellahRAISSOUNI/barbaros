import { ServiceCategory, IServiceCategory } from '../models';
import connectToDatabase from '../mongodb';

/**
 * Create a new service category
 */
export async function createServiceCategory(categoryData: Partial<IServiceCategory>) {
  try {
    await connectToDatabase();
    const category = new ServiceCategory(categoryData);
    await category.save();
    return category;
  } catch (error: any) {
    console.error('Error creating service category:', error);
    throw new Error(`Failed to create service category: ${error.message}`);
  }
}

/**
 * Get service category by ID
 */
export async function getServiceCategoryById(id: string) {
  try {
    await connectToDatabase();
    const category = await ServiceCategory.findById(id);
    return category;
  } catch (error: any) {
    console.error('Error getting service category:', error);
    throw new Error(`Failed to get service category: ${error.message}`);
  }
}

/**
 * Update service category
 */
export async function updateServiceCategory(id: string, updateData: Partial<IServiceCategory>) {
  try {
    await connectToDatabase();
    const category = await ServiceCategory.findByIdAndUpdate(id, updateData, { new: true });
    return category;
  } catch (error: any) {
    console.error('Error updating service category:', error);
    throw new Error(`Failed to update service category: ${error.message}`);
  }
}

/**
 * Delete service category
 */
export async function deleteServiceCategory(id: string) {
  try {
    await connectToDatabase();
    await ServiceCategory.findByIdAndDelete(id);
    return true;
  } catch (error: any) {
    console.error('Error deleting service category:', error);
    throw new Error(`Failed to delete service category: ${error.message}`);
  }
}

/**
 * List all service categories with pagination
 */
export async function listServiceCategories(page = 1, limit = 10, filter: any = {}) {
  try {
    await connectToDatabase();
    const skip = (page - 1) * limit;
    
    const categories = await ServiceCategory.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .skip(skip)
      .limit(limit);
      
    const total = await ServiceCategory.countDocuments(filter);
    
    return {
      categories,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error('Error listing service categories:', error);
    throw new Error(`Failed to list service categories: ${error.message}`);
  }
}

/**
 * Get all active service categories (for dropdowns)
 */
export async function getActiveServiceCategories() {
  try {
    await connectToDatabase();
    const categories = await ServiceCategory.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 });
    return categories;
  } catch (error: any) {
    console.error('Error getting active service categories:', error);
    throw new Error(`Failed to get active service categories: ${error.message}`);
  }
}

/**
 * Toggle service category status
 */
export async function toggleServiceCategoryStatus(id: string) {
  try {
    await connectToDatabase();
    const category = await ServiceCategory.findById(id);
    
    if (!category) {
      throw new Error('Service category not found');
    }
    
    category.isActive = !category.isActive;
    await category.save();
    return category;
  } catch (error: any) {
    console.error('Error toggling service category status:', error);
    throw new Error(`Failed to toggle service category status: ${error.message}`);
  }
} 