import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db/mongodb';
import { Transformation, TransformationCreate } from '@/lib/db/models/transformation';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET - Fetch all transformations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['owner', 'admin', 'receptionist'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    const transformations = await db
      .collection('transformations')
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(transformations);
  } catch (error) {
    console.error('Error fetching transformations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new transformation with image upload
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['owner', 'admin', 'receptionist'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Extract form fields
    const clientName = formData.get('clientName') as string;
    const service = formData.get('service') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const featured = formData.get('featured') === 'true';

    // Extract files
    const beforeImages = formData.getAll('beforeImages') as File[];
    const afterImages = formData.getAll('afterImages') as File[];

    if (!clientName || !service || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (beforeImages.length === 0 || afterImages.length === 0) {
      return NextResponse.json({ error: 'Both before and after images are required' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'transformations');
    await mkdir(uploadsDir, { recursive: true });

    // Process and save images
    const processImages = async (images: File[], type: 'before' | 'after') => {
      const imagePaths: string[] = [];
      
      for (const image of images) {
        if (!image.type.startsWith('image/')) {
          throw new Error(`Invalid file type: ${image.type}`);
        }
        
        // Generate unique filename
        const extension = image.name.split('.').pop();
        const filename = `${type}-${uuidv4()}.${extension}`;
        const filepath = join(uploadsDir, filename);
        
        // Convert file to buffer and save
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);
        
        // Store relative path for database
        imagePaths.push(`/uploads/transformations/${filename}`);
      }
      
      return imagePaths;
    };

    const beforeImagePaths = await processImages(beforeImages, 'before');
    const afterImagePaths = await processImages(afterImages, 'after');

    // Create transformation data
    const transformationId = `transformation-${uuidv4()}`;
    const transformationData: Omit<Transformation, '_id'> = {
      id: transformationId,
      beforeImage: beforeImagePaths[0], // Primary image for compatibility
      afterImage: afterImagePaths[0],   // Primary image for compatibility
      beforeImages: beforeImagePaths,   // All images for carousel
      afterImages: afterImagePaths,     // All images for carousel
      clientName: clientName.toUpperCase(),
      service,
      description,
      category,
      featured,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      order: 0,
      tags: []
    };

    // Save to database
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    const result = await db.collection('transformations').insertOne(transformationData);

    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      message: 'Transformation created successfully'
    });

  } catch (error) {
    console.error('Error creating transformation:', error);
    return NextResponse.json({ 
      error: 'Failed to create transformation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 