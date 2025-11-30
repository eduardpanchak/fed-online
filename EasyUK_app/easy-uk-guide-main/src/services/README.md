# Service Layer Architecture

This directory contains the service layer that abstracts all backend operations. The service layer provides a clean API that sits between your React components and the backend (currently Lovable Cloud/Supabase).

## Purpose

The service layer was designed with these goals:

1. **Backend Abstraction**: All backend logic is wrapped in service modules, making it easy to swap backends (e.g., migrate to Firebase) without changing UI components.

2. **Centralized Logic**: All database queries, auth operations, storage uploads, and API calls are in one place.

3. **Testability**: Services can be easily mocked for testing.

4. **Maintainability**: Changes to backend logic only require updates in service files, not across the entire codebase.

## Service Modules

### `authService.ts`
Handles all authentication operations:
- `signUp()` - Register new users
- `signIn()` - Email/password login
- `signInWithGoogle()` - OAuth with Google
- `signInWithApple()` - OAuth with Apple
- `signOut()` - Logout current user
- `getCurrentUser()` - Get authenticated user
- `getSession()` - Get current session
- `resetPassword()` - Send password reset email
- `updatePassword()` - Update user password
- `onAuthStateChange()` - Subscribe to auth events

### `dbService.ts`
Handles all database CRUD operations:
- **Profiles**: `getProfile()`, `createProfile()`, `updateProfile()`
- **Services**: `getServices()`, `getService()`, `createService()`, `updateService()`, `deleteService()`
- **Subscriptions**: `getSubscription()`, `createSubscription()`, `updateSubscription()`
- **Saved Items**: `getSavedItems()`, `addSavedItem()`, `removeSavedItem()`, `isSaved()`
- **Reviews**: `getServiceReviews()`, `createReview()`, `updateReview()`, `deleteReview()`
- **User Settings**: `getUserSettings()`, `updateUserSettings()`
- **Business Profiles**: `getBusinessProfile()`, `createBusinessProfile()`, `updateBusinessProfile()`
- **Feedback**: `submitFeedback()`
- **Checklist Progress**: `getChecklistProgress()`, `updateChecklistProgress()`

### `storageService.ts`
Handles all file storage operations:
- `uploadFile()` - Generic file upload
- `getPublicUrl()` - Get public URL for a file
- `deleteFile()` - Delete single file
- `deleteFiles()` - Delete multiple files
- `listFiles()` - List files in directory
- `downloadFile()` - Download a file
- `uploadAvatar()` - Upload user avatar
- `uploadServicePhoto()` - Upload service photo
- `deleteServicePhotoByUrl()` - Delete service photo by URL

### `subscriptionService.ts`
Handles all subscription and payment operations:
- `createCheckout()` - Create Stripe checkout session
- `checkSubscription()` - Check subscription status
- `getCustomerPortal()` - Get Stripe customer portal URL
- `createServiceSubscription()` - Create subscription for a service
- `verifyServiceSubscription()` - Verify service subscription
- `checkExpiredTrials()` - Check and handle expired trials
- `getSubscriptionByUserId()` - Get subscription by user ID
- `updateSubscription()` - Update subscription details

## Usage Examples

### Authentication
```typescript
import { authService } from '@/services';

// Sign up
const { user, error } = await authService.signUp({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
});

// Sign in
const { user, error } = await authService.signIn({
  email: 'user@example.com',
  password: 'password123'
});

// Get current user
const { user, error } = await authService.getCurrentUser();
```

### Database Operations
```typescript
import { dbService } from '@/services';

// Get user profile
const { data: profile, error } = await dbService.getProfile(userId);

// Create a service
const { data: service, error } = await dbService.createService({
  user_id: userId,
  service_name: 'My Service',
  category: 'professional',
  description: 'A great service',
  // ... other fields
});

// Get services with filters
const { data: services, error } = await dbService.getServices({
  userId: currentUserId,
  status: 'active'
});
```

### Storage Operations
```typescript
import { storageService } from '@/services';

// Upload service photo
const { url, error } = await storageService.uploadServicePhoto(userId, file);

// Get public URL
const publicUrl = storageService.getPublicUrl('avatars', 'path/to/file.jpg');

// Delete file
const { error } = await storageService.deleteFile('avatars', 'path/to/file.jpg');
```

### Subscription Operations
```typescript
import { subscriptionService } from '@/services';

// Create checkout session
const { data, error } = await subscriptionService.createCheckout();

// Check subscription status
const { data, error } = await subscriptionService.checkSubscription();

// Get customer portal URL
const { data, error } = await subscriptionService.getCustomerPortal();
```

## Migration Guide

When migrating to a different backend (e.g., Firebase), you only need to:

1. Update the implementation inside each service file
2. Keep the same function signatures and return types
3. No changes needed in your React components

Example:
```typescript
// Current implementation (Lovable Cloud/Supabase)
export const authService = {
  async signIn({ email, password }: SignInParams) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, session: data.session, error };
  },
  // ...
};

// Future Firebase implementation
export const authService = {
  async signIn({ email, password }: SignInParams) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { 
      user: userCredential.user, 
      session: null, // Firebase doesn't use sessions 
      error: null 
    };
  },
  // ...
};
```

## Best Practices

1. **Always use services**: Never import `supabase` directly in components. Use the service layer instead.

2. **Error handling**: Services return `{ data, error }` pattern. Always check for errors in components.

3. **Type safety**: Services are fully typed. Use TypeScript to catch issues early.

4. **Keep services focused**: Each service handles one aspect of the backend (auth, db, storage, etc).

5. **Add new operations here**: When you need new backend functionality, add it to the appropriate service file.

## Files Updated

The following files have been refactored to use the service layer:
- `src/contexts/AuthContext.tsx` - Now uses `authService`, `dbService`, `storageService`, and `subscriptionService`

More files will be migrated progressively as needed.
