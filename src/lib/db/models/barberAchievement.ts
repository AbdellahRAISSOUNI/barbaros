import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBarberAchievement extends Document {
  barberId: mongoose.Types.ObjectId;
  achievementId: mongoose.Types.ObjectId;
  progress: number; // Current progress towards requirement
  isCompleted: boolean;
  completedAt?: Date;
  completionCount: number; // For repeatable achievements
  currentStreak?: number; // For streak-based achievements
  lastProgressDate?: Date;
  notes?: string;
  validatedBy?: mongoose.Types.ObjectId; // Admin who validated (if manual validation required)
  metadata?: {
    [key: string]: any; // For storing additional progress data
  };
  createdAt: Date;
  updatedAt: Date;
}

const barberAchievementSchema = new Schema<IBarberAchievement>({
  barberId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  achievementId: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  completionCount: {
    type: Number,
    default: 0,
    min: 0
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastProgressDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  validatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better performance
barberAchievementSchema.index({ barberId: 1, achievementId: 1 }, { unique: true });
barberAchievementSchema.index({ barberId: 1, isCompleted: 1 });
barberAchievementSchema.index({ achievementId: 1 });
barberAchievementSchema.index({ completedAt: 1 });

// Compound index for leaderboard queries
barberAchievementSchema.index({ isCompleted: 1, completedAt: -1 });

// CRITICAL PERFORMANCE INDEXES - Phase 1 Fix
// Enhanced indexes for leaderboard and achievement analytics
barberAchievementSchema.index({ barberId: 1, isCompleted: 1, completedAt: -1 }, { background: true });
barberAchievementSchema.index({ barberId: 1, progress: 1 }, { background: true });
barberAchievementSchema.index({ achievementId: 1, isCompleted: 1 }, { background: true });
barberAchievementSchema.index({ barberId: 1, currentStreak: -1 }, { background: true, sparse: true });
barberAchievementSchema.index({ lastProgressDate: -1 }, { background: true, sparse: true });

const BarberAchievement: Model<IBarberAchievement> = mongoose.models.BarberAchievement || mongoose.model<IBarberAchievement>('BarberAchievement', barberAchievementSchema);

export default BarberAchievement; 