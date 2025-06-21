import { Admin, Client, Service, ServiceCategory, Reward, Visit } from './models';
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
      },
      {
        username: 'receptionist',
        passwordHash: standardPasswordHash,
        name: 'Sarah Williams',
        role: 'receptionist',
        email: 'reception@barbaros.com',
        active: true,
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

    // Verify that data was created
    const adminCount = await Admin.countDocuments();
    const categoryCount = await ServiceCategory.countDocuments();
    const serviceCount = await Service.countDocuments();
    const rewardCount = await Reward.countDocuments();
    const clientCount = await Client.countDocuments();
    const visitCount = await Visit.countDocuments();

    console.log('Database seeding verification:');
    console.log(`- Admin count: ${adminCount}`);
    console.log(`- Category count: ${categoryCount}`);
    console.log(`- Service count: ${serviceCount}`);
    console.log(`- Reward count: ${rewardCount}`);
    console.log(`- Client count: ${clientCount}`);
    console.log(`- Visit count: ${visitCount}`);

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
        visits: visitCount
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