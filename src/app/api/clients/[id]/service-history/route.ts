import { NextRequest, NextResponse } from 'next/server';
import { getVisitsByClient } from '@/lib/db/api/visitApi';

/**
 * GET /api/clients/[id]/service-history - Get client service analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;

    // Get all visits for the client
    const visitsData = await getVisitsByClient(clientId, 1, 1000);
    const visits = visitsData.visits;

    if (!visits.length) {
      return NextResponse.json({
        success: true,
        services: [],
        monthlyTrends: []
      });
    }

    // Process service data
    const serviceMap = new Map();
    const monthlyMap = new Map();

    visits.forEach((visit: any) => {
      const visitDate = new Date(visit.visitDate);
      const monthKey = `${visitDate.getFullYear()}-${String(visitDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = visitDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

      // Process services
      visit.services.forEach((service: any) => {
        const serviceName = service.name;
        
        if (serviceMap.has(serviceName)) {
          const existing = serviceMap.get(serviceName);
          existing.count += 1;
          existing.totalSpent += service.price;
          existing.lastUsed = new Date(Math.max(new Date(existing.lastUsed).getTime(), visitDate.getTime())).toISOString();
        } else {
          serviceMap.set(serviceName, {
            name: serviceName,
            count: 1,
            totalSpent: service.price,
            averagePrice: service.price,
            lastUsed: visit.visitDate,
            category: service.category || 'General'
          });
        }
      });

      // Process monthly data
      if (monthlyMap.has(monthKey)) {
        const existing = monthlyMap.get(monthKey);
        existing.visits += 1;
        existing.totalSpent += visit.totalPrice;
        
        // Track popular service for the month
        const serviceNames = visit.services.map((s: any) => s.name);
        serviceNames.forEach((name: string) => {
          existing.serviceCount[name] = (existing.serviceCount[name] || 0) + 1;
        });
      } else {
        const serviceCount: { [key: string]: number } = {};
        visit.services.forEach((s: any) => {
          serviceCount[s.name] = (serviceCount[s.name] || 0) + 1;
        });

        monthlyMap.set(monthKey, {
          month: monthName,
          visits: 1,
          totalSpent: visit.totalPrice,
          serviceCount
        });
      }
    });

    // Calculate averages and sort services
    const services = Array.from(serviceMap.values())
      .map(service => ({
        ...service,
        averagePrice: service.totalSpent / service.count
      }))
      .sort((a, b) => b.count - a.count);

    // Process monthly trends
    const monthlyTrends = Array.from(monthlyMap.values())
      .map(month => {
        const popularService = Object.entries(month.serviceCount)
          .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';
        
        return {
          month: month.month,
          visits: month.visits,
          totalSpent: month.totalSpent,
          popularService
        };
      })
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12); // Last 12 months

    return NextResponse.json({
      success: true,
      services,
      monthlyTrends
    });
  } catch (error: any) {
    console.error('Error fetching service history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service history' },
      { status: 500 }
    );
  }
}