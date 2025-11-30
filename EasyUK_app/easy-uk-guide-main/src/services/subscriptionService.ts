import { supabase } from "@/integrations/supabase/client";

/**
 * Subscription Service
 * Wraps all subscription and payment operations to enable easy backend migration
 */
export const subscriptionService = {
  /**
   * Create checkout session
   */
  async createCheckout() {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {},
    });

    return { data, error };
  },

  /**
   * Check subscription status
   */
  async checkSubscription() {
    const { data, error } = await supabase.functions.invoke('check-subscription', {
      body: {},
    });

    return { data, error };
  },

  /**
   * Get customer portal URL
   */
  async getCustomerPortal() {
    const { data, error } = await supabase.functions.invoke('customer-portal', {
      body: {},
    });

    return { data, error };
  },

  /**
   * Create service subscription
   */
  async createServiceSubscription(serviceId: string, tier: string) {
    const { data, error } = await supabase.functions.invoke('create-service-subscription', {
      body: { serviceId, tier },
    });

    return { data, error };
  },

  /**
   * Verify service subscription
   */
  async verifyServiceSubscription(sessionId: string) {
    const { data, error } = await supabase.functions.invoke('verify-service-subscription', {
      body: { sessionId },
    });

    return { data, error };
  },

  /**
   * Check for expired trials
   */
  async checkExpiredTrials() {
    const { data, error } = await supabase.functions.invoke('check-expired-trials', {
      body: {},
    });

    return { data, error };
  },

  /**
   * Get subscription by user ID
   */
  async getSubscriptionByUserId(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return { data, error };
  },

  /**
   * Update subscription
   */
  async updateSubscription(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  },
};
