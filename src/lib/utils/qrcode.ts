import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique client ID for QR code
 */
export const generateClientId = (): string => {
  return uuidv4();
};

/**
 * Create a QR code data URL for a client
 * @param clientId - The unique client identifier
 * @param options - QR code generation options
 */
export const generateQRCodeDataURL = async (
  clientId: string,
  options: QRCode.QRCodeToDataURLOptions = {}
): Promise<string> => {
  try {
    // Create the data to be encoded in the QR code
    const qrData = JSON.stringify({
      id: clientId,
      type: 'barbaros-client',
      timestamp: Date.now()
    });
    
    // Default options for optimal scanning
    const defaultOptions: QRCode.QRCodeToDataURLOptions = {
      errorCorrectionLevel: 'H', // High error correction
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Generate the QR code as a data URL
    return await QRCode.toDataURL(qrData, mergedOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Parse QR code data
 * @param qrData - The data from the scanned QR code
 */
export const parseQRCodeData = (qrData: string): { id: string; type: string } | null => {
  try {
    const data = JSON.parse(qrData);
    
    // Validate that this is a Barbaros client QR code
    if (data && data.type === 'barbaros-client' && data.id) {
      return {
        id: data.id,
        type: data.type
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    return null;
  }
};

/**
 * Download QR code as an image
 * @param dataUrl - The QR code data URL
 * @param filename - The filename for the downloaded image
 */
export const downloadQRCode = (dataUrl: string, filename: string = 'barbaros-qrcode.png'): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 