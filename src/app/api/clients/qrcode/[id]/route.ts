import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { generateQRCodeDataURL } from '@/lib/utils/qrcode';
import { getClientById, getClientByClientId, updateClient } from '@/lib/db/api/clientApi';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const params = await context.params;
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    // Try to get client by MongoDB _id first, then by clientId if that fails
    let client = await getClientById(id);
    if (!client) {
      client = await getClientByClientId(id);
    }
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    // Use the client's unique clientId for QR code generation
    const qrCodeId = client.clientId;
    
    try {
      // Generate QR code
      const qrCodeDataUrl = await generateQRCodeDataURL(qrCodeId);
      
      // Update client with QR code URL if needed
      if (!client.qrCodeUrl) {
        await updateClient(client._id.toString(), {
          qrCodeUrl: `/api/clients/qrcode/${client.clientId}`
        });
      }
      
      return NextResponse.json({
        success: true,
        qrCode: qrCodeDataUrl,
        clientId: client.clientId
      });
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
      return NextResponse.json(
        { error: 'Failed to generate QR code' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in QR code endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// POST endpoint to regenerate a QR code (if needed)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    // Check authentication - only admins can regenerate QR codes
    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const params = await context.params;
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    // Try to get client by MongoDB _id first, then by clientId if that fails
    let client = await getClientById(id);
    if (!client) {
      client = await getClientByClientId(id);
    }
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    try {
      // Generate QR code using client's unique clientId
      const qrCodeDataUrl = await generateQRCodeDataURL(client.clientId);
      
      // Update the client record with the QR code URL
      await updateClient(client._id.toString(), {
        qrCodeUrl: `/api/clients/qrcode/${client.clientId}`
      });
      
      return NextResponse.json({
        success: true,
        qrCode: qrCodeDataUrl,
        clientId: client.clientId
      });
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
      return NextResponse.json(
        { error: 'Failed to generate QR code' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in QR code endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 