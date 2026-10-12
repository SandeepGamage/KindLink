import { Platform } from 'react-native';

export interface ProfileUploadOptions {
  photoUri?: string;
  idDocumentUri?: string;
}

/** Picker output is always re-encoded as JPEG before reaching this transport. */
export async function appendProfilePhoto(form: FormData, localUri: string): Promise<void> {
  if (Platform.OS === 'web') {
    const response = await fetch(localUri);
    if (!response.ok) throw new Error('Could not read the selected photo. Please choose it again.');
    const blob = await response.blob();
    form.append('avatar', blob, 'avatar.jpg');
  } else {
    form.append('avatar', {
      uri: localUri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
  }
}

/** Document image is re-encoded as JPEG before transport. */
export async function appendDocumentImage(form: FormData, localUri: string): Promise<void> {
  if (Platform.OS === 'web') {
    const response = await fetch(localUri);
    if (!response.ok) throw new Error('Could not read the selected ID document. Please choose it again.');
    const blob = await response.blob();
    form.append('idDocument', blob, 'nic_document.jpg');
  } else {
    form.append('idDocument', {
      uri: localUri,
      name: 'nic_document.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
  }
}

export async function createProfileBody(
  payload: object,
  photoUriOrOptions?: string | ProfileUploadOptions,
): Promise<{
  body: string | FormData;
  headers: Record<string, string>;
}> {
  const options: ProfileUploadOptions =
    typeof photoUriOrOptions === 'string'
      ? { photoUri: photoUriOrOptions }
      : photoUriOrOptions || {};

  const { photoUri, idDocumentUri } = options;

  if (!photoUri && !idDocumentUri) {
    return { body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } };
  }

  const form = new FormData();
  form.append('payload', JSON.stringify(payload));

  if (photoUri) {
    await appendProfilePhoto(form, photoUri);
  }

  if (idDocumentUri) {
    await appendDocumentImage(form, idDocumentUri);
  }

  // Fetch supplies the multipart boundary; never set Content-Type manually.
  return { body: form, headers: {} };
}
