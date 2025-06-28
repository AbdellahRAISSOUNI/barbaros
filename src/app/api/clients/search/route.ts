import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { searchClients } from '@/lib/db/api/clientApi';

// PHASE 1 FIX: Input validation and sanitization utilities
function sanitizeString(input: string | null): string | null {
  if (!input) return null;
  
  // Remove potential harmful characters and excessive whitespace
  return input
    .replace(/[<>\"'%;()&+]/g, '') // Remove potentially harmful characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .substring(0, 100); // Limit length to prevent abuse
}

function validatePhoneNumber(phone: string): boolean {
  // Allow various phone number formats but prevent injection
  const phoneRegex = /^[\d\s\-\+\(\)\.]{7,20}$/;
  return phoneRegex.test(phone);
}

function validatePagination(page: number, limit: number): { page: number; limit: number } {
  // Ensure pagination parameters are within reasonable bounds
  const validPage = Math.max(1, Math.min(page || 1, 1000)); // Max 1000 pages
  const validLimit = Math.max(1, Math.min(limit || 10, 100)); // Max 100 items per page
  
  return { page: validPage, limit: validLimit };
}

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
    
    // Get search parameters with validation
    const searchParams = request.nextUrl.searchParams;
    const rawPhone = searchParams.get('phone');
    const rawQuery = searchParams.get('q');
    const rawPage = searchParams.get('page');
    const rawLimit = searchParams.get('limit');
    
    // PHASE 1 FIX: Sanitize and validate all inputs
    const phone = sanitizeString(rawPhone);
    const q = sanitizeString(rawQuery);
    const { page, limit } = validatePagination(
      parseInt(rawPage || '1'), 
      parseInt(rawLimit || '10')
    );
    
    // Additional validation for phone search
    if (phone && !validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
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
    if (q !== null && q.length >= 2) { // Minimum search length
      // Get additional filter parameters
      const sortBy = searchParams.get('sortBy') || 'lastName';
      const sortOrder = searchParams.get('sortOrder') || 'asc';
      const status = searchParams.get('status');
      const loyaltyStatus = searchParams.get('loyaltyStatus');
      const visitRange = searchParams.get('visitRange');
      const dateRange = searchParams.get('dateRange');
      
      const result = await searchClients(q, page, limit, {
        sortBy,
        sortOrder,
        status,
        loyaltyStatus,
        visitRange,
        dateRange
      });
      
      return NextResponse.json({
        clients: result.clients,
        totalClients: result.pagination.total,
        totalPages: result.pagination.pages,
        currentPage: page
      });
    }
    
    // If no valid search parameters are provided
    return NextResponse.json(
      { error: 'Search query parameter is required (minimum 2 characters)' },
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