import mongoose, { Document, Schema } from 'mongoose';

export interface IReward extends Document {
  name: string;
  description: string;
  visitsRequired: number;
  rewardType: 'free' | 'discount';
  discountPercentage?: number; // Only used if rewardType is 'discount'
  isActive: boolean;
  applicableServices: mongoose.Types.ObjectId[];
  maxRedemptions?: number; // Maximum times this reward can be redeemed per client
  validForDays?: number; // How many days the reward is valid after earning
  createdAt: Date;
  updatedAt: Date;
}

const RewardSchema = new Schema<IReward>(
  {
    name: {
      type: String,
      required: [true, 'Reward name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    visitsRequired: {
      type: Number,
      required: [true, 'Visits required is required'],
      min: 1,
    },
    rewardType: {
      type: String,
      enum: ['free', 'discount'],
      required: [true, 'Reward type is required'],
      default: 'free',
    },
    discountPercentage: {
      type: Number,
      min: 1,
      max: 100,
      validate: {
        validator: function(this: IReward, value: number | undefined) {
          if (this.rewardType === 'discount') {
            return value !== undefined && value > 0 && value <= 100;
          }
          return true;
        },
        message: 'Discount percentage is required for discount rewards and must be between 1-100',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxRedemptions: {
      type: Number,
      min: 1,
      default: null,
    },
    validForDays: {
      type: Number,
      min: 1,
      default: null,
    },
    applicableServices: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
RewardSchema.index({ visitsRequired: 1 });
RewardSchema.index({ isActive: 1 });

// Check if model already exists to prevent OverwriteModelError during hot reloads
const Reward = mongoose.models.Reward || mongoose.model<IReward>('Reward', RewardSchema);

export default Reward; 