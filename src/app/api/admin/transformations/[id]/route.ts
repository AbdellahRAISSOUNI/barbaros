import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { unlink } from 'fs/promises';
import { join } from 'path';

// GET - Fetch single transformation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['owner', 'admin', 'receptionist'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    
    const transformation = await db
      .collection('transformations')
      .findOne({ _id: new ObjectId(params.id) });

    if (!transformation) {
      return NextResponse.json({ error: 'Transformation not found' }, { status: 404 });
    }

    return NextResponse.json(transformation);
  } catch (error) {
    console.error('Error fetching transformation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update transformation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['owner', 'admin', 'receptionist'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    // Update transformation
    const result = await db.collection('transformations').updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Transformation not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Transformation updated successfully'
    });

  } catch (error) {
    console.error('Error updating transformation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete transformation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['owner', 'admin', 'receptionist'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    // First get the transformation to delete associated files
    const transformation = await db
      .collection('transformations')
      .findOne({ _id: new ObjectId(params.id) });

    if (!transformation) {
      return NextResponse.json({ error: 'Transformation not found' }, { status: 404 });
    }

    // Delete associated image files
    const deleteImageFiles = async (imagePaths: string[]) => {
      for (const imagePath of imagePaths) {
        try {
          const fullPath = join(process.cwd(), 'public', imagePath);
          await unlink(fullPath);
        } catch (error) {
          console.warn(`Failed to delete image file: ${imagePath}`, error);
        }
      }
    };

    // Delete all images
    const allImages = [
      ...(transformation.beforeImages || []),
      ...(transformation.afterImages || [])
    ];
    
    if (allImages.length > 0) {
      await deleteImageFiles(allImages);
    }

    // Delete transformation from database
    const result = await db.collection('transformations').deleteOne({
      _id: new ObjectId(params.id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete transformation' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Transformation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting transformation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 