import { NextRequest, NextResponse } from 'next/server';
import { getVisitsByClient } from '@/lib/db/api/visitApi';

interface Service {
  name: string;
  price: number;
  duration: number;
}

interface RewardRedeemed {
  rewardName: string;
  rewardType: 'free' | 'discount';
  discountPercentage?: number;
  redeemedAt: string;
  redeemedBy: string;
}

interface Visit {
  visitNumber: number;
  visitDate: string;
  barber: string;
  services: Service[];
  totalPrice: number;
  notes?: string;
  rewardRedeemed?: RewardRedeemed;
}

/**
 * GET /api/clients/[id]/visits/export - Export client visit data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json(
        { success: false, message: 'Invalid format. Supported formats: csv, json' },
        { status: 400 }
      );
    }

    // Get all visits for the client
    const visitsData = await getVisitsByClient(clientId, 1, 1000); // Get all visits for export

    const visits: Visit[] = visitsData.visits;

    if (format === 'json') {
      // Return JSON format
      const jsonData = {
        exportDate: new Date().toISOString(),
        clientId,
        totalVisits: visits.length,
        visits: visits.map((visit: Visit) => ({
          visitNumber: visit.visitNumber,
          visitDate: visit.visitDate,
          barber: visit.barber,
          services: visit.services.map((s: Service) => ({
            name: s.name,
            price: s.price,
            duration: s.duration
          })),
          totalPrice: visit.totalPrice,
          notes: visit.notes || '',
          rewardRedeemed: visit.rewardRedeemed ? {
            rewardName: visit.rewardRedeemed.rewardName,
            rewardType: visit.rewardRedeemed.rewardType,
            discountPercentage: visit.rewardRedeemed.discountPercentage,
            redeemedAt: visit.rewardRedeemed.redeemedAt,
            redeemedBy: visit.rewardRedeemed.redeemedBy
          } : null
        }))
      };

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="visit-history-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    } else {
      // Return CSV format
      const csvHeaders = [
        'Visit Number',
        'Date',
        'Barber',
        'Services',
        'Total Price',
        'Reward Redeemed',
        'Reward Type',
        'Notes'
      ].join(',');

      const csvRows = visits.map((visit: Visit) => {
        const services = visit.services.map((s: Service) => s.name).join('; ');
        const rewardInfo = visit.rewardRedeemed 
          ? `${visit.rewardRedeemed.rewardName} (${visit.rewardRedeemed.rewardType})`
          : '';
        const rewardType = visit.rewardRedeemed 
          ? visit.rewardRedeemed.rewardType === 'free' 
            ? 'Free Service' 
            : `${visit.rewardRedeemed.discountPercentage}% Discount`
          : '';

        return [
          visit.visitNumber,
          new Date(visit.visitDate).toLocaleDateString(),
          `"${visit.barber}"`,
          `"${services}"`,
          visit.totalPrice.toFixed(2),
          `"${rewardInfo}"`,
          `"${rewardType}"`,
          `"${(visit.notes || '').replace(/"/g, '""')}"`
        ].join(',');
      });

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="visit-history-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
  } catch (error: any) {
    console.error('Error exporting visit data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export visit data' },
      { status: 500 }
    );
  }
} 