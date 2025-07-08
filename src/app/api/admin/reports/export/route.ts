import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Visit, Client, Service, Admin, Reward, BarberStats, Reservation } from '@/lib/db/models';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    const format = searchParams.get('format') || 'pdf';
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
      case 'excel':
        return generateExcelExport(reportData, reportType, startDate, endDate);
      case 'pdf':
        return generatePDFExport(reportData, reportType, startDate, endDate);
      default:
        return generatePDFExport(reportData, reportType, startDate, endDate);
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
  // Enhanced overview data with all metrics
  const totalClients = await Client.countDocuments();
  const newClients = await Client.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const totalVisits = await Visit.countDocuments({
    visitDate: { $gte: startDate, $lte: endDate }
  });

  const visits = await Visit.find({
    visitDate: { $gte: startDate, $lte: endDate }
  }).populate('clientId', 'firstName lastName').select('totalPrice visitDate services barber');

  const totalRevenue = visits.reduce((sum, visit) => sum + (visit.totalPrice || 0), 0);
  const averageVisitValue = totalVisits > 0 ? totalRevenue / totalVisits : 0;

  const activeClients = await Visit.distinct('clientId', {
    visitDate: { $gte: startDate, $lte: endDate }
  });

  // Top services
  const topServices = await Visit.aggregate([
    { $match: { visitDate: { $gte: startDate, $lte: endDate } } },
    { $unwind: '$services' },
    { $group: { 
        _id: '$services.name', 
        count: { $sum: 1 },
        revenue: { $sum: '$services.price' }
      } 
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Daily breakdown
  const dailyBreakdown = await Visit.aggregate([
    { $match: { visitDate: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitDate' } },
        visits: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
        clients: { $addToSet: '$clientId' }
      }
    },
    { $addFields: { uniqueClients: { $size: '$clients' } } },
    { $sort: { '_id': 1 } }
  ]);

  return {
    summary: {
      reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalClients,
      newClients,
      activeClients: activeClients.length,
      totalVisits,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageVisitValue: Math.round(averageVisitValue * 100) / 100
    },
    topServices,
    dailyBreakdown,
    visits: visits.map(visit => ({
      date: visit.visitDate.toISOString().split('T')[0],
      clientName: `${(visit as any).clientId?.firstName || 'N/A'} ${(visit as any).clientId?.lastName || ''}`,
      barber: visit.barber || 'Not specified',
      services: visit.services.map((s: any) => s.name).join(', '),
      totalPrice: visit.totalPrice
    }))
  };
}

async function generateFinancialReport(startDate: Date, endDate: Date) {
  const visits = await Visit.find({
    visitDate: { $gte: startDate, $lte: endDate }
  }).populate('clientId', 'firstName lastName').select('totalPrice visitDate services barber');

  // Revenue by day
  const revenueByDay = await Visit.aggregate([
    { $match: { visitDate: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitDate' } },
        totalRevenue: { $sum: '$totalPrice' },
        totalVisits: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // Revenue by barber
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

  // Revenue by service
  const revenueByService = await Visit.aggregate([
    { $match: { visitDate: { $gte: startDate, $lte: endDate } } },
    { $unwind: '$services' },
    {
      $group: {
        _id: '$services.name',
        totalRevenue: { $sum: '$services.price' },
        totalBookings: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  const totalRevenue = visits.reduce((sum, visit) => sum + (visit.totalPrice || 0), 0);

  return {
    summary: {
      reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalVisits: visits.length,
      averageVisitValue: visits.length > 0 ? Math.round((totalRevenue / visits.length) * 100) / 100 : 0
    },
    revenueByDay: revenueByDay.map(item => ({
      date: item._id,
      revenue: Math.round(item.totalRevenue * 100) / 100,
      visits: item.totalVisits
    })),
    revenueByBarber: revenueByBarber.map(item => ({
      barber: item._id,
      revenue: Math.round(item.totalRevenue * 100) / 100,
      visits: item.totalVisits,
      averageValue: Math.round(item.averageValue * 100) / 100
    })),
    revenueByService: revenueByService.map(item => ({
      service: item._id,
      revenue: Math.round(item.totalRevenue * 100) / 100,
      bookings: item.totalBookings
    }))
  };
}

async function generateServicesReport(startDate: Date, endDate: Date, serviceFilter?: string | null) {
  const pipeline: any[] = [
    { $match: { visitDate: { $gte: startDate, $lte: endDate } } },
    { $unwind: '$services' },
    {
      $group: {
        _id: '$services.serviceId',
        serviceName: { $first: '$services.name' },
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$services.price' },
        averagePrice: { $avg: '$services.price' },
        uniqueClients: { $addToSet: '$clientId' }
      }
    },
    { $addFields: { uniqueClients: { $size: '$uniqueClients' } } },
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
      totalBookings: serviceData.reduce((sum, item) => sum + item.totalBookings, 0),
      totalRevenue: Math.round(serviceData.reduce((sum, item) => sum + item.totalRevenue, 0) * 100) / 100
    },
    services: serviceData.map(item => ({
      name: item.serviceName,
      bookings: item.totalBookings,
      revenue: Math.round(item.totalRevenue * 100) / 100,
      averagePrice: Math.round(item.averagePrice * 100) / 100,
      uniqueClients: item.uniqueClients
    }))
  };
}

async function generateClientsReport(startDate: Date, endDate: Date) {
  const clients = await Client.find().select('firstName lastName phoneNumber totalLifetimeVisits totalSpent loyaltyStatus');
  
  const clientVisits = await Visit.aggregate([
    { $match: { visitDate: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: '$clientId',
        visits: { $sum: 1 },
        spent: { $sum: '$totalPrice' },
        lastVisit: { $max: '$visitDate' }
      }
    }
  ]);

  const clientsWithVisits = clients.map(client => {
    const visitData = clientVisits.find(v => v._id.toString() === client._id.toString());
    return {
      name: `${client.firstName} ${client.lastName}`,
      phone: client.phoneNumber,
      visitsInPeriod: visitData?.visits || 0,
      spentInPeriod: Math.round((visitData?.spent || 0) * 100) / 100,
      totalLifetimeVisits: client.totalLifetimeVisits,
      totalSpent: Math.round((client.totalSpent || 0) * 100) / 100,
      loyaltyStatus: client.loyaltyStatus,
      lastVisit: visitData?.lastVisit ? new Date(visitData.lastVisit).toISOString().split('T')[0] : 'N/A'
    };
  });

  return {
    summary: {
      reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalClients: clients.length,
      activeClients: clientVisits.length,
      totalRevenue: Math.round(clientVisits.reduce((sum, item) => sum + item.spent, 0) * 100) / 100
    },
    clients: clientsWithVisits.slice(0, 100) // Limit to first 100 for export
  };
}

async function generateBarbersReport(startDate: Date, endDate: Date, barberFilter?: string | null) {
  const matchStage: any = { visitDate: { $gte: startDate, $lte: endDate } };
  if (barberFilter) {
    matchStage.barberId = barberFilter;
  }

  const barberData = await Visit.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$barber',
        totalVisits: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        uniqueClients: { $addToSet: '$clientId' },
        averageValue: { $avg: '$totalPrice' }
      }
    },
    { $addFields: { uniqueClients: { $size: '$uniqueClients' } } },
    { $sort: { totalRevenue: -1 } }
  ]);

  return {
    summary: {
      reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalBarbers: barberData.length,
      totalVisits: barberData.reduce((sum, item) => sum + item.totalVisits, 0),
      totalRevenue: Math.round(barberData.reduce((sum, item) => sum + item.totalRevenue, 0) * 100) / 100
    },
    barbers: barberData.map(item => ({
      name: item._id,
      visits: item.totalVisits,
      revenue: Math.round(item.totalRevenue * 100) / 100,
      uniqueClients: item.uniqueClients,
      averageValue: Math.round(item.averageValue * 100) / 100
    }))
  };
}

async function generateLoyaltyReport(startDate: Date, endDate: Date) {
  const loyaltyStats = await Client.aggregate([
    { $group: { _id: '$loyaltyStatus', count: { $sum: 1 } } }
  ]);

  const rewardsRedeemed = await Visit.countDocuments({
    visitDate: { $gte: startDate, $lte: endDate },
    rewardRedeemed: true
  });

  const topLoyaltyClients = await Client.find()
    .sort({ totalLifetimeVisits: -1 })
    .limit(20)
    .select('firstName lastName totalLifetimeVisits totalSpent loyaltyStatus');

  return {
    summary: {
      reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalLoyaltyMembers: loyaltyStats.reduce((sum, item) => sum + item.count, 0),
      rewardsRedeemed
    },
    loyaltyBreakdown: loyaltyStats,
    topClients: topLoyaltyClients.map(client => ({
      name: `${client.firstName} ${client.lastName}`,
      visits: client.totalLifetimeVisits,
      spent: Math.round((client.totalSpent || 0) * 100) / 100,
      status: client.loyaltyStatus
    }))
  };
}

function generatePDFExport(reportData: any, reportType: string, startDate: Date, endDate: Date) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Barbaros Barbershop', 20, 20);
  
  doc.setFontSize(16);
  doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 20, 35);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`, 20, 45);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 55);

  let yPosition = 70;

  // Summary section
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Summary', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
    Object.entries(reportData.summary).forEach(([key, value]) => {
    if (key !== 'reportPeriod') {
      doc.text(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`, 20, yPosition);
      yPosition += 6;
    }
  });

  yPosition += 10;

  // Generate tables based on report type
  if (reportType === 'overview' && reportData.dailyBreakdown) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Visits', 'Revenue (MAD)', 'Unique Clients']],
      body: reportData.dailyBreakdown.map((item: any) => [
        item._id,
        item.visits.toString(),
        item.revenue.toFixed(2),
        item.uniqueClients.toString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });
  }

  if (reportType === 'financial' && reportData.revenueByBarber) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Barber', 'Revenue (MAD)', 'Visits', 'Avg Value (MAD)']],
      body: reportData.revenueByBarber.map((item: any) => [
        item.barber,
        item.revenue.toFixed(2),
        item.visits.toString(),
        item.averageValue.toFixed(2)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });
  }

  if (reportType === 'services' && reportData.services) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Service', 'Bookings', 'Revenue (MAD)', 'Avg Price (MAD)', 'Unique Clients']],
      body: reportData.services.map((item: any) => [
        item.name,
        item.bookings.toString(),
        item.revenue.toFixed(2),
        item.averagePrice.toFixed(2),
        item.uniqueClients.toString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });
  }

  if (reportType === 'clients' && reportData.clients) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Phone', 'Period Visits', 'Period Spent (MAD)', 'Total Visits', 'Loyalty Status']],
      body: reportData.clients.slice(0, 50).map((item: any) => [
        item.name,
        item.phone,
        item.visitsInPeriod.toString(),
        item.spentInPeriod.toFixed(2),
        item.totalLifetimeVisits.toString(),
        item.loyaltyStatus
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 7 }
    });
  }

  if (reportType === 'barbers' && reportData.barbers) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Barber', 'Visits', 'Revenue (MAD)', 'Unique Clients', 'Avg Value (MAD)']],
      body: reportData.barbers.map((item: any) => [
        item.name,
        item.visits.toString(),
        item.revenue.toFixed(2),
        item.uniqueClients.toString(),
        item.averageValue.toFixed(2)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });
  }

  const pdfBuffer = doc.output('arraybuffer');
  
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="barbaros-${reportType}-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.pdf"`
    }
  });
}

function generateExcelExport(reportData: any, reportType: string, startDate: Date, endDate: Date) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Barbaros Barbershop';
  workbook.created = new Date();

  // Summary worksheet
  const summarySheet = workbook.addWorksheet('Summary');
  
  // Header styling
  summarySheet.mergeCells('A1:D1');
  const headerCell = summarySheet.getCell('A1');
  headerCell.value = 'Barbaros Barbershop - ' + reportType.charAt(0).toUpperCase() + reportType.slice(1) + ' Report';
  headerCell.font = { size: 16, bold: true, color: { argb: 'FF2980B9' } };
  headerCell.alignment = { horizontal: 'center' };
  
  summarySheet.getCell('A3').value = 'Report Period:';
  summarySheet.getCell('B3').value = `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`;
  summarySheet.getCell('A4').value = 'Generated:';
  summarySheet.getCell('B4').value = new Date().toLocaleString();

  // Summary data
  let row = 6;
  summarySheet.getCell(`A${row}`).value = 'Summary Metrics';
  summarySheet.getCell(`A${row}`).font = { bold: true, size: 14 };
  row += 2;

    Object.entries(reportData.summary).forEach(([key, value]) => {
    if (key !== 'reportPeriod') {
      summarySheet.getCell(`A${row}`).value = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      summarySheet.getCell(`B${row}`).value = value as string | number | boolean | Date;
      row++;
    }
  });

  // Data worksheets based on report type
  if (reportType === 'overview' && reportData.dailyBreakdown) {
    const dailySheet = workbook.addWorksheet('Daily Breakdown');
    dailySheet.addRow(['Date', 'Visits', 'Revenue (MAD)', 'Unique Clients']);
    
    reportData.dailyBreakdown.forEach((item: any) => {
      dailySheet.addRow([item._id, item.visits, item.revenue, item.uniqueClients]);
    });
    
    // Style the header
    dailySheet.getRow(1).font = { bold: true };
    dailySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2980B9' } };
  }

  if (reportType === 'financial') {
    if (reportData.revenueByBarber) {
      const barberSheet = workbook.addWorksheet('Revenue by Barber');
      barberSheet.addRow(['Barber', 'Revenue (MAD)', 'Visits', 'Avg Value (MAD)']);
      
      reportData.revenueByBarber.forEach((item: any) => {
        barberSheet.addRow([item.barber, item.revenue, item.visits, item.averageValue]);
      });
      
      barberSheet.getRow(1).font = { bold: true };
      barberSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2980B9' } };
    }

    if (reportData.revenueByService) {
      const serviceSheet = workbook.addWorksheet('Revenue by Service');
      serviceSheet.addRow(['Service', 'Revenue (MAD)', 'Bookings']);
      
      reportData.revenueByService.forEach((item: any) => {
        serviceSheet.addRow([item.service, item.revenue, item.bookings]);
      });
      
      serviceSheet.getRow(1).font = { bold: true };
      serviceSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2980B9' } };
    }
  }

  if (reportType === 'services' && reportData.services) {
    const servicesSheet = workbook.addWorksheet('Services Data');
    servicesSheet.addRow(['Service Name', 'Bookings', 'Revenue (MAD)', 'Average Price (MAD)', 'Unique Clients']);
    
    reportData.services.forEach((item: any) => {
      servicesSheet.addRow([item.name, item.bookings, item.revenue, item.averagePrice, item.uniqueClients]);
    });
    
    servicesSheet.getRow(1).font = { bold: true };
    servicesSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2980B9' } };
  }

  if (reportType === 'clients' && reportData.clients) {
    const clientsSheet = workbook.addWorksheet('Clients Data');
    clientsSheet.addRow(['Name', 'Phone', 'Period Visits', 'Period Spent (MAD)', 'Total Lifetime Visits', 'Total Spent (MAD)', 'Loyalty Status', 'Last Visit']);
    
    reportData.clients.forEach((item: any) => {
      clientsSheet.addRow([
        item.name, 
        item.phone, 
        item.visitsInPeriod, 
        item.spentInPeriod, 
        item.totalLifetimeVisits, 
        item.totalSpent, 
        item.loyaltyStatus,
        item.lastVisit
      ]);
    });
    
    clientsSheet.getRow(1).font = { bold: true };
    clientsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2980B9' } };
  }

  if (reportType === 'barbers' && reportData.barbers) {
    const barbersSheet = workbook.addWorksheet('Barbers Performance');
    barbersSheet.addRow(['Barber Name', 'Visits', 'Revenue (MAD)', 'Unique Clients', 'Average Value (MAD)']);
    
    reportData.barbers.forEach((item: any) => {
      barbersSheet.addRow([item.name, item.visits, item.revenue, item.uniqueClients, item.averageValue]);
    });
    
    barbersSheet.getRow(1).font = { bold: true };
    barbersSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2980B9' } };
  }

  // Auto-fit columns
  workbook.worksheets.forEach(worksheet => {
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
  });

  return workbook.xlsx.writeBuffer().then(buffer => {
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="barbaros-${reportType}-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.xlsx"`
      }
    });
  });
} 