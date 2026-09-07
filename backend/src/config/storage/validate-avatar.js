const sharp = require('sharp');

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const INVALID_FILE_TYPE = 'INVALID_FILE_TYPE';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Decode before storing: a MIME header or filename does not prove it is an image.
// Re-encoding strips metadata (including GPS) and trailing embedded content.
const normalizeAvatar = async (file) => {
  try {
    if (!Buffer.isBuffer(file?.buffer) || !file.buffer.length ||
        file.buffer.length > MAX_AVATAR_BYTES || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid image');
    }
    const image = sharp(file.buffer, { limitInputPixels: 25_000_000, failOn: 'warning' });
    const metadata = await image.metadata();
    const mimeByFormat = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
    if (mimeByFormat[metadata.format] !== file.mimetype || (metadata.pages || 1) !== 1) {
      throw new Error('Unsupported image');
    }
    const side = Math.min(1024, metadata.width, metadata.height);
    return await image.rotate()
      .resize(side, side, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 80 }).toBuffer();
  } catch {
    const error = new Error('Choose a valid JPEG, PNG or WebP photo under 5 MB and 25 megapixels.');
    error.code = INVALID_FILE_TYPE;
    error.status = 400;
    throw error;
  }
};

module.exports = { normalizeAvatar, MAX_AVATAR_BYTES, INVALID_FILE_TYPE, ALLOWED_MIME_TYPES };
