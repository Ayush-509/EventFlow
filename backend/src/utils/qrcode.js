import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(text) {
  if (!text) {
    throw new Error(
      'QR code content is required'
    );
  }

  try {
    return await QRCode.toDataURL(
      String(text),
      {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
      }
    );
  } catch (error) {
    console.error(
      'QR Code generation failed:',
      error.message
    );

    throw new Error(
      'Failed to generate QR code'
    );
  }
}

export default generateQRCodeDataUrl;

