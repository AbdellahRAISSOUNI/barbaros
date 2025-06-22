import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  // Client Information
  clientId?: mongoose.Types.ObjectId; // For logged-in users
  
  // Guest Information (for non-logged-in users)
  guestName?: string;
  guestPhone?: string;
  
  // Reservation Details
  preferredDate: Date;
  preferredTime: string; // e.g., "14:30"
  
  // Status Management
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled' | 'completed';
  isRead: boolean;
  
  // Additional Information
  notes?: string;
  adminNotes?: string;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
  contactedAt?: Date;
  contactedBy?: mongoose.Types.ObjectId; // Admin who contacted
  
  // System Fields
  source: 'guest' | 'client_account';
  ipAddress?: string;
  userAgent?: string;
}

const reservationSchema = new Schema<IReservation>({
  // Client Information
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: false
  },
  
  // Guest Information
  guestName: {
    type: String,
    required: function() {
      return !this.clientId; // Required if no clientId (guest reservation)
    },
    trim: true
  },
  guestPhone: {
    type: String,
    required: function() {
      return !this.clientId; // Required if no clientId (guest reservation)
    },
    trim: true
  },
  
  // Reservation Details
  preferredDate: {
    type: Date,
    required: true,
    index: true
  },
  preferredTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['pending', 'contacted', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Additional Information
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Tracking
  contactedAt: {
    type: Date
  },
  contactedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // System Fields
  source: {
    type: String,
    enum: ['guest', 'client_account'],
    required: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
reservationSchema.index({ createdAt: -1 });
reservationSchema.index({ preferredDate: 1, preferredTime: 1 });
reservationSchema.index({ status: 1, isRead: 1 });
reservationSchema.index({ clientId: 1 }, { sparse: true });

// Virtual for display name
reservationSchema.virtual('displayName').get(function() {
  if (this.clientId && this.populated('clientId')) {
    const client = this.clientId as any;
    return `${client.firstName} ${client.lastName}`;
  }
  return this.guestName || 'Unknown';
});

// Virtual for contact info
reservationSchema.virtual('contactInfo').get(function() {
  if (this.clientId && this.populated('clientId')) {
    const client = this.clientId as any;
    return client.phoneNumber || client.email || 'No contact info';
  }
  return this.guestPhone || 'No contact info';
});

// Virtual for formatted date/time
reservationSchema.virtual('formattedDateTime').get(function() {
  const date = new Date(this.preferredDate);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return `${dateStr} at ${this.preferredTime}`;
});

// Pre-save middleware
reservationSchema.pre('save', function(next) {
  // Ensure either clientId or guest info is provided
  if (!this.clientId && (!this.guestName || !this.guestPhone)) {
    next(new Error('Either clientId or guest information (name and phone) must be provided'));
    return;
  }
  
  // Set source based on clientId presence
  if (this.clientId) {
    this.source = 'client_account';
  } else {
    this.source = 'guest';
  }
  
  next();
});

// Static methods
reservationSchema.statics.getUnreadCount = function() {
  return this.countDocuments({ isRead: false });
};

reservationSchema.statics.getPendingCount = function() {
  return this.countDocuments({ status: 'pending' });
};

reservationSchema.statics.getTodayReservations = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    preferredDate: {
      $gte: today,
      $lt: tomorrow
    }
  }).populate('clientId').sort({ preferredTime: 1 });
};

reservationSchema.statics.getUpcomingReservations = function(days = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    preferredDate: {
      $gte: today,
      $lt: futureDate
    },
    status: { $in: ['pending', 'contacted', 'confirmed'] }
  }).populate('clientId').sort({ preferredDate: 1, preferredTime: 1 });
};

// Instance methods
reservationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

reservationSchema.methods.updateStatus = function(status: string, adminId?: string) {
  this.status = status;
  if (status === 'contacted' && adminId) {
    this.contactedAt = new Date();
    this.contactedBy = new mongoose.Types.ObjectId(adminId);
  }
  return this.save();
};

export default mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', reservationSchema); 