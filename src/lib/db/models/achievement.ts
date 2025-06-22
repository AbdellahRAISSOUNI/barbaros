import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAchievement extends Document {
  title: string;
  description: string;
  category: 'tenure' | 'visits' | 'clients' | 'consistency' | 'quality' | 'teamwork' | 'learning' | 'milestone';
  subcategory?: string; // For more specific categorization
  requirement: number;
  requirementType: 'count' | 'days' | 'streak' | 'percentage' | 'milestone';
  requirementDetails?: {
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all-time';
    consecutiveRequired?: boolean;
    minimumValue?: number;
    maximumValue?: number;
  };
  badge: string;
  color: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number; // Achievement points for gamification
  reward?: {
    type: 'monetary' | 'time_off' | 'recognition' | 'privileges' | 'training';
    value: string;
    description: string;
  };
  prerequisites?: string[]; // Achievement IDs that must be completed first
  isRepeatable: boolean;
  maxCompletions?: number;
  isActive: boolean;
  validFrom?: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const achievementSchema = new Schema<IAchievement>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['tenure', 'visits', 'clients', 'consistency', 'quality', 'teamwork', 'learning', 'milestone']
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 50
  },
  requirement: {
    type: Number,
    required: true,
    min: 1
  },
  requirementType: {
    type: String,
    required: true,
    enum: ['count', 'days', 'streak', 'percentage', 'milestone']
  },
  requirementDetails: {
    timeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'all-time']
    },
    consecutiveRequired: {
      type: Boolean,
      default: false
    },
    minimumValue: {
      type: Number,
      min: 0
    },
    maximumValue: {
      type: Number,
      min: 0
    }
  },
  badge: {
    type: String,
    required: true,
    default: '🎯'
  },
  color: {
    type: String,
    required: true,
    default: 'bg-blue-500'
  },
  icon: {
    type: String,
    required: true,
    default: 'FaTrophy'
  },
  tier: {
    type: String,
    required: true,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    default: 10
  },
  reward: {
    type: {
      type: String,
      enum: ['monetary', 'time_off', 'recognition', 'privileges', 'training']
    },
    value: {
      type: String,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200
    }
  },
  prerequisites: [{
    type: Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  isRepeatable: {
    type: Boolean,
    default: false
  },
  maxCompletions: {
    type: Number,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date
  },
  validUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
achievementSchema.index({ category: 1, isActive: 1 });
achievementSchema.index({ requirement: 1 });

const Achievement: Model<IAchievement> = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', achievementSchema);

export default Achievement; 