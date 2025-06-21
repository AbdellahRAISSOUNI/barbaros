import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Client, Visit } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    const endDate = new Date(searchParams.get('endDate') || new Date());
    const period = searchParams.get('period') || 'monthly';

    // Generate sample data for demonstration
    const growthData = [];
    const currentDate = new Date(startDate);
    let totalClients = await Client.countDocuments({ createdAt: { $lt: startDate } });

    while (currentDate <= endDate) {
      let dateString: string;
      let increment: number;
      
      if (period === 'daily') {
        dateString = currentDate.toISOString().split('T')[0];
        increment = 1;
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (period === 'weekly') {
        const year = currentDate.getFullYear();
        const week = Math.ceil(currentDate.getDate() / 7);
        dateString = `${year}-W${week.toString().padStart(2, '0')}`;
        increment = 7;
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        increment = 30;
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Simulate new clients (random between 0-5)
      const newClients = Math.floor(Math.random() * 6);
      totalClients += newClients;

      // Simulate active clients (50-80% of total)
      const activeClients = Math.floor(totalClients * (0.5 + Math.random() * 0.3));

      growthData.push({
        date: dateString,
        newClients,
        totalClients,
        activeClients
      });
    }

    return NextResponse.json({
      success: true,
      growthData
    });

  } catch (error) {
    console.error('Error fetching client growth data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch client growth data' },
      { status: 500 }
    );
  }
} 