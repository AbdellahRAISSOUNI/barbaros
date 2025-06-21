import mongoose, { Document, Schema } from 'mongoose';

export interface ServiceReceived {
  serviceId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  duration: number;
}

export interface IVisit extends Document {
  clientId: mongoose.Types.ObjectId;
  visitDate: Date;
  services: ServiceReceived[];
  totalPrice: number;
  barber: string;
  notes?: string;
  rewardRedeemed: boolean;
  redeemedRewardId?: mongoose.Types.ObjectId;
  visitNumber: number;
}

const VisitSchema = new Schema<IVisit>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required'],
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
    services: [
      {
        serviceId: {
          type: Schema.Types.ObjectId,
          ref: 'Service',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        duration: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    barber: {
      type: String,
      required: [true, 'Barber name is required'],
    },
    notes: {
      type: String,
    },
    rewardRedeemed: {
      type: Boolean,
      default: false,
    },
    redeemedRewardId: {
      type: Schema.Types.ObjectId,
      ref: 'Reward',
    },
    visitNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
VisitSchema.index({ clientId: 1, visitDate: -1 });
VisitSchema.index({ visitDate: -1 });
VisitSchema.index({ barber: 1 });

// Check if model already exists to prevent OverwriteModelError during hot reloads
const Visit = mongoose.models.Visit || mongoose.model<IVisit>('Visit', VisitSchema);

export default Visit; 