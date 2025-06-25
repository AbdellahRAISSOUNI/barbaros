import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Visit, Client, Service, Admin, Reward, BarberStats } from '@/lib/db/models';

// Note: For production, you would typically use libraries like:
// - jsPDF for PDF generation
// - csv-writer for CSV files
// - exceljs for Excel files
// For this implementation, we'll provide mock exports and placeholder functionality

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const endDate = new Date(searchParams.get('endDate') || new Date());
    const reportType = searchParams.get('reportType') || 'overview';
    const format = searchParams.get('format') || 'csv';
    const barber = searchParams.get('barber');
    const service = searchParams.get('service');

    // Fetch data based on report type
    let reportData: any = {};
    
    switch (reportType) {
      case 'overview':
        reportData = await generateOverviewReport(startDate, endDate);
        break;
      case 'financial':
        reportData = await generateFinancialReport(startDate, endDate);
        break;
      case 'services':
        reportData = await generateServicesReport(startDate, endDate, service);
        break;
      case 'clients':
        reportData = await generateClientsReport(startDate, endDate);
        break;
      case 'barbers':
        reportData = await generateBarbersReport(startDate, endDate, barber);
        break;
      case 'loyalty':
        reportData = await generateLoyaltyReport(startDate, endDate);
        break;
      default:
        reportData = await generateOverviewReport(startDate, endDate);
    }

    // Generate export based on format
    switch (format) {
      case 'csv':
        return generateCSVExport(reportData, reportType, startDate, endDate);
      case 'excel':
        return generateExcelExport(reportData, reportType, startDate, endDate);
      case 'pdf':
        return generatePDFExport(reportData, reportType, startDate, endDate);
      default:
        return generateCSVExport(reportData, reportType, startDate, endDate);
    }

  } catch (error) {
    console.error('Error generating report export:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate report export' },
      { status: 500 }
    );
  }
}

async function generateOverviewReport(startDate: Date, endDate: Date) {
  // Fetch overview data
  const totalClients = await Client.countDocuments();
  const newClients = await Client.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const totalVisits = await Visit.countDocuments({
    visitDate: { $gte: startDate, $lte: endDate }
  });

  const visits = await Visit.find({
    visitDate: { $gte: startDate, $lte: endDate }
  }).select('totalPrice visitDate');

  const totalRevenue = visits.reduce((sum, visit) => sum + (visit.totalPrice || 0), 0);
  const averageVisitValue = totalVisits > 0 ? totalRevenue / totalVisits : 0;

  const activeClients = await Visit.distinct('clientId', {
    visitDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  return {
    summary: {
      reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalClients,
      newClients,
      activeClients: activeClients.length,
      totalVisits,
      totalRevenue,
      averageVisitValue
    },
    dailyBreakdown: await getDailyBreakdown(startDate, endDate)
  };
}

async function generateFinancialReport(startDate: Date, endDate: Date) {
  const visits = await Visit.find({
    visitDate: { $gte: startDate, $lte: endDate }
  }).populate('clientId', 'firstName lastName').select('totalPrice visitDate services barber');

  const revenueByDay = await Visit.aggregate([
    {
      $match: {
        visitDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$visitDate' }
        },
        totalRevenue: { $sum: '$totalPrice' },
        totalVisits: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const revenueByBarber = await Visit.aggregate([
    {
      $match: {
        visitDate: { $gte: startDate, $lte: endDate },
        barber: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$barber',
        totalRevenue: { $sum: '$totalPrice' },
        totalVisits: { $sum: 1 },
        averageValue: { $avg: '$totalPrice' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  return {
    summary: {
      reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalRevenue: visits.reduce((sum, visit) => sum + (visit.totalPrice || 0), 0),
      totalVisits: visits.length,
      averageVisitValue: visits.length > 0 ? visits.reduce((sum, visit) => sum + (visit.totalPrice || 0), 0) / visits.length : 0
    },
    revenueByDay,
    revenueByBarber,
    detailedTransactions: visits.map(visit => ({
      date: visit.visitDate.toISOString().split('T')[0],
      clientName: `${(visit as any).clientId?.firstName || 'N/A'} ${(visit as any).clientId?.lastName || ''}`,
      barber: visit.barber || 'Not specified',
      services: visit.services.map((s: any) => s.serviceName || s.name).join(', '),
      totalPrice: visit.totalPrice
    }))
  };
}

async function generateServicesReport(startDate: Date, endDate: Date, serviceFilter?: string | null) {
  const matchStage: any = {
    visitDate: { $gte: startDate, $lte: endDate }
  };

  const pipeline = [
    { $match: matchStage },
    { $unwind: '$services' },
    {
      $group: {
        _id: '$services.serviceId',
        serviceName: { $first: '$services.serviceName' },
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$services.price' },
        averagePrice: { $avg: '$services.price' },
        uniqueClients: { $addToSet: '$clientId' }
      }
    },
    {
      $addFields: {
        uniqueClients: { $size: '$uniqueClients' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ];

  if (serviceFilter) {
    pipeline.splice(1, 0, { $match: { 'services.serviceId': serviceFilter } });
  }

  const serviceData = await Visit.aggregate(pipeline);

  return {
    summary: {
      reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalServices: serviceData.length,
      totalBookings: serviceData.reduce((sum, service) => sum + service.totalBookings, 0),
      totalRevenue: serviceData.reduce((sum, service) => sum + service.totalRevenue, 0)
    },
    servicePerformance: serviceData
  };
}

async function generateClientsReport(startDate: Date, endDate: Date) {
  const clientData = await Visit.aggregate([
    {
      $match: {
        visitDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$clientId',
        totalVisits: { $sum: 1 },
        totalSpent: { $sum: '$totalPrice' },
        averageSpent: { $avg: '$totalPrice' },
        lastVisit: { $max: '$visitDate' },
        firstVisit: { $min: '$visitDate' }
      }
    },
    {
      $lookup: {
        from: 'clients',
        localField: '_id',
        foreignField: '_id',
        as: 'clientInfo'
      }
    },
    { $unwind: '$clientInfo' },
    { $sort: { totalSpent: -1 } }
  ]);

  return {
    summary: {
      reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalClients: clientData.length,
      totalRevenue: clientData.reduce((sum, client) => sum + client.totalSpent, 0),
      averageClientValue: clientData.length > 0 ? clientData.reduce((sum, client) => sum + client.totalSpent, 0) / clientData.length : 0
    },
    clientAnalytics: clientData.map(client => ({
      clientName: `${client.clientInfo.firstName} ${client.clientInfo.lastName}`,
      phoneNumber: client.clientInfo.phoneNumber,
      totalVisits: client.totalVisits,
      totalSpent: client.totalSpent,
      averageSpent: client.averageSpent,
      lastVisit: client.lastVisit.toISOString().split('T')[0],
      loyaltyStatus: client.clientInfo.loyaltyStatus || 'new'
    }))
  };
}

async function generateBarbersReport(startDate: Date, endDate: Date, barberFilter?: string | null) {
  const matchStage: any = {
    visitDate: { $gte: startDate, $lte: endDate },
    barber: { $exists: true, $ne: null }
  };

  if (barberFilter) {
    matchStage.barber = barberFilter;
  }

  const barberData = await Visit.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$barber',
        totalVisits: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        averageRevenue: { $avg: '$totalPrice' },
        uniqueClients: { $addToSet: '$clientId' }
      }
    },
    {
      $addFields: {
        uniqueClients: { $size: '$uniqueClients' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  return {
    summary: {
      reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalBarbers: barberData.length,
      totalRevenue: barberData.reduce((sum, barber) => sum + barber.totalRevenue, 0),
      totalVisits: barberData.reduce((sum, barber) => sum + barber.totalVisits, 0)
    },
    barberPerformance: barberData.map(barber => ({
      barberName: barber._id,
      totalVisits: barber.totalVisits,
      totalRevenue: barber.totalRevenue,
      averageRevenue: barber.averageRevenue,
      uniqueClients: barber.uniqueClients,
      efficiency: Math.min(100, Math.round((barber.totalVisits / 30) * 100)) // Mock efficiency calculation
    }))
  };
}

async function generateLoyaltyReport(startDate: Date, endDate: Date) {
  const loyaltyData = await Client.aggregate([
    {
      $group: {
        _id: '$loyaltyStatus',
        count: { $sum: 1 },
        totalRewards: { $sum: '$rewardsRedeemed' }
      }
    }
  ]);

  const totalRedemptions = await Client.aggregate([
    {
      $group: {
        _id: null,
        totalRedemptions: { $sum: '$rewardsRedeemed' }
      }
    }
  ]);

  return {
    summary: {
      reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalLoyaltyMembers: loyaltyData.reduce((sum, status) => sum + status.count, 0),
      totalRedemptions: totalRedemptions[0]?.totalRedemptions || 0
    },
    loyaltyBreakdown: loyaltyData
  };
}

async function getDailyBreakdown(startDate: Date, endDate: Date) {
  return await Visit.aggregate([
    {
      $match: {
        visitDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$visitDate' }
        },
        totalVisits: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        uniqueClients: { $addToSet: '$clientId' }
      }
    },
    {
      $addFields: {
        uniqueClients: { $size: '$uniqueClients' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
}

function generateCSVExport(reportData: any, reportType: string, startDate: Date, endDate: Date) {
  let csvContent = '';
  
  // Add header with report info
  csvContent += `Barbaros Barbershop - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report\n`;
  csvContent += `Period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`;
  csvContent += `Generated: ${new Date().toISOString()}\n\n`;

  // Add summary section
  if (reportData.summary) {
    csvContent += 'SUMMARY\n';
    Object.entries(reportData.summary).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`;
    });
    csvContent += '\n';
  }

  // Add detailed data based on report type
  switch (reportType) {
    case 'financial':
      if (reportData.detailedTransactions) {
        csvContent += 'DETAILED TRANSACTIONS\n';
        csvContent += 'Date,Client Name,Barber,Services,Total Price\n';
        reportData.detailedTransactions.forEach((transaction: any) => {
          csvContent += `${transaction.date},${transaction.clientName},${transaction.barber},"${transaction.services}",${transaction.totalPrice}\n`;
        });
      }
      break;
    
    case 'services':
      if (reportData.servicePerformance) {
        csvContent += 'SERVICE PERFORMANCE\n';
        csvContent += 'Service Name,Total Bookings,Total Revenue,Average Price,Unique Clients\n';
        reportData.servicePerformance.forEach((service: any) => {
          csvContent += `${service.serviceName},${service.totalBookings},${service.totalRevenue},${service.averagePrice.toFixed(2)},${service.uniqueClients}\n`;
        });
      }
      break;
    
    case 'clients':
      if (reportData.clientAnalytics) {
        csvContent += 'CLIENT ANALYTICS\n';
        csvContent += 'Client Name,Phone Number,Total Visits,Total Spent,Average Spent,Last Visit,Loyalty Status\n';
        reportData.clientAnalytics.forEach((client: any) => {
          csvContent += `${client.clientName},${client.phoneNumber},${client.totalVisits},${client.totalSpent.toFixed(2)},${client.averageSpent.toFixed(2)},${client.lastVisit},${client.loyaltyStatus}\n`;
        });
      }
      break;
    
    case 'barbers':
      if (reportData.barberPerformance) {
        csvContent += 'BARBER PERFORMANCE\n';
        csvContent += 'Barber Name,Total Visits,Total Revenue,Average Revenue,Unique Clients,Efficiency\n';
        reportData.barberPerformance.forEach((barber: any) => {
          csvContent += `${barber.barberName},${barber.totalVisits},${barber.totalRevenue.toFixed(2)},${barber.averageRevenue.toFixed(2)},${barber.uniqueClients},${barber.efficiency}%\n`;
        });
      }
      break;
  }

  const blob = new Blob([csvContent], { type: 'text/csv' });
  
  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="barbaros-${reportType}-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv"`
    }
  });
}

function generateExcelExport(reportData: any, reportType: string, startDate: Date, endDate: Date) {
  // For simplicity, we'll generate a CSV with .xlsx extension
  // In production, you would use a library like 'exceljs' to create proper Excel files
  const csvContent = generateCSVContent(reportData, reportType, startDate, endDate);
  const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="barbaros-${reportType}-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.xlsx"`
    }
  });
}

function generatePDFExport(reportData: any, reportType: string, startDate: Date, endDate: Date) {
  // For simplicity, we'll generate HTML content that can be printed as PDF
  // In production, you would use a library like 'jsPDF' or 'puppeteer' to create proper PDFs
  const htmlContent = generatePDFContent(reportData, reportType, startDate, endDate);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  
  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="barbaros-${reportType}-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.pdf"`
    }
  });
}

function generateCSVContent(reportData: any, reportType: string, startDate: Date, endDate: Date) {
  // This is a helper function for Excel export
  let csvContent = '';
  
  csvContent += `Barbaros Barbershop - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report\n`;
  csvContent += `Period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`;
  csvContent += `Generated: ${new Date().toISOString()}\n\n`;

  if (reportData.summary) {
    csvContent += 'SUMMARY\n';
    Object.entries(reportData.summary).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`;
    });
  }

  return csvContent;
}

function generatePDFContent(reportData: any, reportType: string, startDate: Date, endDate: Date) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Barbaros ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Barbaros Barbershop</h1>
        <h2>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h2>
        <p>Period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}</p>
        <p>Generated: ${new Date().toISOString().split('T')[0]}</p>
      </div>
      
      <div class="summary">
        <h3>Summary</h3>
        ${reportData.summary ? Object.entries(reportData.summary).map(([key, value]) => 
          `<p><strong>${key}:</strong> ${value}</p>`
        ).join('') : ''}
      </div>
      
      <p><em>This is a simplified PDF export. In production, this would be generated using a proper PDF library.</em></p>
    </body>
    </html>
  `;
} 