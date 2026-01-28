import { supabase } from "@/integrations/supabase/client";
import { revenuecatService, EntitlementType } from "./revenuecatService";

export interface Entitlements {
  ads: { active: boolean; expiresAt: string | null };
  topService: { active: boolean; expiresAt: string | null };
  premium: { active: boolean; expiresAt: string | null };
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
}

/**
 * Entitlements Service
 * Handles entitlement checking from both RevenueCat (native) and database (web)
 */
export const entitlementsService = {
  /**
   * Get user entitlements from database
   * This is the server source of truth, synced via RevenueCat webhooks
   */
  async getEntitlementsFromDB(): Promise<Entitlements | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_entitlements');
      
      if (error) {
        console.error('[Entitlements] Error fetching from DB:', error);
        return null;
      }

      if (!data) {
        return {
          ads: { active: false, expiresAt: null },
          topService: { active: false, expiresAt: null },
          premium: { active: false, expiresAt: null },
        };
      }

      // Cast data to expected shape
      const entitlementData = data as {
        ads?: { active?: boolean; expires_at?: string | null };
        top_service?: { active?: boolean; expires_at?: string | null };
        premium?: { active?: boolean; expires_at?: string | null };
      };

      // Transform database response to our interface
      return {
        ads: {
          active: entitlementData.ads?.active ?? false,
          expiresAt: entitlementData.ads?.expires_at ?? null,
        },
        topService: {
          active: entitlementData.top_service?.active ?? false,
          expiresAt: entitlementData.top_service?.expires_at ?? null,
        },
        premium: {
          active: entitlementData.premium?.active ?? false,
          expiresAt: entitlementData.premium?.expires_at ?? null,
        },
      };
    } catch (error) {
      console.error('[Entitlements] Error:', error);
      return null;
    }
  },

  /**
   * Get entitlements - prefers RevenueCat on native, falls back to DB
   */
  async getEntitlements(): Promise<Entitlements> {
    const defaultEntitlements: Entitlements = {
      ads: { active: false, expiresAt: null },
      topService: { active: false, expiresAt: null },
      premium: { active: false, expiresAt: null },
    };

    // On native platforms, try RevenueCat first for real-time status
    if (revenuecatService.isNativePlatform()) {
      try {
        const rcStatus = await revenuecatService.getEntitlementStatus();
        if (rcStatus) {
          return rcStatus;
        }
      } catch (error) {
        console.error('[Entitlements] RevenueCat error, falling back to DB:', error);
      }
    }

    // Fall back to database (web or if RevenueCat fails)
    const dbEntitlements = await this.getEntitlementsFromDB();
    return dbEntitlements || defaultEntitlements;
  },

  /**
   * Check if user has active ads entitlement
   */
  async hasAdsEntitlement(): Promise<boolean> {
    const entitlements = await this.getEntitlements();
    return entitlements.ads.active;
  },

  /**
   * Check if user has active top service entitlement
   */
  async hasTopServiceEntitlement(): Promise<boolean> {
    const entitlements = await this.getEntitlements();
    return entitlements.topService.active;
  },

  /**
   * Check if user has active premium entitlement
   */
  async hasPremiumEntitlement(): Promise<boolean> {
    const entitlements = await this.getEntitlements();
    return entitlements.premium.active;
  },

  /**
   * Check ads entitlement server-side (via RPC)
   */
  async checkAdsEntitlementServer(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('has_ads_entitlement');
      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('[Entitlements] Server check error:', error);
      return false;
    }
  },

  /**
   * Check top service entitlement server-side (via RPC)
   */
  async checkTopServiceEntitlementServer(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('has_top_service_entitlement');
      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('[Entitlements] Server check error:', error);
      return false;
    }
  },

  /**
   * Check premium entitlement server-side (via RPC)
   */
  async checkPremiumEntitlementServer(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('has_premium_entitlement');
      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('[Entitlements] Server check error:', error);
      return false;
    }
  },

  /**
   * Check if running on native platform
   */
  isNativeApp(): boolean {
    return revenuecatService.isNativePlatform();
  },

  /**
   * Purchase an entitlement via RevenueCat (native only)
   */
  async purchaseEntitlement(type: EntitlementType): Promise<PurchaseResult> {
    if (!revenuecatService.isNativePlatform()) {
      return { success: false, error: 'NOT_NATIVE' };
    }

    const result = await revenuecatService.purchaseEntitlement(type);
    return { success: result.success, error: result.error };
  },

  /**
   * Restore purchases via RevenueCat (native only)
   */
  async restorePurchases(): Promise<PurchaseResult> {
    if (!revenuecatService.isNativePlatform()) {
      return { success: false, error: 'NOT_NATIVE' };
    }

    const customerInfo = await revenuecatService.restorePurchases();
    return { success: !!customerInfo };
  },
};
