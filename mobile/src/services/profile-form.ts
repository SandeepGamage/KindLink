import { Platform } from 'react-native';

/** Picker output is always re-encoded as JPEG before reaching this transport. */
export async function appendProfilePhoto(form: FormData, localUri: string): Promise<void> {
  if (Platform.OS === 'web') {
    const response = await fetch(localUri);
    if (!response.ok) throw new Error('Could not read the selected photo. Please choose it again.');
    const blob = await response.blob();
    form.append('avatar', blob, 'avatar.jpg');
  } else {
    form.append('avatar', {
      uri: localUri, name: 'avatar.jpg', type: 'image/jpeg',
    } as unknown as Blob);
  }
}

export async function createProfileBody(payload: object, photoUri?: string): Promise<{
  body: string | FormData;
  headers: Record<string, string>;
}> {
  if (!photoUri) {
    return { body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } };
  }
  const form = new FormData();
  form.append('payload', JSON.stringify(payload));
  await appendProfilePhoto(form, photoUri);
  // Fetch supplies the multipart boundary; never set Content-Type manually.
  return { body: form, headers: {} };
}
