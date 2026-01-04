# Avatar Upload Feature

## Overview
This feature allows users to upload and update their profile avatar image in real-time. The image is automatically stored in Supabase storage and the UI updates immediately upon successful upload.

## Architecture

### Frontend Components

#### `AvatarUpload` Component
Located at: `/app/components/AvatarUpload.tsx`

A reusable component that handles avatar selection and upload with:
- Image preview before upload
- Progress indicator during upload
- Error handling and display
- File validation (type and size)

**Usage:**
```tsx
<AvatarUpload
  avatarUrl={user?.avatarUrl}
  fullName={user?.fullName}
  onAvatarChange={(url) => {
    // Handle avatar URL change
  }}
  apiBase="http://localhost:3000"
/>
```

#### `AvatarDisplay` Component
Located at: `/app/components/AvatarDisplay.tsx`

A reusable component for displaying avatars with:
- Fallback to initials if no image
- Multiple size options (sm, md, lg)
- Consistent styling

#### `useAvatarUpload` Hook
Located at: `/app/hooks/useAvatarUpload.ts`

A custom hook that handles the avatar upload logic:
- File validation
- Upload to backend
- Error management
- Success callbacks

### Backend Endpoints

#### POST `/users/avatar`
Handles avatar file uploads with:
- JWT authentication required
- File size limit: 5MB
- Allowed types: JPEG, PNG, WebP, GIF
- Automatic removal of previous avatar
- Cache-busting URL generation

**Request:**
```
Method: POST
Endpoint: /users/avatar
Authentication: JWT (HttpOnly cookie)
Body: FormData with 'file' field
```

**Response:**
```json
{
  "avatarUrl": "https://...",
  "avatarPath": "userId/timestamp-filename.jpg",
  "removedPath": "userId/old-timestamp-filename.jpg" // optional
}
```

#### GET `/auth/profile`
Returns user profile with avatar information:
- Generates signed URLs if needed
- Returns avatarUrl and avatarPath

## Features

✅ **Instant Preview**: Shows image preview before upload
✅ **Automatic Upload**: Uploads immediately after file selection
✅ **Real-time Update**: UI updates instantly after successful upload
✅ **File Validation**: Validates file type and size before upload
✅ **Error Handling**: Displays user-friendly error messages
✅ **Cache Busting**: Ensures fresh image display with version parameter
✅ **Storage Cleanup**: Automatically removes previous avatar to save space
✅ **Responsive**: Works on all device sizes

## Usage in Profile Page

The profile page now uses the new `AvatarUpload` component:

```tsx
<AvatarUpload
  avatarUrl={user?.avatarUrl}
  fullName={user?.fullName}
  onAvatarChange={(avatarUrl) => {
    setUser((u) => (u ? { ...u, avatarUrl } : null))
  }}
  apiBase={API_BASE}
/>
```

## Configuration

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

**Backend (.env):**
```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
SUPABASE_BUCKET=avatars
```

### Supabase Setup

1. Create a bucket named `avatars` in Supabase Storage
2. Set appropriate bucket policies:
   - Public read access for avatar images
   - Authenticated write access for uploads

## Error Handling

The component gracefully handles:
- Invalid file types
- File size exceeds 5MB
- Network failures
- Upload failures
- Missing or invalid user authentication

All errors are displayed to the user with clear messages.

## File Validation

Validation occurs in both frontend and backend:

**Frontend Validation:**
- File type check (JPEG, PNG, WebP, GIF)
- File size check (max 5MB)

**Backend Validation:**
- File presence verification
- File type verification
- File size limit in multer configuration
- User authentication verification

## Cache Management

To ensure users always see their latest avatar:
1. Upload response includes cache-buster parameter (`v=timestamp`)
2. Image URLs with public paths are modified with `?v=` parameter
3. Frontend tracks avatar URL changes with `key` prop on img elements

## Future Enhancements

- [ ] Crop/resize avatar before upload
- [ ] Support for drag-and-drop upload
- [ ] Batch delete old avatars
- [ ] Avatar gallery for users
- [ ] Image compression before upload
- [ ] WebP conversion for optimal size

## Testing

To test the feature:

1. **Start Backend:**
   ```bash
   npm run start:dev
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Navigate to Profile Page:**
   - Go to `/profile`
   - Click on the camera icon on the avatar
   - Select an image file
   - Observe the preview and automatic upload
   - See the avatar update in real-time

## Troubleshooting

### Avatar not updating
- Check browser network tab for upload response
- Verify Supabase credentials are correct
- Check server logs for upload errors

### Upload fails with "No file uploaded"
- Ensure file is selected
- Check file size is under 5MB
- Verify file is an allowed type (JPEG, PNG, WebP, GIF)

### CORS errors
- Backend is properly configured with credentials: 'include'
- Supabase bucket has correct access policies

### Old avatar still showing
- Clear browser cache
- The URL should include version parameter (v=timestamp)
- Try a hard refresh (Ctrl+Shift+R)
