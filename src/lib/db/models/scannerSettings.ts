import mongoose, { Document, Schema } from 'mongoose';

export interface IScannerSettings extends Document {
  globalScannerEnabled: boolean;
  autoDisableHours: number; // Hours until auto-disable (default 2, min 1, max 10000)
  disabledUntil?: Date; // When the scanner will be re-enabled (if auto-disabled)
  lastEnabledBy?: string; // Admin who last enabled/disabled
  lastEnabledAt?: Date; // When it was last enabled
}

const ScannerSettingsSchema = new Schema<IScannerSettings>(
  {
    globalScannerEnabled: {
      type: Boolean,
      default: false,
    },
    autoDisableHours: {
      type: Number,
      default: 2,
      min: 1,
      max: 10000,
    },
    disabledUntil: {
      type: Date,
    },
    lastEnabledBy: {
      type: String,
    },
    lastEnabledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Check if model already exists to prevent OverwriteModelError during hot reloads
const ScannerSettings = mongoose.models.ScannerSettings || mongoose.model<IScannerSettings>('ScannerSettings', ScannerSettingsSchema);

export default ScannerSettings; 