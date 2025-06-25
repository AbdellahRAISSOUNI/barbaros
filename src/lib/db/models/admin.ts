import mongoose, { Document, Schema } from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface IAdmin extends Document {
  username: string;
  passwordHash: string;
  name: string;
  role: 'owner' | 'barber' | 'receptionist';
  lastLogin?: Date;
  email: string;
  active: boolean;
  // New barber-specific fields
  profilePicture?: string;
  joinDate: Date;
  isBarber: boolean;
  phoneNumber?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['owner', 'barber', 'receptionist'],
      required: [true, 'Role is required'],
    },
    lastLogin: {
      type: Date,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    // New barber-specific fields
    profilePicture: {
      type: String, // Base64 encoded image
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    isBarber: {
      type: Boolean,
      default: function() {
        return this.role === 'barber';
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Update isBarber flag when role changes
AdminSchema.pre('save', function (next) {
  if (this.isModified('role')) {
    this.isBarber = this.role === 'barber';
  }
  next();
});

// Method to compare passwords
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Indexes for better performance
AdminSchema.index({ role: 1 });
AdminSchema.index({ isBarber: 1 });
AdminSchema.index({ active: 1 });

// Check if model already exists to prevent OverwriteModelError during hot reloads
const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin; 