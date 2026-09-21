const sharp = require('sharp');

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const INVALID_DOCUMENT_TYPE = 'INVALID_DOCUMENT_TYPE';
const ALLOWED_DOCUMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates, strips privacy metadata (EXIF/GPS), and normalizes an ID card / NIC image.
 * Preserves the natural aspect ratio of the document (does NOT square crop).
 * Limits maximum dimensions to 2048px on the longest edge at quality 85 to maintain crisp text legibility.
 */
const normalizeDocument = async (file) => {
  try {
    if (
      !Buffer.isBuffer(file?.buffer) ||
      !file.buffer.length ||
      file.buffer.length > MAX_DOCUMENT_BYTES ||
      !ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype)
    ) {
      throw new Error('Invalid document image');
    }

    const image = sharp(file.buffer, { limitInputPixels: 30_000_000, failOn: 'warning' });
    const metadata = await image.metadata();
    const mimeByFormat = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

    if (mimeByFormat[metadata.format] !== file.mimetype || (metadata.pages || 1) !== 1) {
      throw new Error('Unsupported document format');
    }

    // Auto-orient based on EXIF tag before stripping metadata,
    // fit inside 2048x2048 preserving aspect ratio, re-encode as clean JPEG
    return await image
      .rotate()
      .resize({
        width: 2048,
        height: 2048,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (err) {
    const error = new Error('Choose a valid JPEG, PNG or WebP ID document image under 10 MB.');
    error.code = INVALID_DOCUMENT_TYPE;
    error.status = 400;
    throw error;
  }
};

module.exports = {
  normalizeDocument,
  MAX_DOCUMENT_BYTES,
  INVALID_DOCUMENT_TYPE,
  ALLOWED_DOCUMENT_MIME_TYPES
};
