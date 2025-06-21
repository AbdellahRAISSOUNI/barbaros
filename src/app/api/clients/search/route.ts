import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { searchClients } from '@/lib/db/api/clientApi';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get search parameters
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');
    const q = searchParams.get('q'); // General search query
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // If specific phone search is requested
    if (phone) {
      const result = await searchClients(phone, 1);
      
      if (result.clients.length === 0) {
        return NextResponse.json(
          { message: 'No clients found' },
          { status: 404 }
        );
      }
      
      // Return the first matching client
      const client = result.clients[0];
      
      return NextResponse.json({
        success: true,
        client: {
          _id: client._id.toString(),
          clientId: client.clientId,
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber,
          visitCount: client.visitCount,
          rewardsEarned: client.rewardsEarned,
          rewardsRedeemed: client.rewardsRedeemed
        }
      });
    }
    
    // General search with pagination (for the client management page)
    if (q !== null) {
      const result = await searchClients(q, page, limit);
      
      return NextResponse.json({
        clients: result.clients,
        totalClients: result.pagination.total,
        totalPages: result.pagination.pages,
        currentPage: page
      });
    }
    
    // If no search parameters are provided
    return NextResponse.json(
      { error: 'Search query parameter is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error searching for client:', error);
    return NextResponse.json(
      { error: 'Failed to search for client' },
      { status: 500 }
    );
  }
}