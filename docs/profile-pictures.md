# Profile pictures: setup and testing

Elderly users and volunteers can optionally select a photo during signup and
change or remove it in **Profile → Edit Profile**. The admin editor uses the same
photo component and save flow. ID-card upload and verification remain unchanged.

## Supabase setup

1. Create a **public** Storage bucket named `avatars` (or choose another name in
   `SUPABASE_AVATAR_BUCKET`). Profile pictures are public; anyone with a picture's
   URL can view it.
2. Set the bucket's file-size limit to **5 MB** and allowed MIME type to
   `image/jpeg`. The backend accepts JPEG, PNG and WebP and converts them to JPEG.
3. Set these values in the backend's untracked `.env` file:

   ```dotenv
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=your-server-secret-key
   SUPABASE_AVATAR_BUCKET=avatars
   ```

   An existing `SUPABASE_SERVICE_ROLE_KEY` is also supported. Never place either
   secret in the mobile app, an `EXPO_PUBLIC_` variable, or source control.
4. Keep anonymous/authenticated bucket write policies disabled. The mobile app
   authenticates with the existing KindLink JWT; the backend authorizes writes.
   Existing broad write policies must be removed in the Supabase dashboard.
5. Configure `MONGODB_URI` and a strong `JWT_SECRET`, install backend dependencies
   with `npm install`, then restart the backend with `npm run dev`.

New photo uploads require Supabase. Missing configuration returns an upload error
and preserves the current profile; it does not silently store files on local disk.
Old local avatars remain readable and are cleaned up when their owner replaces them.

For a physical phone, set `EXPO_PUBLIC_API_URL` in `mobile/.env` to your reachable
backend address, including `/api`, then restart Expo. The explicit address now takes
precedence over the Android-emulator default. Production connections should use HTTPS.
The camera/gallery packages were already declared; run `npm install` in `mobile`
before testing. Native development builds need rebuilding for permission changes.

## Manual acceptance checks

- Register an elderly user with a photo. Return from password setup to check that
  the selection survives. Finish signup, sign in, and confirm the photo appears.
- Repeat for a volunteer. Also register without a photo; initials should appear.
- On Android/iOS, try camera and gallery, deny permission, cancel selection, and
  select a portrait/landscape image. On web, use Choose photo.
- In Edit Profile, select a replacement and save. Confirm both the photo and text
  changes survive navigating away, signing out, and signing back in.
- Select a different photo and leave without saving; the saved photo must remain.
- Remove a photo and save; initials should appear, including after signing back in.
- Try an invalid image or an upload while the backend/storage is unavailable.
  The form should retain the selection for retry and the previous profile should
  remain intact. If signup reports the email already exists after a lost response,
  sign in to recover the account rather than attempting to register it again.
- In Supabase, check that saved files appear beneath the user's ID and successful
  replacements/removals delete the previous file.

## Implementation and API

- `useAvatarPicker`: selection, square cropping, compression, permission errors.
- `ProfilePhotoField` and the shared `Avatar`: reusable UI and initials fallback.
- `SignupProvider`: temporary signup state; form data and image URIs stay out of
  navigation URLs and persistent browser storage.
- `createProfileBody`: shared native/web multipart handling. The file and form
  fields travel in one request, rather than a separate upload followed by a save.
- `saveUserWithPhoto`: shared backend validation, storage, save and cleanup logic.

`POST /api/auth/register` and authenticated `PUT /api/auth/profile`, `/me`, and
`/update-user` accept either existing JSON payloads (without a new file) or multipart:

| Field | Value |
| --- | --- |
| `payload` | JSON object containing the existing signup/profile fields |
| `avatar` | One optional image file, maximum 5 MB |

Use `profileImage: ""` in a JSON profile update to remove a photo. Clients cannot
attach new image URLs or storage paths. The compatibility endpoint
`POST /api/uploads/avatar` now saves the uploaded photo to the authenticated user
immediately and returns `{ data: { url } }`.

The backend checks decoded image content, type, dimensions (maximum 25 megapixels),
and single-frame input. It removes metadata, limits output to a square of at most
1024 pixels, and generates unique filenames. Concurrent edits use MongoDB document
version checks. Public registration cannot create admin accounts, requires a
password, and no longer uses a shared default password or JWT signing secret.

Failed saves remove newly uploaded files when the database confirms they are
unreferenced. Successful replacements delete the previous owned file, with three
cleanup attempts. Storage and MongoDB are separate systems: a process crash,
prolonged deletion outage or uncertain database acknowledgement can retain an
unused file. Cleanup failures are logged for operator reconciliation; the app
prioritizes keeping any image that might still be referenced.

## Automated checks

From `backend`, run `npm test`. Tests exercise real Express routes, JWT checks,
multipart parsing and Sharp decoding with in-memory MongoDB/Supabase substitutes;
they create no real accounts or cloud files.

From `mobile`, run `npx tsc --noEmit` and `npm run lint`. A production web export can
be checked with `npx expo export --platform web`. Run Expo once to refresh generated
route types if a fresh checkout reports stale route-name errors.

A live Supabase upload and physical-device camera test still require the setup
above. The ID-card phase should start after the profile-picture acceptance checks.
