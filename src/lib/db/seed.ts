import { Admin, Client, Service, ServiceCategory, Reward, Visit, BarberStats, Achievement, BarberAchievement } from './models';
import connectToDatabase from './mongodb';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

/**
 * Seed the database with sample data
 */
export async function seedDatabase() {
  let connection: typeof mongoose;
  try {
    console.log('Connecting to database...');
    connection = await connectToDatabase();
    console.log('Database connection established');
    
    // Log the current database name to verify we're using the right one
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    console.log(`Connected to database: ${dbName}`);

    // Force clear any existing data to ensure clean seeding
    console.log('Clearing existing data...');
    await clearDatabase();
    console.log('Database cleared successfully');

    // Create admin users
    console.log('Creating admin users...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const standardPasswordHash = await bcrypt.hash('password123', 10);
    
    const adminUsers = [
      {
        username: 'admin',
        passwordHash: adminPasswordHash,
        name: 'Admin User',
        role: 'owner',
        email: 'admin@barbaros.com',
        active: true,
      },
      {
        username: 'barber1',
        passwordHash: standardPasswordHash,
        name: 'Mike Johnson',
        role: 'barber',
        email: 'barber1@barbaros.com',
        active: true,
        joinDate: new Date('2024-01-15'),
        isBarber: true,
        phoneNumber: '+1 (555) 123-4567',
      },
      {
        username: 'barber2',
        passwordHash: standardPasswordHash,
        name: 'Alex Rodriguez',
        role: 'barber',
        email: 'barber2@barbaros.com',
        active: true,
        joinDate: new Date('2024-02-01'),
        isBarber: true,
        phoneNumber: '+1 (555) 234-5678',
      },
      {
        username: 'receptionist',
        passwordHash: standardPasswordHash,
        name: 'Sarah Williams',
        role: 'receptionist',
        email: 'reception@barbaros.com',
        active: true,
        joinDate: new Date('2024-01-01'),
        isBarber: false,
      },
    ];

    const createdAdmins = await Admin.insertMany(adminUsers);
    console.log(`Created ${createdAdmins.length} admin users`);
    console.log(`Created admin user with email: admin@barbaros.com and password: admin123`);

    // Create service categories
    console.log('Creating service categories...');
    const categories = [
      {
        name: 'Haircuts',
        description: 'All haircut services',
        displayOrder: 1,
        isActive: true,
      },
      {
        name: 'Shaves',
        description: 'All shaving services',
        displayOrder: 2,
        isActive: true,
      },
      {
        name: 'Styling',
        description: 'Hair styling services',
        displayOrder: 3,
        isActive: true,
      },
      {
        name: 'Coloring',
        description: 'Hair coloring services',
        displayOrder: 4,
        isActive: true,
      },
    ];

    const createdCategories = await ServiceCategory.insertMany(categories);
    console.log(`Created ${createdCategories.length} service categories`);
    
    // Create services
    console.log('Creating services...');
    const services = [
      {
        name: 'Regular Haircut',
        description: 'Standard haircut with scissors',
        price: 25,
        durationMinutes: 30,
        imageUrl: '/images/services/regular-haircut.jpg',
        categoryId: createdCategories[0]._id,
        isActive: true,
        popularityScore: 10,
      },
      {
        name: 'Buzz Cut',
        description: 'Short haircut with clippers',
        price: 20,
        durationMinutes: 20,
        imageUrl: '/images/services/buzz-cut.jpg',
        categoryId: createdCategories[0]._id,
        isActive: true,
        popularityScore: 8,
      },
      {
        name: 'Beard Trim',
        description: 'Trim and shape beard',
        price: 15,
        durationMinutes: 15,
        imageUrl: '/images/services/beard-trim.jpg',
        categoryId: createdCategories[1]._id,
        isActive: true,
        popularityScore: 9,
      },
      {
        name: 'Hot Towel Shave',
        description: 'Traditional hot towel shave',
        price: 30,
        durationMinutes: 30,
        imageUrl: '/images/services/hot-towel-shave.jpg',
        categoryId: createdCategories[1]._id,
        isActive: true,
        popularityScore: 7,
      },
      {
        name: 'Hair Styling',
        description: 'Hair styling with products',
        price: 20,
        durationMinutes: 20,
        imageUrl: '/images/services/hair-styling.jpg',
        categoryId: createdCategories[2]._id,
        isActive: true,
        popularityScore: 6,
      },
      {
        name: 'Hair Coloring',
        description: 'Full hair coloring service',
        price: 50,
        durationMinutes: 60,
        imageUrl: '/images/services/hair-coloring.jpg',
        categoryId: createdCategories[3]._id,
        isActive: true,
        popularityScore: 5,
      },
    ];

    const createdServices = await Service.insertMany(services);
    console.log(`Created ${createdServices.length} services`);

    // Create rewards
    console.log('Creating rewards...');
    const rewards = [
      {
        name: 'Free Haircut',
        description: 'Free regular haircut after 10 visits',
        visitsRequired: 10,
        isActive: true,
        applicableServices: [createdServices[0]._id],
      },
      {
        name: 'Free Beard Trim',
        description: 'Free beard trim after 5 visits',
        visitsRequired: 5,
        isActive: true,
        applicableServices: [createdServices[2]._id],
      },
      {
        name: '50% Off Any Service',
        description: '50% off any service after 15 visits',
        visitsRequired: 15,
        isActive: true,
        applicableServices: createdServices.map(service => service._id),
      },
    ];

    const createdRewards = await Reward.insertMany(rewards);
    console.log(`Created ${createdRewards.length} rewards`);

    // Create advanced employee loyalty achievements
    console.log('Creating advanced achievement system...');
    const achievements = [
      // TENURE ACHIEVEMENTS - Building Employee Loyalty
      {
        title: 'Welcome Aboard',
        description: 'Complete your first week with the team',
        category: 'tenure',
        subcategory: 'onboarding',
        requirement: 7,
        requirementType: 'days',
        requirementDetails: { timeframe: 'all-time' },
        badge: '🎯',
        color: 'bg-blue-500',
        icon: 'FaCalendarCheck',
        tier: 'bronze',
        points: 50,
        reward: {
          type: 'recognition',
          value: 'Team Welcome Certificate',
          description: 'Official welcome to the Barbaros family'
        },
        isRepeatable: false,
        isActive: true
      },
      {
        title: 'One Month Strong',
        description: 'Celebrate your first month of dedication',
        category: 'tenure',
        subcategory: 'milestone',
        requirement: 30,
        requirementType: 'days',
        requirementDetails: { timeframe: 'all-time' },
        badge: '📅',
        color: 'bg-green-500',
        icon: 'FaCalendarAlt',
        tier: 'bronze',
        points: 100,
        reward: {
          type: 'monetary',
          value: '$25',
          description: 'First month completion bonus'
        },
        isRepeatable: false,
        isActive: true
      },
      {
        title: 'Quarterly Champion',
        description: 'Complete your first 3 months of excellent service',
        category: 'tenure',
        subcategory: 'milestone',
        requirement: 90,
        requirementType: 'days',
        requirementDetails: { timeframe: 'all-time' },
        badge: '🏅',
        color: 'bg-yellow-500',
        icon: 'FaMedal',
        tier: 'silver',
        points: 250,
        reward: {
          type: 'time_off',
          value: '1 day',
          description: 'Extra paid day off'
        },
        isRepeatable: false,
        isActive: true
      },
      {
        title: 'Half-Year Hero',
        description: 'Six months of commitment and excellence',
        category: 'tenure',
        subcategory: 'milestone',
        requirement: 180,
        requirementType: 'days',
        requirementDetails: { timeframe: 'all-time' },
        badge: '⭐',
        color: 'bg-orange-500',
        icon: 'FaStar',
        tier: 'gold',
        points: 500,
        reward: {
          type: 'monetary',
          value: '$100',
          description: 'Six-month loyalty bonus'
        },
        isRepeatable: false,
        isActive: true
      },
      {
        title: 'Annual Veteran',
        description: 'One full year of dedication to the craft',
        category: 'tenure',
        subcategory: 'milestone',
        requirement: 365,
        requirementType: 'days',
        requirementDetails: { timeframe: 'all-time' },
        badge: '👑',
        color: 'bg-purple-600',
        icon: 'FaCrown',
        tier: 'platinum',
        points: 1000,
        reward: {
          type: 'monetary',
          value: '$300',
          description: 'Annual loyalty reward + extra benefits'
        },
        isRepeatable: false,
        isActive: true
      },

      // PERFORMANCE ACHIEVEMENTS - Daily Excellence
      {
        title: 'First Cut',
        description: 'Complete your very first client service',
        category: 'visits',
        subcategory: 'milestone',
        requirement: 1,
        requirementType: 'count',
        requirementDetails: { timeframe: 'all-time' },
        badge: '✂️',
        color: 'bg-blue-400',
        icon: 'FaCut',
        tier: 'bronze',
        points: 25,
        reward: {
          type: 'recognition',
          value: 'First Cut Certificate',
          description: 'Commemorate your first professional service'
        },
        isRepeatable: false,
        isActive: true
      },
      {
        title: 'Daily Achiever',
        description: 'Complete 3 or more services in a single day',
        category: 'visits',
        subcategory: 'daily',
        requirement: 3,
        requirementType: 'count',
        requirementDetails: { timeframe: 'daily', minimumValue: 3 },
        badge: '🌟',
        color: 'bg-yellow-400',
        icon: 'FaCalendarDay',
        tier: 'bronze',
        points: 15,
        reward: {
          type: 'recognition',
          value: 'Daily Star',
          description: 'Recognition for outstanding daily performance'
        },
        isRepeatable: true,
        maxCompletions: 365,
        isActive: true
      },
      {
        title: 'Weekly Warrior',
        description: 'Complete 25+ services in a single week',
        category: 'visits',
        subcategory: 'weekly',
        requirement: 25,
        requirementType: 'count',
        requirementDetails: { timeframe: 'weekly' },
        badge: '⚔️',
        color: 'bg-red-500',
        icon: 'FaCalendarWeek',
        tier: 'silver',
        points: 75,
        reward: {
          type: 'monetary',
          value: '$20',
          description: 'Weekly performance bonus'
        },
        isRepeatable: true,
        maxCompletions: 52,
        isActive: true
      },
      {
        title: 'Monthly Master',
        description: 'Complete 100+ services in a single month',
        category: 'visits',
        subcategory: 'monthly',
        requirement: 100,
        requirementType: 'count',
        requirementDetails: { timeframe: 'monthly' },
        badge: '👨‍💼',
        color: 'bg-indigo-600',
        icon: 'FaCalendarCheck',
        tier: 'gold',
        points: 200,
        reward: {
          type: 'monetary',
          value: '$75',
          description: 'Monthly excellence bonus'
        },
        isRepeatable: true,
        maxCompletions: 12,
        isActive: true
      },

      // CONSISTENCY ACHIEVEMENTS - Building Habits
      {
        title: 'Consistency Starter',
        description: 'Work 5 consecutive days with at least 2 services each',
        category: 'consistency',
        subcategory: 'daily_visits',
        requirement: 5,
        requirementType: 'streak',
        requirementDetails: { 
          consecutiveRequired: true,
          minimumValue: 2,
          timeframe: 'daily'
        },
        badge: '🔥',
        color: 'bg-orange-400',
        icon: 'FaFire',
        tier: 'bronze',
        points: 100,
        reward: {
          type: 'recognition',
          value: 'Consistency Award',
          description: 'Recognition for building good work habits'
        },
        isRepeatable: true,
        maxCompletions: 10,
        isActive: true
      },
      {
        title: 'Reliability Expert',
        description: 'Maintain 10+ services per week for 8 consecutive weeks',
        category: 'consistency',
        subcategory: 'weekly_consistency',
        requirement: 8,
        requirementType: 'streak',
        requirementDetails: { 
          consecutiveRequired: true,
          minimumValue: 10,
          timeframe: 'weekly'
        },
        badge: '🎯',
        color: 'bg-green-600',
        icon: 'FaBullseye',
        tier: 'gold',
        points: 300,
        reward: {
          type: 'time_off',
          value: '0.5 day',
          description: 'Half day off for exceptional reliability'
        },
        isRepeatable: true,
        maxCompletions: 6,
        isActive: true
      },

      // CLIENT RELATIONSHIP ACHIEVEMENTS
      {
        title: 'People Person',
        description: 'Serve 5 different clients in your career',
        category: 'clients',
        subcategory: 'diversity',
        requirement: 5,
        requirementType: 'count',
        requirementDetails: { timeframe: 'all-time' },
        badge: '👥',
        color: 'bg-blue-500',
        icon: 'FaUsers',
        tier: 'bronze',
        points: 50,
        reward: {
          type: 'recognition',
          value: 'People Skills Badge',
          description: 'Recognition for excellent client relations'
        },
        isRepeatable: false,
        isActive: true
      },
      {
        title: 'Community Favorite',
        description: 'Build a clientele of 25 unique customers',
        category: 'clients',
        subcategory: 'growth',
        requirement: 25,
        requirementType: 'count',
        requirementDetails: { timeframe: 'all-time' },
        badge: '💖',
        color: 'bg-pink-500',
        icon: 'FaHeart',
        tier: 'silver',
        points: 150,
        reward: {
          type: 'monetary',
          value: '$40',
          description: 'Client relationship building bonus'
        },
        isRepeatable: false,
        isActive: true
      },
      {
        title: 'Network Builder',
        description: 'Serve 50 unique clients - you\'re a true professional',
        category: 'clients',
        subcategory: 'mastery',
        requirement: 50,
        requirementType: 'count',
        requirementDetails: { timeframe: 'all-time' },
        badge: '🌐',
        color: 'bg-purple-500',
        icon: 'FaNetworkWired',
        tier: 'gold',
        points: 400,
        reward: {
          type: 'privileges',
          value: 'Schedule Flexibility',
          description: 'Enhanced scheduling privileges for top performers'
        },
        isRepeatable: false,
        isActive: true
      },

      // QUALITY & TEAMWORK ACHIEVEMENTS
      {
        title: 'Quality Craftsman',
        description: 'Maintain 80%+ client retention rate',
        category: 'quality',
        subcategory: 'client_retention',
        requirement: 80,
        requirementType: 'percentage',
        requirementDetails: { timeframe: 'all-time' },
        badge: '🏆',
        color: 'bg-yellow-600',
        icon: 'FaTrophy',
        tier: 'gold',
        points: 300,
        reward: {
          type: 'monetary',
          value: '$60',
          description: 'Quality excellence bonus'
        },
        isRepeatable: false,
        isActive: true
      },
      {
        title: 'Service Specialist',
        description: 'Master 4 different types of services',
        category: 'quality',
        subcategory: 'service_variety',
        requirement: 4,
        requirementType: 'count',
        requirementDetails: { timeframe: 'all-time' },
        badge: '🎨',
        color: 'bg-indigo-500',
        icon: 'FaPalette',
        tier: 'silver',
        points: 200,
        reward: {
          type: 'training',
          value: 'Advanced Techniques Course',
          description: 'Free advanced training in specialized techniques'
        },
        isRepeatable: false,
        isActive: true
      },

      // LEARNING & DEVELOPMENT
      {
        title: 'Growth Mindset',
        description: 'Complete your first month of continuous improvement',
        category: 'learning',
        subcategory: 'development',
        requirement: 30,
        requirementType: 'days',
        requirementDetails: { timeframe: 'all-time' },
        badge: '📚',
        color: 'bg-green-500',
        icon: 'FaGraduationCap',
        tier: 'bronze',
        points: 75,
        reward: {
          type: 'training',
          value: 'Skill Workshop Access',
          description: 'Access to professional development workshops'
        },
        isRepeatable: false,
        isActive: true
      },

      // MILESTONE ACHIEVEMENTS
      {
        title: 'Century Club',
        description: 'Complete 100 total services - welcome to the pros!',
        category: 'milestone',
        subcategory: 'volume',
        requirement: 100,
        requirementType: 'count',
        requirementDetails: { timeframe: 'all-time' },
        badge: '💯',
        color: 'bg-red-600',
        icon: 'FaAward',
        tier: 'platinum',
        points: 500,
        reward: {
          type: 'monetary',
          value: '$150',
          description: 'Century milestone achievement reward'
        },
        isRepeatable: false,
        isActive: true
      },
      {
        title: 'Elite Professional',
        description: 'Reach 500 total services - you\'re among the elite',
        category: 'milestone',
        subcategory: 'mastery',
        requirement: 500,
        requirementType: 'count',
        requirementDetails: { timeframe: 'all-time' },
        badge: '💎',
        color: 'bg-blue-800',
        icon: 'FaGem',
        tier: 'diamond',
        points: 1500,
        reward: {
          type: 'monetary',
          value: '$500',
          description: 'Elite status achievement + special recognition'
        },
        isRepeatable: false,
        isActive: true
      }
    ];

    // Clear existing achievements first
    await Achievement.deleteMany({});
    await BarberAchievement.deleteMany({});
    
    const createdAchievements = await Achievement.insertMany(achievements);
    console.log(`Created ${createdAchievements.length} achievements`);

    // Create clients
    console.log('Creating clients...');
    const clientPasswordHash = await bcrypt.hash('clientpass', 10);
    
    const clients = [];
    const clientNames = [
      { first: 'David', last: 'Johnson' },
      { first: 'Michael', last: 'Smith' },
      { first: 'Robert', last: 'Williams' },
      { first: 'James', last: 'Brown' },
      { first: 'William', last: 'Jones' },
      { first: 'Richard', last: 'Garcia' },
      { first: 'Joseph', last: 'Miller' },
      { first: 'Thomas', last: 'Davis' },
      { first: 'Charles', last: 'Rodriguez' },
      { first: 'Christopher', last: 'Martinez' },
    ];
    
    for (let i = 0; i < clientNames.length; i++) {
      const { first, last } = clientNames[i];
      clients.push({
        clientId: `C${nanoid(8)}`,
        passwordHash: clientPasswordHash,
        firstName: first,
        lastName: last,
        phoneNumber: `+1-555-${(100 + i).toString().padStart(3, '0')}-${(1000 + i).toString()}`,
        qrCodeUrl: `/api/qrcode/client-${i}`,
        dateCreated: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
        visitCount: Math.floor(Math.random() * 20),
        rewardsEarned: Math.floor(Math.random() * 5),
        rewardsRedeemed: Math.floor(Math.random() * 3),
        accountActive: true,
        preferredServices: [
          {
            serviceId: createdServices[Math.floor(Math.random() * createdServices.length)]._id,
            count: Math.floor(Math.random() * 10) + 1,
          },
        ],
      });
    }

    const createdClients = await Client.insertMany(clients);
    console.log(`Created ${createdClients.length} clients`);

    // Create visits
    console.log('Creating visits...');
    const visits = [];
    const barbers = ['Mike Johnson', 'Admin User', 'Sarah Williams'];
    
    for (let i = 0; i < createdClients.length; i++) {
      const client = createdClients[i];
      const visitCount = Math.floor(Math.random() * 5) + 1; // Reduced to ensure we don't create too many
      
      for (let j = 0; j < visitCount; j++) {
        const visitDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
        const serviceCount = Math.floor(Math.random() * 2) + 1;
        const services = [];
        let totalPrice = 0;
        
        // Add random services to this visit
        const availableServices = [...createdServices];
        for (let k = 0; k < serviceCount; k++) {
          if (availableServices.length === 0) break;
          
          const serviceIndex = Math.floor(Math.random() * availableServices.length);
          const service = availableServices.splice(serviceIndex, 1)[0];
          
          services.push({
            serviceId: service._id,
            name: service.name,
            price: service.price,
            duration: service.durationMinutes,
          });
          
          totalPrice += service.price;
        }
        
        visits.push({
          clientId: client._id,
          visitDate,
          services,
          totalPrice,
          barber: barbers[Math.floor(Math.random() * barbers.length)],
          notes: Math.random() > 0.7 ? 'Client was happy with service' : '',
          rewardRedeemed: Math.random() > 0.9,
          visitNumber: j + 1,
        });
      }
    }

    const createdVisits = await Visit.insertMany(visits);
    console.log(`Created ${createdVisits.length} visits`);

    // Create barber statistics for each barber
    console.log('Creating barber statistics...');
    const barbersOnly = createdAdmins.filter(admin => admin.role === 'barber');
    
    for (const barber of barbersOnly) {
      const workDays = Math.ceil((Date.now() - barber.joinDate.getTime()) / (1000 * 60 * 60 * 24));
      
      await BarberStats.create({
        barberId: barber._id,
        workDaysSinceJoining: workDays,
        lastUpdated: new Date(),
      });
    }
    
    console.log(`Created statistics for ${barbersOnly.length} barbers`);

    // Verify that data was created
    const adminCount = await Admin.countDocuments();
    const categoryCount = await ServiceCategory.countDocuments();
    const serviceCount = await Service.countDocuments();
    const rewardCount = await Reward.countDocuments();
    const achievementCount = await Achievement.countDocuments();
    const clientCount = await Client.countDocuments();
    const visitCount = await Visit.countDocuments();
    const barberStatsCount = await BarberStats.countDocuments();

    console.log('Database seeding verification:');
    console.log(`- Admin count: ${adminCount}`);
    console.log(`- Category count: ${categoryCount}`);
    console.log(`- Service count: ${serviceCount}`);
    console.log(`- Reward count: ${rewardCount}`);
    console.log(`- Achievement count: ${achievementCount}`);
    console.log(`- Client count: ${clientCount}`);
    console.log(`- Visit count: ${visitCount}`);
    console.log(`- Barber stats count: ${barberStatsCount}`);

    console.log('Database seeded successfully!');
    return { 
      success: true, 
      message: 'Database seeded successfully',
      counts: {
        admins: adminCount,
        categories: categoryCount,
        services: serviceCount,
        rewards: rewardCount,
        achievements: achievementCount,
        clients: clientCount,
        visits: visitCount,
        barberStats: barberStatsCount
      }
    };
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return { 
      success: false, 
      message: `Error seeding database: ${error.message}`,
      error: error.toString(),
      stack: error.stack
    };
  }
}

/**
 * Clear all data from the database (for development only)
 */
export async function clearDatabase() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    
    // Log the current database name to verify we're using the right one
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    console.log(`Connected to database: ${dbName}`);

    console.log('Clearing database...');
    await Admin.deleteMany({});
    await Client.deleteMany({});
    await Service.deleteMany({});
    await ServiceCategory.deleteMany({});
    await Reward.deleteMany({});
    await Achievement.deleteMany({});
    await Visit.deleteMany({});
    await BarberStats.deleteMany({});

    console.log('Database cleared successfully!');
    return { success: true, message: 'Database cleared successfully' };
  } catch (error: any) {
    console.error('Error clearing database:', error);
    return { 
      success: false, 
      message: `Error clearing database: ${error.message}`,
      error: error.toString(),
      stack: error.stack
    };
  }
}