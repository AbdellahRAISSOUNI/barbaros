import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Service, Visit } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const endDate = new Date(searchParams.get('endDate') || new Date());
    const sortBy = searchParams.get('sortBy') || 'bookings';
    const category = searchParams.get('category') || 'all';

    // Get all services
    const services = await Service.find({ isActive: true });
    const categories = [...new Set(services.map(s => s.category))];

    // Generate sample popularity data
    const serviceData = services.map((service) => {
      const totalBookings = Math.floor(Math.random() * 50) + 10;
      const averagePrice = service.price || Math.floor(Math.random() * 50) + 20;
      const totalRevenue = totalBookings * averagePrice;
      const uniqueClients = Math.floor(totalBookings * (0.6 + Math.random() * 0.3));
      const trendPercentage = (Math.random() - 0.5) * 40; // -20% to +20%
      const lastMonthBookings = Math.floor(totalBookings * (0.8 + Math.random() * 0.4));
      const thisMonthBookings = totalBookings - lastMonthBookings;

      return {
        serviceId: service._id.toString(),
        serviceName: service.name,
        category: service.category || 'General',
        totalBookings,
        totalRevenue,
        averagePrice,
        uniqueClients,
        trendPercentage,
        lastMonthBookings,
        thisMonthBookings
      };
    });

    // Filter by category if specified
    let filteredData = category === 'all' ? serviceData : 
      serviceData.filter(s => s.category === category);

    // Sort the data
    switch (sortBy) {
      case 'revenue':
        filteredData.sort((a, b) => b.totalRevenue - a.totalRevenue);
        break;
      case 'clients':
        filteredData.sort((a, b) => b.uniqueClients - a.uniqueClients);
        break;
      case 'trend':
        filteredData.sort((a, b) => b.trendPercentage - a.trendPercentage);
        break;
      case 'bookings':
      default:
        filteredData.sort((a, b) => b.totalBookings - a.totalBookings);
        break;
    }

    return NextResponse.json({
      success: true,
      services: filteredData,
      categories
    });

  } catch (error) {
    console.error('Error fetching service popularity data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service popularity data' },
      { status: 500 }
    );
  }
} 