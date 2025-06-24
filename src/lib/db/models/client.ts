import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IClient extends Document {
  clientId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passwordHash: string;
  password?: string; // Temporary field for creation, not stored in DB
  dateCreated: Date;
  lastLogin?: Date;
  visitCount: number;
  rewardsEarned: number;
  rewardsRedeemed: number;
  accountActive: boolean;
  preferredServices: string[];
  qrCodeId?: string;
  qrCodeUrl?: string;
  lastVisit?: Date;
  // Loyalty Program Fields
  selectedReward?: string; // ID of the reward they're working towards
  selectedRewardStartVisits?: number; // Visit count when they selected this reward
  totalLifetimeVisits: number; // Total visits ever (doesn't reset)
  currentProgressVisits: number; // Visits since last reward redemption
  nextRewardEligibleAt?: number; // Visit count when next reward will be eligible
  loyaltyStatus: 'new' | 'active' | 'milestone_reached' | 'inactive';
  loyaltyJoinDate?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  fullName: string; // Virtual property
}

interface IClientModel extends Model<IClient> {
  findByPhone(phoneNumber: string): Promise<IClient | null>;
}

const ClientSchema = new Schema<IClient>({
  clientId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  dateCreated: { type: Date, required: true, default: Date.now },
  lastLogin: { type: Date },
  visitCount: { type: Number, default: 0 },
  rewardsEarned: { type: Number, default: 0 },
  rewardsRedeemed: { type: Number, default: 0 },
  accountActive: { type: Boolean, default: true },
  preferredServices: [{ type: String }],
  qrCodeId: { type: String },
  qrCodeUrl: { type: String },
  lastVisit: { type: Date },
  // Loyalty Program Fields
  selectedReward: { type: Schema.Types.ObjectId, ref: 'Reward' },
  selectedRewardStartVisits: { type: Number, default: 0 },
  totalLifetimeVisits: { type: Number, default: 0 },
  currentProgressVisits: { type: Number, default: 0 },
  nextRewardEligibleAt: { type: Number },
  loyaltyStatus: { 
    type: String, 
    enum: ['new', 'active', 'milestone_reached', 'inactive'], 
    default: 'new' 
  },
  loyaltyJoinDate: { type: Date, default: Date.now }
});

// Virtual for client's full name
ClientSchema.virtual('fullName').get(function(this: IClient) {
  return `${this.firstName} ${this.lastName}`;
});

// CRITICAL PERFORMANCE INDEXES - Phase 1 Fix
// Text search index for efficient client search
ClientSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  phoneNumber: 'text',
  clientId: 'text'
}, { 
  background: true,
  name: 'client_search_text'
});

// Compound indexes for common query patterns
ClientSchema.index({ lastName: 1, firstName: 1 }, { background: true });
ClientSchema.index({ phoneNumber: 1 }, { background: true });
ClientSchema.index({ clientId: 1 }, { background: true });
ClientSchema.index({ accountActive: 1, dateCreated: -1 }, { background: true });
ClientSchema.index({ loyaltyStatus: 1, totalLifetimeVisits: -1 }, { background: true });
ClientSchema.index({ lastVisit: -1 }, { background: true, sparse: true });

// Method to compare password
ClientSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    return false;
  }
};

// Static method to find client by phone number
ClientSchema.statics.findByPhone = async function(phoneNumber: string): Promise<IClient | null> {
  return this.findOne({ phoneNumber });
};

// Check if the model exists before creating it
const Client = mongoose.models.Client as IClientModel || mongoose.model<IClient, IClientModel>('Client', ClientSchema);

export default Client; 