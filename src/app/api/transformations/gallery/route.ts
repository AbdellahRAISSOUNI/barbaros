import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';

// GET - Fetch all active transformations for public gallery
export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    
    const transformations = await db
      .collection('transformations')
      .find({ isActive: true })
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .toArray();

    // Transform data for frontend compatibility
    const formattedTransformations = transformations.map(transformation => ({
      id: transformation.id,
      beforeImage: transformation.beforeImage,
      afterImage: transformation.afterImage,
      beforeImages: transformation.beforeImages || [transformation.beforeImage],
      afterImages: transformation.afterImages || [transformation.afterImage],
      clientName: transformation.clientName,
      service: transformation.service,
      description: transformation.description,
      category: transformation.category,
      featured: transformation.featured,
      createdAt: transformation.createdAt
    }));

    return NextResponse.json(formattedTransformations);
  } catch (error) {
    console.error('Error fetching gallery transformations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 