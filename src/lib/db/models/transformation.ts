import { ObjectId } from 'mongodb';

export interface Transformation {
  _id?: ObjectId;
  id: string;
  beforeImage: string; // Primary before image (backward compatibility)
  afterImage: string;  // Primary after image (backward compatibility)
  beforeImages: string[]; // Array of all before images for carousel
  afterImages: string[];  // Array of all after images for carousel
  clientName: string;
  service: string;
  description: string;
  featured: boolean;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean; // For soft delete
  order?: number; // For custom ordering
  tags?: string[]; // Additional tags for filtering
}

export interface TransformationCreate {
  id: string;
  beforeImage: string;
  afterImage: string;
  clientName: string;
  service: string;
  description: string;
  featured?: boolean;
  category: string;
  tags?: string[];
  order?: number;
}

export interface TransformationUpdate {
  beforeImage?: string;
  afterImage?: string;
  clientName?: string;
  service?: string;
  description?: string;
  featured?: boolean;
  category?: string;
  tags?: string[];
  order?: number;
  isActive?: boolean;
}

export interface TransformationFilter {
  category?: string;
  featured?: boolean;
  isActive?: boolean;
  tags?: string[];
}

// Categories enum for consistent categorization
export enum TransformationCategory {
  CLASSIC = 'Classic',
  EXECUTIVE = 'Executive',
  BEARD = 'Beard',
  MODERN = 'Modern',
  SPECIAL = 'Special'
}

// Common services enum
export enum ServiceType {
  COMPLETE_TRANSFORMATION = 'COMPLETE TRANSFORMATION',
  EXECUTIVE_STYLING = 'EXECUTIVE STYLING',
  BEARD_SCULPTING = 'BEARD SCULPTING',
  MODERN_CUT = 'MODERN CUT',
  CLASSIC_GENTLEMAN = 'CLASSIC GENTLEMAN',
  EXECUTIVE_TRIM = 'EXECUTIVE TRIM'
}

export const transformationSchema = {
  id: { type: 'string', required: true, unique: true },
  beforeImage: { type: 'string', required: true },
  afterImage: { type: 'string', required: true },
  beforeImages: { type: 'array', items: { type: 'string' }, default: [] },
  afterImages: { type: 'array', items: { type: 'string' }, default: [] },
  clientName: { type: 'string', required: true },
  service: { type: 'string', required: true },
  description: { type: 'string', required: true },
  featured: { type: 'boolean', default: false },
  category: { type: 'string', required: true, enum: Object.values(TransformationCategory) },
  createdAt: { type: 'date', default: () => new Date() },
  updatedAt: { type: 'date', default: () => new Date() },
  isActive: { type: 'boolean', default: true },
  order: { type: 'number', default: 0 },
  tags: { type: 'array', items: { type: 'string' }, default: [] }
};

// Future API endpoints structure for admin management
export const transformationApiEndpoints = {
  // GET /api/admin/transformations - Get all transformations
  getAll: '/api/admin/transformations',
  
  // POST /api/admin/transformations - Create new transformation
  create: '/api/admin/transformations',
  
  // GET /api/admin/transformations/[id] - Get single transformation
  getById: '/api/admin/transformations/[id]',
  
  // PUT /api/admin/transformations/[id] - Update transformation
  update: '/api/admin/transformations/[id]',
  
  // DELETE /api/admin/transformations/[id] - Delete transformation
  delete: '/api/admin/transformations/[id]',
  
  // POST /api/admin/transformations/upload - Upload images
  uploadImages: '/api/admin/transformations/upload',
  
  // GET /api/transformations/gallery - Public gallery endpoint
  publicGallery: '/api/transformations/gallery',
  
  // GET /api/transformations/featured - Get featured transformations
  featured: '/api/transformations/featured'
};

// Default transformation data for seeding
export const defaultTransformations: TransformationCreate[] = [
  {
    id: 'marcus-complete-transformation',
    beforeImage: '/images/before-1.jpg',
    afterImage: '/images/after-1.jpg',
    clientName: 'MARCUS',
    service: ServiceType.COMPLETE_TRANSFORMATION,
    description: 'Classic cut with precision beard sculpting',
    featured: true,
    category: TransformationCategory.CLASSIC,
    order: 1
  },
  {
    id: 'alessandro-executive-styling',
    beforeImage: '/images/before-2.jpg',
    afterImage: '/images/after-2.jpg',
    clientName: 'ALESSANDRO',
    service: ServiceType.EXECUTIVE_STYLING,
    description: 'Modern sophistication meets timeless elegance',
    featured: true,
    category: TransformationCategory.EXECUTIVE,
    order: 2
  },
  {
    id: 'david-beard-sculpting',
    beforeImage: '/images/before-3.jpg',
    afterImage: '/images/after-3.jpg',
    clientName: 'DAVID',
    service: ServiceType.BEARD_SCULPTING,
    description: 'Professional beard design and styling',
    featured: false,
    category: TransformationCategory.BEARD,
    order: 3
  }
]; 