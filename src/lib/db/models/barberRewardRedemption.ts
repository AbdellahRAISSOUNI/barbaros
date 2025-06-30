import mongoose from 'mongoose';

export interface IBarberRewardRedemption {
  _id: mongoose.Types.ObjectId;
  barberId: mongoose.Types.ObjectId;
  rewardId: mongoose.Types.ObjectId;
  status: 'earned' | 'redeemed';
  earnedAt: Date;
  redeemedAt?: Date;
  redeemedBy?: mongoose.Types.ObjectId;
  notes?: string;
  progressAtEarning: {
    totalVisits: number;
    uniqueClients: number;
    monthsWorked: number;
    clientRetentionRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const barberRewardRedemptionSchema = new mongoose.Schema<IBarberRewardRedemption>({
  barberId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Admin' },
  rewardId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'BarberReward' },
  status: { 
    type: String, 
    required: true,
    enum: ['earned', 'redeemed'],
    default: 'earned'
  },
  earnedAt: { type: Date, required: true },
  redeemedAt: { type: Date },
  redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  notes: { type: String },
  progressAtEarning: {
    totalVisits: { type: Number, required: true },
    uniqueClients: { type: Number, required: true },
    monthsWorked: { type: Number, required: true },
    clientRetentionRate: { type: Number, required: true }
  }
}, {
  timestamps: true
});

const BarberRewardRedemption = mongoose.models.BarberRewardRedemption || 
  mongoose.model<IBarberRewardRedemption>('BarberRewardRedemption', barberRewardRedemptionSchema);

export default BarberRewardRedemption; 