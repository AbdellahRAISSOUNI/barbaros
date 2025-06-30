import mongoose from 'mongoose';

export interface IBarberReward {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  rewardType: 'monetary' | 'gift' | 'time_off' | 'recognition';
  rewardValue: string;
  requirementType: 'visits' | 'clients' | 'months_worked' | 'client_retention' | 'custom';
  requirementValue: number;
  requirementDescription: string;
  category: string;
  icon: string;
  color: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const barberRewardSchema = new mongoose.Schema<IBarberReward>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  rewardType: { 
    type: String, 
    required: true,
    enum: ['monetary', 'gift', 'time_off', 'recognition']
  },
  rewardValue: { type: String, required: true },
  requirementType: { 
    type: String, 
    required: true,
    enum: ['visits', 'clients', 'months_worked', 'client_retention', 'custom']
  },
  requirementValue: { type: Number, required: true },
  requirementDescription: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const BarberReward = mongoose.models.BarberReward || mongoose.model<IBarberReward>('BarberReward', barberRewardSchema);

export default BarberReward; 