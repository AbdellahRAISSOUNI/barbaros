import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
  categoryId: mongoose.Types.ObjectId;
  isActive: boolean;
  popularityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
    },
    imageUrl: {
      type: String,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: [true, 'Category is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    popularityScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ServiceSchema.index({ categoryId: 1 });
ServiceSchema.index({ popularityScore: -1 });
ServiceSchema.index({ isActive: 1 });

// Check if model already exists to prevent OverwriteModelError during hot reloads
const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service; 