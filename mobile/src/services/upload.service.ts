import { AdminApiClient } from './admin-api-client';
import { appendProfilePhoto } from './profile-form';

/** Legacy endpoint that saves the current user’s photo. Forms should attach the photo to their save. */
export const uploadService = {
  uploadAvatar: async (preparedJpegUri: string): Promise<string> => {
    const form = new FormData();
    await appendProfilePhoto(form, preparedJpegUri);
    const { url } = await AdminApiClient.postForm<{ url: string }>('/uploads/avatar', form);
    return url;
  },
};
