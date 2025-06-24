import connectToDatabase from '../mongodb';
import { Admin, BarberStats, Visit } from '../models';
import { IAdmin, IBarberStats, MonthlyStats, ServiceStats } from '../models';
import mongoose from 'mongoose';

/**
 * Get all barbers (admin users with barber role)
 */
export async function getAllBarbers(): Promise<IAdmin[]> {
  await connectToDatabase();
  
  return Admin.find({ 
    role: 'barber', 
    active: true 
  }).select('-passwordHash').sort({ name: 1 });
}

/**
 * Get a specific barber by ID
 */
export async function getBarberById(barberId: string): Promise<IAdmin | null> {
  await connectToDatabase();
  
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    return null;
  }
  
  return Admin.findOne({ 
    _id: barberId, 
    role: 'barber', 
    active: true 
  }).select('-passwordHash').lean() as Promise<IAdmin | null>;
}

/**
 * Create a new barber
 */
export async function createBarber(barberData: Partial<IAdmin>): Promise<IAdmin> {
  await connectToDatabase();
  
  const barber = new Admin({
    ...barberData,
    role: 'barber',
    isBarber: true,
    joinDate: new Date(),
    active: true,
  });
  
  const savedBarber = await barber.save();
  
  // Create initial barber stats
  await createBarberStats(savedBarber._id);
  
  return savedBarber;
}

/**
 * Update a barber's profile
 */
export async function updateBarber(barberId: string, updateData: Partial<IAdmin>): Promise<IAdmin | null> {
  await connectToDatabase();
  
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    return null;
  }
  
  // Don't allow role changes through this function
  const { role, isBarber, ...safeUpdateData } = updateData;
  
  return Admin.findOneAndUpdate(
    { _id: barberId, role: 'barber' },
    safeUpdateData,
    { new: true, runValidators: true }
  ).select('-passwordHash').lean() as Promise<IAdmin | null>;
}

/**
 * Get or create barber statistics
 */
export async function getBarberStats(barberId: string): Promise<IBarberStats | null> {
  await connectToDatabase();
  
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    return null;
  }
  
  let stats = await BarberStats.findOne({ barberId }).populate('barberId', 'name joinDate');
  
  if (!stats) {
    stats = await createBarberStats(barberId);
  }
  
  return stats;
}

/**
 * Create initial barber statistics
 */
export async function createBarberStats(barberId: string): Promise<IBarberStats> {
  await connectToDatabase();
  
  const barber = await Admin.findById(barberId);
  if (!barber) {
    throw new Error('Barber not found');
  }
  
  const workDays = Math.ceil((Date.now() - barber.joinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const stats = new BarberStats({
    barberId,
    workDaysSinceJoining: workDays,
    lastUpdated: new Date(),
  });
  
  return stats.save();
}

/**
 * Update barber statistics after a visit
 */
export async function updateBarberStatsAfterVisit(
  barberId: string, 
  visitData: {
    clientId: string;
    totalPrice: number;
    services: Array<{ serviceId: string; name: string; price: number; duration: number }>;
    visitDate: Date;
  }
): Promise<void> {
  await connectToDatabase();
  
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    return;
  }
  
  const stats = await BarberStats.findOne({ barberId });
  if (!stats) {
    return;
  }
  
  const visitMonth = visitData.visitDate.toISOString().slice(0, 7); // "YYYY-MM"
  const visitHour = visitData.visitDate.getHours();
  
  // Update basic stats
  stats.totalVisits += 1;
  stats.totalRevenue += visitData.totalPrice;
  
  // Update unique clients
  const clientObjectId = new mongoose.Types.ObjectId(visitData.clientId);
  if (!stats.uniqueClientsServed.includes(clientObjectId)) {
    stats.uniqueClientsServed.push(clientObjectId);
  }
  
  // Update monthly stats
  let monthlyStats = stats.monthlyStats.find((m: MonthlyStats) => m.month === visitMonth);
  if (!monthlyStats) {
    monthlyStats = {
      month: visitMonth,
      visitsCount: 0,
      revenue: 0,
      uniqueClients: 0,
    };
    stats.monthlyStats.push(monthlyStats);
  }
  
  monthlyStats.visitsCount += 1;
  monthlyStats.revenue += visitData.totalPrice;
  
  // Count unique clients for this month
  const monthVisits = await Visit.find({
    barberId,
    visitDate: {
      $gte: new Date(visitMonth + '-01'),
      $lt: new Date(new Date(visitMonth + '-01').getFullYear(), new Date(visitMonth + '-01').getMonth() + 1, 1)
    }
  }).distinct('clientId');
  monthlyStats.uniqueClients = monthVisits.length;
  
  // Update service stats
  for (const service of visitData.services) {
    let serviceStats = stats.serviceStats.find((s: ServiceStats) => s.serviceId.toString() === service.serviceId);
    if (!serviceStats) {
      serviceStats = {
        serviceId: new mongoose.Types.ObjectId(service.serviceId),
        serviceName: service.name,
        count: 0,
        revenue: 0,
      };
      stats.serviceStats.push(serviceStats);
    }
    
    serviceStats.count += 1;
    serviceStats.revenue += service.price;
  }
  
  // Update busy hours
  if (!stats.busyHours.includes(visitHour)) {
    stats.busyHours.push(visitHour);
  }
  
  // Calculate work days and average visits per day
  const barber = await Admin.findById(barberId);
  if (barber) {
    stats.workDaysSinceJoining = Math.ceil((Date.now() - barber.joinDate.getTime()) / (1000 * 60 * 60 * 24));
    stats.averageVisitsPerDay = stats.workDaysSinceJoining > 0 ? stats.totalVisits / stats.workDaysSinceJoining : 0;
  }
  
  // Update top services (top 5)
  const sortedServices = stats.serviceStats
    .sort((a: ServiceStats, b: ServiceStats) => b.count - a.count)
    .slice(0, 5);
  stats.topServices = sortedServices.map((s: ServiceStats) => s.serviceName);
  
  // Calculate client retention rate
  if (stats.uniqueClientsServed.length > 0) {
    const repeatClients = await Visit.aggregate([
      { $match: { barberId: new mongoose.Types.ObjectId(barberId) } },
      { $group: { _id: '$clientId', visitCount: { $sum: 1 } } },
      { $match: { visitCount: { $gt: 1 } } },
      { $count: 'repeatClients' }
    ]);
    
    const repeatClientCount = repeatClients[0]?.repeatClients || 0;
    stats.clientRetentionRate = (repeatClientCount / stats.uniqueClientsServed.length) * 100;
  }
  
  // Calculate average service time
  const totalDuration = visitData.services.reduce((sum, service) => sum + service.duration, 0);
  if (stats.totalVisits > 0) {
    // This is a simplified calculation - in a real system you'd track this more accurately
    stats.averageServiceTime = ((stats.averageServiceTime * (stats.totalVisits - 1)) + totalDuration) / stats.totalVisits;
  } else {
    stats.averageServiceTime = totalDuration;
  }
  
  stats.lastUpdated = new Date();
  await stats.save();
}

/**
 * Get barber visit history
 */
export async function getBarberVisitHistory(
  barberId: string, 
  page: number = 1, 
  limit: number = 20
): Promise<{
  visits: any[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  await connectToDatabase();
  
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    return { visits: [], total: 0, totalPages: 0, currentPage: page };
  }
  
  const skip = (page - 1) * limit;
  
  const [visits, total] = await Promise.all([
    Visit.find({ barberId })
      .populate('clientId', 'firstName lastName phoneNumber')
      .populate('services.serviceId', 'name')
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit),
    Visit.countDocuments({ barberId })
  ]);
  
  return {
    visits,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

/**
 * Get barber leaderboard data
 */
export async function getBarberLeaderboard(
  sortBy: string = 'overall', 
  timePeriod: string = 'all-time'
): Promise<Array<any>> {
  await connectToDatabase();
  
  let sortCriteria: any = { totalVisits: -1 }; // Default sort
  
  // Determine sort criteria based on sortBy parameter
  switch (sortBy) {
    case 'visits':
      sortCriteria = { totalVisits: -1 };
      break;
    case 'revenue':
      sortCriteria = { totalRevenue: -1 };
      break;
    case 'clients':
      sortCriteria = { uniqueClientsServed: -1 };
      break;
    case 'efficiency':
      sortCriteria = { averageVisitsPerDay: -1 };
      break;
    default: // overall
      sortCriteria = { totalVisits: -1, totalRevenue: -1 };
  }
  
  const barbersWithStats = await BarberStats.find()
    .populate('barberId', 'name profilePicture joinDate')
    .sort(sortCriteria)
    .limit(20);
  
  // Calculate efficiency and create result - Filter out null barbers
  const processedStats = barbersWithStats
    .filter((stats: any) => stats.barberId) // Filter out entries with null barbers
    .map((stats: any, index: number) => {
      const barber = stats.barberId;
      
      // Additional safety check
      if (!barber || !barber._id) {
        console.warn('Skipping barber stats with invalid barber data:', stats._id);
        return null;
      }
      
      // Calculate efficiency score
      const workDays = stats.workDaysSinceJoining || 1;
      const visitsPerDay = stats.totalVisits / workDays;
      const revenuePerVisit = stats.totalVisits > 0 ? stats.totalRevenue / stats.totalVisits : 0;
      const efficiency = Math.round((visitsPerDay * revenuePerVisit) * 10) / 10;
      
      // Handle time period filtering for monthly stats
      let visits = stats.totalVisits;
      let revenue = stats.totalRevenue;
      let uniqueClients = stats.uniqueClientsServed ? stats.uniqueClientsServed.length : 0;
      
      if (timePeriod === 'this-month') {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthStats = stats.monthlyStats ? stats.monthlyStats.find((m: any) => m.month === currentMonth) : null;
        if (monthStats) {
          visits = monthStats.visitsCount;
          revenue = monthStats.revenue;
          uniqueClients = monthStats.uniqueClients;
        }
      }
      
      return {
        _id: barber._id,
        name: barber.name || 'Unknown Barber',
        profilePicture: barber.profilePicture,
        joinDate: barber.joinDate,
        workDays: stats.workDaysSinceJoining,
        stats: {
          totalVisits: visits,
          totalRevenue: revenue,
          uniqueClientsServed: uniqueClients,
          thisMonth: {
            visits: stats.monthlyStats ? stats.monthlyStats.find((m: any) => m.month === new Date().toISOString().slice(0, 7))?.visitsCount || 0 : 0,
            revenue: stats.monthlyStats ? stats.monthlyStats.find((m: any) => m.month === new Date().toISOString().slice(0, 7))?.revenue || 0 : 0
          }
        },
        rank: index + 1,
        efficiency,
        achievements: Math.min(Math.floor(stats.totalVisits / 10), 10), // Mock achievements count
        badges: stats.totalVisits > 100 ? ['👑', '🏆', '💎'] : 
                stats.totalVisits > 50 ? ['🥈', '⭐', '🔥'] : 
                stats.totalVisits > 20 ? ['🥉', '🎯', '💪'] : ['🚀', '⚡']
      };
    })
    .filter(Boolean); // Remove null entries
  
  // Re-sort if efficiency is the criteria
  if (sortBy === 'efficiency') {
    processedStats.sort((a: any, b: any) => b.efficiency - a.efficiency);
    processedStats.forEach((item: any, index: number) => {
      item.rank = index + 1;
    });
  }
  
  return processedStats;
} 