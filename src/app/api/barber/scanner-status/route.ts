import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db/mongodb';
import { Admin, ScannerSettings } from '@/lib/db/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.userType !== 'barber') {
      return NextResponse.json(
        { success: false, message: 'Barber access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get global scanner settings
    let globalSettings = await ScannerSettings.findOne();
    if (!globalSettings) {
      globalSettings = await ScannerSettings.create({
        globalScannerEnabled: false,
        autoDisableHours: 2,
      });
    }

    // Check if auto-disable time has passed
    const now = new Date();
    if (globalSettings.disabledUntil && now >= globalSettings.disabledUntil) {
      globalSettings.globalScannerEnabled = false;
      globalSettings.disabledUntil = undefined;
      await globalSettings.save();
    }

    // Get barber's individual settings
    const barber = await Admin.findOne({ 
      email: session.user.email,
      role: 'barber' 
    });

    if (!barber) {
      return NextResponse.json(
        { success: false, message: 'Barber not found' },
        { status: 404 }
      );
    }

    const scannerEnabled = globalSettings.globalScannerEnabled && barber.scannerEnabled;

    return NextResponse.json({
      success: true,
      scannerEnabled,
      globalEnabled: globalSettings.globalScannerEnabled,
      individualEnabled: barber.scannerEnabled,
      disabledUntil: globalSettings.disabledUntil,
      autoDisableHours: globalSettings.autoDisableHours,
    });
  } catch (error) {
    console.error('Error checking scanner status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check scanner status' },
      { status: 500 }
    );
  }
} 