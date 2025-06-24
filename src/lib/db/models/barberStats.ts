import mongoose, { Document, Schema } from 'mongoose';

export interface MonthlyStats {
  month: string; // Format: "YYYY-MM"
  visitsCount: number;
  revenue: number;
  uniqueClients: number;
}

export interface ServiceStats {
  serviceId: mongoose.Types.ObjectId;
  serviceName: string;
  count: number;
  revenue: number;
}

export interface IBarberStats extends Document {
  barberId: mongoose.Types.ObjectId;
  totalVisits: number;
  totalRevenue: number;
  uniqueClientsServed: mongoose.Types.ObjectId[];
  workDaysSinceJoining: number;
  averageVisitsPerDay: number;
  monthlyStats: MonthlyStats[];
  serviceStats: ServiceStats[];
  lastUpdated: Date;
  // Performance metrics
  clientRetentionRate: number; // Percentage of repeat clients
  averageServiceTime: number; // Average duration per visit
  topServices: string[]; // Most performed services
  busyHours: number[]; // Peak hours (0-23)
}

const BarberStatsSchema = new Schema<IBarberStats>(
  {
    barberId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      unique: true,
      index: true,
    },
    totalVisits: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    uniqueClientsServed: [{
      type: Schema.Types.ObjectId,
      ref: 'Client',
    }],
    workDaysSinceJoining: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageVisitsPerDay: {
      type: Number,
      default: 0,
      min: 0,
    },
    monthlyStats: [{
      month: {
        type: String,
        required: true,
      },
      visitsCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      revenue: {
        type: Number,
        default: 0,
        min: 0,
      },
      uniqueClients: {
        type: Number,
        default: 0,
        min: 0,
      },
    }],
    serviceStats: [{
      serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
      },
      serviceName: {
        type: String,
        required: true,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
      revenue: {
        type: Number,
        default: 0,
        min: 0,
      },
    }],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    // Performance metrics
    clientRetentionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    averageServiceTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    topServices: [{
      type: String,
    }],
    busyHours: [{
      type: Number,
      min: 0,
      max: 23,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
BarberStatsSchema.index({ barberId: 1 });
BarberStatsSchema.index({ lastUpdated: -1 });
BarberStatsSchema.index({ totalVisits: -1 });
BarberStatsSchema.index({ totalRevenue: -1 });

// Static method to calculate work days since joining
BarberStatsSchema.methods.calculateWorkDays = function(joinDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joinDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Check if model already exists to prevent OverwriteModelError during hot reloads
const BarberStats = mongoose.models.BarberStats || mongoose.model<IBarberStats>('BarberStats', BarberStatsSchema);

export default BarberStats; 