// Debug script to check client loyalty data
// Run this with: node debug-client-data.js [clientId]

const mongoose = require('mongoose');

// MongoDB connection (adjust the connection string as needed)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barbaros';

// Basic client schema (minimal version)
const clientSchema = new mongoose.Schema({
  clientId: String,
  firstName: String,
  lastName: String,
  currentProgressVisits: { type: Number, default: 0 },
  totalLifetimeVisits: { type: Number, default: 0 },
  selectedReward: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' },
  selectedRewardStartVisits: { type: Number, default: 0 },
  rewardsRedeemed: { type: Number, default: 0 },
  loyaltyStatus: String
});

const rewardSchema = new mongoose.Schema({
  name: String,
  description: String,
  visitsRequired: Number,
  rewardType: String,
  isActive: Boolean
});

async function debugClientData(clientId) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Client = mongoose.model('Client', clientSchema);
    const Reward = mongoose.model('Reward', rewardSchema);

    // Find the client
    const client = await Client.findById(clientId).populate('selectedReward');
    
    if (!client) {
      console.log('❌ Client not found with ID:', clientId);
      return;
    }

    console.log('\n=== CLIENT LOYALTY DEBUG ===');
    console.log('Client Name:', client.firstName, client.lastName);
    console.log('Client ID:', client._id);
    console.log('Current Progress Visits:', client.currentProgressVisits);
    console.log('Total Lifetime Visits:', client.totalLifetimeVisits);
    console.log('Rewards Redeemed:', client.rewardsRedeemed);
    console.log('Loyalty Status:', client.loyaltyStatus);
    
    if (client.selectedReward) {
      console.log('\n--- Selected Reward ---');
      console.log('Reward Name:', client.selectedReward.name);
      console.log('Visits Required:', client.selectedReward.visitsRequired);
      console.log('Selected Reward Start Visits:', client.selectedRewardStartVisits);
      console.log('Progress towards reward:', client.currentProgressVisits, '/', client.selectedReward.visitsRequired);
      console.log('Can redeem?:', client.currentProgressVisits >= client.selectedReward.visitsRequired);
    } else {
      console.log('\n--- No Selected Reward ---');
    }

    // Find all active rewards and check eligibility
    const activeRewards = await Reward.find({ isActive: true }).sort({ visitsRequired: 1 });
    
    console.log('\n--- All Active Rewards & Eligibility ---');
    for (const reward of activeRewards) {
      const eligible = client.currentProgressVisits >= reward.visitsRequired && 
                      client.totalLifetimeVisits >= reward.visitsRequired;
      const status = eligible ? '✅ ELIGIBLE' : '❌ Not eligible';
      console.log(`${reward.name} (${reward.visitsRequired} visits required): ${status}`);
      
      if (!eligible) {
        const needed = reward.visitsRequired - client.currentProgressVisits;
        console.log(`   → Need ${needed} more visits`);
      }
    }

    console.log('\n=== END DEBUG ===\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Get client ID from command line arguments
const clientId = process.argv[2];

if (!clientId) {
  console.log('Usage: node debug-client-data.js [clientId]');
  console.log('Example: node debug-client-data.js 507f1f77bcf86cd799439011');
  process.exit(1);
}

debugClientData(clientId); 