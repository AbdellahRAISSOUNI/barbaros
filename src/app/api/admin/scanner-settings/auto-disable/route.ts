import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { ScannerSettings } from '@/lib/db/models';

// POST - Check and auto-disable expired scanners
export async function POST() {
  try {
    await connectToDatabase();

    // Get scanner settings
    const settings = await ScannerSettings.findOne();
    if (!settings) {
      return NextResponse.json({
        success: true,
        message: 'No scanner settings found',
        disabled: false,
      });
    }

    // Check if auto-disable time has passed
    const now = new Date();
    let wasDisabled = false;

    if (settings.globalScannerEnabled && settings.disabledUntil && now >= settings.disabledUntil) {
      settings.globalScannerEnabled = false;
      settings.disabledUntil = undefined;
      await settings.save();
      wasDisabled = true;
    }

    return NextResponse.json({
      success: true,
      disabled: wasDisabled,
      currentStatus: {
        globalScannerEnabled: settings.globalScannerEnabled,
        disabledUntil: settings.disabledUntil,
        autoDisableHours: settings.autoDisableHours,
      },
    });
  } catch (error) {
    console.error('Error checking auto-disable:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check auto-disable' },
      { status: 500 }
    );
  }
} 