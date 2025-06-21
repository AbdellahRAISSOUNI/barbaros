import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceCategory extends Document {
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

const ServiceCategorySchema = new Schema<IServiceCategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for sorting by display order
ServiceCategorySchema.index({ displayOrder: 1 });

// Check if model already exists to prevent OverwriteModelError during hot reloads
const ServiceCategory = mongoose.models.ServiceCategory || mongoose.model<IServiceCategory>('ServiceCategory', ServiceCategorySchema);

export default ServiceCategory; 