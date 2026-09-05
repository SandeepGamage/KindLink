/**
 * upload.service.ts
 *
 * Transport for user-supplied files. Intentionally free of any admin or
 * profile-screen knowledge: it takes a local file URI, hands back the reference
 * the server stored it under, and leaves it to the caller to decide what that
 * reference is for. The registration flow can call this unchanged.
 */
import { AdminApiClient } from './admin-api-client';

/** Extension → MIME, for the multipart part name the server's filter checks. */
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function describeFile(localUri: string): { name: string; type: string } {
  const rawName = localUri.split('/').pop() || 'avatar.jpg';
  // Strip any query string an asset URI may carry before reading the extension.
  const name = rawName.split('?')[0] || 'avatar.jpg';
  const extension = name.split('.').pop()?.toLowerCase() ?? '';

  return {
    name: MIME_BY_EXTENSION[extension] ? name : `${name}.jpg`,
    type: MIME_BY_EXTENSION[extension] ?? 'image/jpeg',
  };
}

export const uploadService = {
  /**
   * Uploads an image and resolves with the path the server stored it at
   * (e.g. `/uploads/avatars/avatar-<id>-<ts>.jpg`). That path is what belongs in
   * `profileImage`; use `resolveMediaUrl` from `api-config` to display it.
   *
   * Throws `ApiError` on failure, carrying the backend's own message.
   */
  uploadAvatar: async (localUri: string): Promise<string> => {
    const { name, type } = describeFile(localUri);

    const form = new FormData();
    // React Native's FormData accepts this file descriptor shape; the DOM type
    // definitions only know about Blob, hence the cast.
    form.append('avatar', { uri: localUri, name, type } as unknown as Blob);

    const { url } = await AdminApiClient.postForm<{ url: string }>('/uploads/avatar', form);
    return url;
  },
};
