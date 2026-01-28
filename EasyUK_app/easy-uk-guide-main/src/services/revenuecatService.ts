// RevenueCat API keys (public keys are safe to include in client code)
const REVENUECAT_IOS_API_KEY = 'appl_YOUR_IOS_API_KEY'; // Replace with actual iOS key
const REVENUECAT_ANDROID_API_KEY = 'goog_YOUR_ANDROID_API_KEY'; // Replace with actual Android key

// Entitlement identifiers matching RevenueCat dashboard
export const ENTITLEMENT_IDS = {
  ADS: 'ads',
  TOP_SERVICE: 'top_service',
  PREMIUM: 'premium',
} as const;

// Package identifiers matching RevenueCat dashboard offerings
export const PACKAGE_IDS = {
  ADS: 'ads_monthly',
  TOP_SERVICE: 'top_service_monthly',
  PREMIUM: 'premium_yearly',
} as const;

export type EntitlementType = 'ads' | 'topService' | 'premium';

export interface EntitlementStatus {
  ads: { active: boolean; expiresAt: string | null };
  topService: { active: boolean; expiresAt: string | null };
  premium: { active: boolean; expiresAt: string | null };
}

// Lazy-loaded modules
let CapacitorModule: any = null;
let PurchasesModule: any = null;
let LOG_LEVEL_VALUE: any = null;

const loadCapacitor = async () => {
  if (CapacitorModule) return CapacitorModule;
  try {
    const module = await import('@capacitor/core');
    CapacitorModule = module.Capacitor;
    return CapacitorModule;
  } catch {
    return { isNativePlatform: () => false, getPlatform: () => 'web' };
  }
};

const loadPurchases = async () => {
  if (PurchasesModule) return PurchasesModule;
  try {
    const module = await import('@revenuecat/purchases-capacitor');
    PurchasesModule = module.Purchases;
    LOG_LEVEL_VALUE = module.LOG_LEVEL;
    return PurchasesModule;
  } catch {
    return null;
  }
};

const isNativePlatform = () => {
  try {
    const Capacitor = (window as any).Capacitor;
    return Capacitor?.isNativePlatform?.() ?? false;
  } catch {
    return false;
  }
};

const getPlatform = () => {
  try {
    const Capacitor = (window as any).Capacitor;
    return Capacitor?.getPlatform?.() ?? 'web';
  } catch {
    return 'web';
  }
};

/**
 * RevenueCat Service
 * Handles in-app purchases and entitlement checking via RevenueCat
 */
export const revenuecatService = {
  _initialized: false,

  /**
   * Initialize RevenueCat SDK
   * Should be called on app start
   */
  async initialize(): Promise<boolean> {
    if (this._initialized) {
      console.log('[RevenueCat] Already initialized');
      return true;
    }

    // Only initialize on native platforms
    if (!isNativePlatform()) {
      console.log('[RevenueCat] Not a native platform, skipping initialization');
      return false;
    }

    try {
      const Purchases = await loadPurchases();
      if (!Purchases) {
        console.log('[RevenueCat] Purchases module not available');
        return false;
      }

      const platform = getPlatform();
      const apiKey = platform === 'ios' ? REVENUECAT_IOS_API_KEY : REVENUECAT_ANDROID_API_KEY;

      if (LOG_LEVEL_VALUE) {
        await Purchases.setLogLevel({ level: LOG_LEVEL_VALUE.DEBUG });
      }
      
      await Purchases.configure({ apiKey });

      this._initialized = true;
      console.log('[RevenueCat] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[RevenueCat] Initialization failed:', error);
      return false;
    }
  },

  /**
   * Log in user to RevenueCat
   * Should be called after Supabase authentication
   */
  async logIn(supabaseUserId: string): Promise<any | null> {
    if (!isNativePlatform()) {
      console.log('[RevenueCat] Not a native platform, skipping login');
      return null;
    }

    if (!this._initialized) {
      await this.initialize();
    }

    try {
      const Purchases = await loadPurchases();
      if (!Purchases) return null;

      const result = await Purchases.logIn({ appUserID: supabaseUserId });
      console.log('[RevenueCat] User logged in:', supabaseUserId);
      return result.customerInfo;
    } catch (error) {
      console.error('[RevenueCat] Login failed:', error);
      return null;
    }
  },

  /**
   * Log out user from RevenueCat
   * Should be called on Supabase logout
   */
  async logOut(): Promise<void> {
    if (!isNativePlatform()) {
      console.log('[RevenueCat] Not a native platform, skipping logout');
      return;
    }

    try {
      const Purchases = await loadPurchases();
      if (!Purchases) return;

      await Purchases.logOut();
      console.log('[RevenueCat] User logged out');
    } catch (error) {
      console.error('[RevenueCat] Logout failed:', error);
    }
  },

  /**
   * Get customer info including entitlements
   */
  async getCustomerInfo(): Promise<any | null> {
    if (!isNativePlatform()) {
      console.log('[RevenueCat] Not a native platform');
      return null;
    }

    try {
      const Purchases = await loadPurchases();
      if (!Purchases) return null;

      const result = await Purchases.getCustomerInfo();
      return result.customerInfo;
    } catch (error) {
      console.error('[RevenueCat] Failed to get customer info:', error);
      return null;
    }
  },

  /**
   * Check if a specific entitlement is active
   */
  async isEntitlementActive(entitlementId: string): Promise<boolean> {
    const customerInfo = await this.getCustomerInfo();
    if (!customerInfo) return false;

    const entitlement = customerInfo.entitlements?.active?.[entitlementId];
    return !!entitlement && entitlement.isActive;
  },

  /**
   * Get all active entitlements status
   */
  async getEntitlementStatus(): Promise<EntitlementStatus> {
    const defaultStatus: EntitlementStatus = {
      ads: { active: false, expiresAt: null },
      topService: { active: false, expiresAt: null },
      premium: { active: false, expiresAt: null },
    };

    if (!isNativePlatform()) {
      return defaultStatus;
    }

    try {
      const customerInfo = await this.getCustomerInfo();
      if (!customerInfo) return defaultStatus;

      const activeEntitlements = customerInfo.entitlements?.active || {};

      const getEntitlementInfo = (id: string): { active: boolean; expiresAt: string | null } => {
        const entitlement = activeEntitlements[id];
        return {
          active: !!entitlement?.isActive,
          expiresAt: entitlement?.expirationDate || null,
        };
      };

      return {
        ads: getEntitlementInfo(ENTITLEMENT_IDS.ADS),
        topService: getEntitlementInfo(ENTITLEMENT_IDS.TOP_SERVICE),
        premium: getEntitlementInfo(ENTITLEMENT_IDS.PREMIUM),
      };
    } catch (error) {
      console.error('[RevenueCat] Failed to get entitlement status:', error);
      return defaultStatus;
    }
  },

  /**
   * Get available offerings (products)
   */
  async getOfferings(): Promise<any | null> {
    if (!isNativePlatform()) {
      console.log('[RevenueCat] Not a native platform');
      return null;
    }

    try {
      const Purchases = await loadPurchases();
      if (!Purchases) return null;

      const result = await Purchases.getOfferings();
      return result.offerings || result;
    } catch (error) {
      console.error('[RevenueCat] Failed to get offerings:', error);
      return null;
    }
  },

  /**
   * Purchase a package
   */
  async purchasePackage(packageToPurchase: any): Promise<any | null> {
    if (!isNativePlatform()) {
      console.log('[RevenueCat] Not a native platform');
      return null;
    }

    try {
      const Purchases = await loadPurchases();
      if (!Purchases) return null;

      const result = await Purchases.purchasePackage({ aPackage: packageToPurchase });
      console.log('[RevenueCat] Purchase successful');
      return result.customerInfo;
    } catch (error: any) {
      if (error.code === 'PURCHASE_CANCELLED_ERROR') {
        console.log('[RevenueCat] Purchase cancelled by user');
      } else {
        console.error('[RevenueCat] Purchase failed:', error);
      }
      throw error;
    }
  },

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<any | null> {
    if (!isNativePlatform()) {
      console.log('[RevenueCat] Not a native platform');
      return null;
    }

    try {
      const Purchases = await loadPurchases();
      if (!Purchases) return null;

      const result = await Purchases.restorePurchases();
      console.log('[RevenueCat] Purchases restored');
      return result.customerInfo;
    } catch (error) {
      console.error('[RevenueCat] Restore failed:', error);
      return null;
    }
  },

  /**
   * Purchase a specific entitlement by finding the matching package
   */
  async purchaseEntitlement(entitlementType: 'ads' | 'topService' | 'premium'): Promise<{ success: boolean; customerInfo: any | null; error?: string }> {
    if (!isNativePlatform()) {
      return { success: false, customerInfo: null, error: 'NOT_NATIVE' };
    }

    try {
      const offerings = await this.getOfferings();
      if (!offerings?.current) {
        return { success: false, customerInfo: null, error: 'NO_OFFERINGS' };
      }

      // Map entitlement type to package identifier
      const packageIdMap: Record<string, string> = {
        ads: PACKAGE_IDS.ADS,
        topService: PACKAGE_IDS.TOP_SERVICE,
        premium: PACKAGE_IDS.PREMIUM,
      };

      const targetPackageId = packageIdMap[entitlementType];
      const packages = offerings.current.availablePackages || [];
      
      // Find the package by identifier
      const targetPackage = packages.find((pkg: any) => 
        pkg.identifier === targetPackageId || 
        pkg.packageType === targetPackageId
      );

      if (!targetPackage) {
        console.error('[RevenueCat] Package not found:', targetPackageId, 'Available:', packages.map((p: any) => p.identifier));
        return { success: false, customerInfo: null, error: 'PACKAGE_NOT_FOUND' };
      }

      const customerInfo = await this.purchasePackage(targetPackage);
      return { success: true, customerInfo };
    } catch (error: any) {
      if (error.code === 'PURCHASE_CANCELLED_ERROR' || error.message?.includes('cancelled')) {
        return { success: false, customerInfo: null, error: 'CANCELLED' };
      }
      console.error('[RevenueCat] Purchase entitlement error:', error);
      return { success: false, customerInfo: null, error: error.message || 'PURCHASE_ERROR' };
    }
  },

  /**
   * Check if running on native platform
   */
  isNativePlatform(): boolean {
    return isNativePlatform();
  },
};
