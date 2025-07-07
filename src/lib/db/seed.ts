import { Admin, Client, Service, ServiceCategory, Reward, Visit, BarberStats, Reservation } from './models';
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
        price: 250,
        durationMinutes: 30,
        imageUrl: '/images/services/regular-haircut.jpg',
        categoryId: createdCategories[0]._id,
        isActive: true,
        popularityScore: 10,
      },
      {
        name: 'Buzz Cut',
        description: 'Short haircut with clippers',
        price: 200,
        durationMinutes: 20,
        imageUrl: '/images/services/buzz-cut.jpg',
        categoryId: createdCategories[0]._id,
        isActive: true,
        popularityScore: 8,
      },
      {
        name: 'Beard Trim',
        description: 'Trim and shape beard',
        price: 150,
        durationMinutes: 15,
        imageUrl: '/images/services/beard-trim.jpg',
        categoryId: createdCategories[1]._id,
        isActive: true,
        popularityScore: 9,
      },
      {
        name: 'Hot Towel Shave',
        description: 'Traditional hot towel shave',
        price: 300,
        durationMinutes: 30,
        imageUrl: '/images/services/hot-towel-shave.jpg',
        categoryId: createdCategories[1]._id,
        isActive: true,
        popularityScore: 7,
      },
      {
        name: 'Hair Styling',
        description: 'Hair styling with products',
        price: 200,
        durationMinutes: 20,
        imageUrl: '/images/services/hair-styling.jpg',
        categoryId: createdCategories[2]._id,
        isActive: true,
        popularityScore: 6,
      },
      {
        name: 'Hair Coloring',
        description: 'Full hair coloring service',
        price: 500,
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
      const visitCount = Math.floor(Math.random() * 5) + 1;
      
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
    const clientCount = await Client.countDocuments();
    const visitCount = await Visit.countDocuments();
    const barberStatsCount = await BarberStats.countDocuments();

    console.log('Database seeding verification:');
    console.log(`- Admin count: ${adminCount}`);
    console.log(`- Category count: ${categoryCount}`);
    console.log(`- Service count: ${serviceCount}`);
    console.log(`- Reward count: ${rewardCount}`);
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
    await Visit.deleteMany({});
    await BarberStats.deleteMany({});
    await Reservation.deleteMany({});

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

const seedReservations = async () => {
  console.log('🎯 Seeding reservations...');

  // Clear existing reservations
  await Reservation.deleteMany({});

  const clients = await Client.find().limit(5);
  const sampleReservations = [];

  // Create guest reservations
  const guestReservations = [
    {
      guestName: 'John Smith',
      guestPhone: '+1234567890',
      preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      preferredTime: '10:30',
      status: 'pending',
      notes: 'First time visit, would like a consultation',
      source: 'guest'
    },
    {
      guestName: 'Maria Garcia',
      guestPhone: '+1234567891',
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      preferredTime: '14:00',
      status: 'contacted',
      notes: 'Regular trim, no beard work',
      source: 'guest',
      contactedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      guestName: 'Robert Johnson',
      guestPhone: '+1234567892',
      preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      preferredTime: '16:30',
      status: 'confirmed',
      notes: 'Need a beard trim and hair cut',
      source: 'guest',
      contactedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      guestName: 'Sarah Wilson',
      guestPhone: '+1234567893',
      preferredDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      preferredTime: '11:00',
      status: 'completed',
      notes: 'Wedding preparation',
      source: 'guest',
      contactedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      guestName: 'Michael Brown',
      guestPhone: '+1234567894',
      preferredDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      preferredTime: '15:00',
      status: 'cancelled',
      notes: 'Quick trim during lunch break',
      source: 'guest',
      contactedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  // Create client account reservations
  const clientReservations = clients.slice(0, 3).map((client, index) => {
    const daysFromNow = index + 1;
    const times = ['09:00', '13:30', '17:00'];
    const statuses = ['pending', 'contacted', 'confirmed'];
    
    return {
      clientId: client._id,
      preferredDate: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
      preferredTime: times[index],
      status: statuses[index],
      notes: index === 0 ? 'Regular monthly appointment' : undefined,
      source: 'client_account',
      contactedAt: index > 0 ? new Date(Date.now() - index * 60 * 60 * 1000) : undefined
    };
  });

  // Add some new unread reservations for admin attention
  const newReservations = [
    {
      guestName: 'Alex Thompson',
      guestPhone: '+1234567895',
      preferredDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      preferredTime: '12:00',
      status: 'pending',
      isRead: false,
      notes: 'Important client meeting, need to look sharp',
      source: 'guest',
      createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
    },
    {
      guestName: 'Emma Davis',
      guestPhone: '+1234567896',
      preferredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      preferredTime: '10:00',
      status: 'pending',
      isRead: false,
      notes: 'First visit, heard great things about you!',
      source: 'guest',
      createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    }
  ];

  const allReservations = [...guestReservations, ...clientReservations, ...newReservations];

  for (const reservationData of allReservations) {
    const reservation = new Reservation(reservationData);
    await reservation.save();
    sampleReservations.push(reservation);
  }

  console.log(`✅ Created ${sampleReservations.length} reservations`);
  return sampleReservations;
};

