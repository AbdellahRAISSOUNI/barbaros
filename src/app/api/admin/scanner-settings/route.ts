import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db/mongodb';
import { ScannerSettings } from '@/lib/db/models';

// GET - Get scanner settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.userType !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get or create scanner settings (singleton)
    let settings = await ScannerSettings.findOne();
    if (!settings) {
      settings = await ScannerSettings.create({
        globalScannerEnabled: false,
        autoDisableHours: 2,
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        globalScannerEnabled: settings.globalScannerEnabled,
        autoDisableHours: settings.autoDisableHours,
        disabledUntil: settings.disabledUntil,
        lastEnabledBy: settings.lastEnabledBy,
        lastEnabledAt: settings.lastEnabledAt,
      },
    });
  } catch (error) {
    console.error('Error fetching scanner settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch scanner settings' },
      { status: 500 }
    );
  }
}

// PUT - Update scanner settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.userType !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { globalScannerEnabled, autoDisableHours } = body;

    await connectToDatabase();

    // Get or create scanner settings (singleton)
    let settings = await ScannerSettings.findOne();
    if (!settings) {
      settings = new ScannerSettings();
    }

    // Update settings
    if (typeof globalScannerEnabled === 'boolean') {
      settings.globalScannerEnabled = globalScannerEnabled;
      settings.lastEnabledBy = session.user.name || session.user.email;
      settings.lastEnabledAt = new Date();

      // If enabling, set auto-disable time using current or provided autoDisableHours
      if (globalScannerEnabled) {
        const hoursToUse = typeof autoDisableHours === 'number' ? autoDisableHours : settings.autoDisableHours;
        const disableTime = new Date();
        disableTime.setHours(disableTime.getHours() + hoursToUse);
        settings.disabledUntil = disableTime;
      } else {
        settings.disabledUntil = undefined;
      }
    }

    if (typeof autoDisableHours === 'number' && autoDisableHours >= 1 && autoDisableHours <= 10000) {
      settings.autoDisableHours = autoDisableHours;
      
      // Update disable time if currently enabled
      if (settings.globalScannerEnabled) {
        const disableTime = new Date();
        disableTime.setHours(disableTime.getHours() + autoDisableHours);
        settings.disabledUntil = disableTime;
      }
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      settings: {
        globalScannerEnabled: settings.globalScannerEnabled,
        autoDisableHours: settings.autoDisableHours,
        disabledUntil: settings.disabledUntil,
        lastEnabledBy: settings.lastEnabledBy,
        lastEnabledAt: settings.lastEnabledAt,
      },
    });
  } catch (error) {
    console.error('Error updating scanner settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update scanner settings' },
      { status: 500 }
    );
  }
} 