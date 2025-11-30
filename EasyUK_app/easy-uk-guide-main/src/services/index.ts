/**
 * Service Layer Entry Point
 * 
 * This module exports all backend services in a centralized location.
 * All backend operations (auth, database, storage, subscriptions) are abstracted
 * through these service modules to enable easy backend migration in the future.
 * 
 * Usage:
 * import { authService, dbService, storageService, subscriptionService } from '@/services';
 */

export { authService } from './authService';
export { dbService } from './dbService';
export { storageService } from './storageService';
export { subscriptionService } from './subscriptionService';

// Re-export types for convenience
export type { SignUpParams, SignInParams } from './authService';
