import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Visit, Client } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const endDate = new Date(searchParams.get('endDate') || new Date());
    const frequency = searchParams.get('frequency') || 'all';

    // Get basic visit counts
    const totalVisits = await Visit.countDocuments({
      visitDate: { $gte: startDate, $lte: endDate }
    });

    const uniqueClientIds = await Visit.distinct('clientId', {
      visitDate: { $gte: startDate, $lte: endDate }
    });
    const uniqueClients = uniqueClientIds.length;

    const averageVisitsPerClient = uniqueClients > 0 ? totalVisits / uniqueClients : 0;

    // Generate sample hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      visits: Math.floor(Math.random() * 10) + (hour >= 9 && hour <= 18 ? 5 : 0)
    }));

    // Generate sample daily distribution
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dailyDistribution = daysOfWeek.map(day => ({
      day,
      visits: Math.floor(Math.random() * 20) + 5
    }));

    // Find peak times
    const peakHour = hourlyDistribution.reduce((max, current) => 
      current.visits > max.visits ? current : max
    );
    const peakDay = dailyDistribution.reduce((max, current) => 
      current.visits > max.visits ? current : max
    );

    // Generate sample client patterns
    const clients = await Client.find().limit(20);
    const clientPatterns = clients.map(client => {
      const clientVisits = Math.floor(Math.random() * 15) + 1;
      const averageDaysBetweenVisits = Math.floor(Math.random() * 30) + 7;
      const frequencies = ['high', 'medium', 'low'];
      const patterns = ['regular', 'irregular', 'new'];
      
      return {
        clientId: client._id.toString(),
        clientName: `${client.firstName} ${client.lastName}`,
        totalVisits: clientVisits,
        averageDaysBetweenVisits,
        lastVisit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: frequencies[Math.floor(Math.random() * frequencies.length)] as 'high' | 'medium' | 'low',
        pattern: patterns[Math.floor(Math.random() * patterns.length)] as 'regular' | 'irregular' | 'new'
      };
    });

    // Filter client patterns by frequency if specified
    const filteredPatterns = frequency === 'all' ? clientPatterns :
      clientPatterns.filter(p => p.frequency === frequency);

    const frequencyData = {
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalVisits,
      uniqueClients,
      averageVisitsPerClient: Math.round(averageVisitsPerClient * 10) / 10,
      peakHour: `${peakHour.hour}:00`,
      peakDay: peakDay.day,
      hourlyDistribution,
      dailyDistribution,
      weeklyPattern: [] // Simplified for now
    };

    return NextResponse.json({
      success: true,
      frequencyData,
      clientPatterns: filteredPatterns
    });

  } catch (error) {
    console.error('Error fetching visit frequency data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch visit frequency data' },
      { status: 500 }
    );
  }
} 