import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Visit } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeClient = searchParams.get('includeClient') === 'true';
    const sortBy = searchParams.get('sortBy') || 'visitDate';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $sort: { [sortBy]: sortOrder }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ];

    // Add client lookup if requested
    if (includeClient) {
      pipeline.splice(-2, 0, {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'clientId',
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                phoneNumber: 1,
                email: 1
              }
            }
          ]
        }
      });

      pipeline.splice(-2, 0, {
        $unwind: '$clientId'
      });
    }

    // Execute aggregation
    const visits = await Visit.aggregate(pipeline);

    // Get total count for pagination
    const totalCount = await Visit.countDocuments();

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      visits,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: totalPages,
        hasNext: hasNextPage,
        hasPrev: hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch visits' },
      { status: 500 }
    );
  }
} 