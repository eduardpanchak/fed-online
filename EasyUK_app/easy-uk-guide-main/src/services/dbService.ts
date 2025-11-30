import { supabase } from "@/integrations/supabase/client";

/**
 * Database Service
 * Wraps all database operations to enable easy backend migration
 */
export const dbService = {
  // ============ PROFILES ============
  
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    return { data, error };
  },

  async createProfile(profile: any) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    return { data, error };
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  },

  // ============ SERVICES ============
  
  async getServices(filters?: { userId?: string; status?: string }) {
    let query = supabase.from('services').select('*');

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    return { data, error };
  },

  async getService(serviceId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .maybeSingle();

    return { data, error };
  },

  async createService(service: any) {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    return { data, error };
  },

  async updateService(serviceId: string, updates: any) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();

    return { data, error };
  },

  async deleteService(serviceId: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    return { error };
  },

  // ============ SUBSCRIPTIONS ============
  
  async getSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return { data, error };
  },

  async createSubscription(subscription: any) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();

    return { data, error };
  },

  async updateSubscription(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  },

  // ============ SAVED ITEMS ============
  
  async getSavedItems(userId: string) {
    const { data, error } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async addSavedItem(savedItem: any) {
    const { data, error } = await supabase
      .from('saved_items')
      .insert(savedItem)
      .select()
      .single();

    return { data, error };
  },

  async removeSavedItem(itemId: string) {
    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('id', itemId);

    return { error };
  },

  async isSaved(userId: string, itemId: string, itemType: string) {
    const { data, error } = await supabase
      .from('saved_items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .maybeSingle();

    return { exists: !!data, data, error };
  },

  // ============ SERVICE REVIEWS ============
  
  async getServiceReviews(serviceId: string) {
    const { data, error } = await supabase
      .from('service_reviews')
      .select('*')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async createReview(review: any) {
    const { data, error } = await supabase
      .from('service_reviews')
      .insert(review)
      .select()
      .single();

    return { data, error };
  },

  async updateReview(reviewId: string, updates: any) {
    const { data, error } = await supabase
      .from('service_reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    return { data, error };
  },

  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from('service_reviews')
      .delete()
      .eq('id', reviewId);

    return { error };
  },

  // ============ USER SETTINGS ============
  
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return { data, error };
  },

  async updateUserSettings(userId: string, settings: any) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  },

  // ============ BUSINESS PROFILES ============
  
  async getBusinessProfile(userId: string) {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return { data, error };
  },

  async createBusinessProfile(profile: any) {
    const { data, error } = await supabase
      .from('business_profiles')
      .insert(profile)
      .select()
      .single();

    return { data, error };
  },

  async updateBusinessProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('business_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  },

  // ============ FEEDBACK ============
  
  async submitFeedback(feedback: any) {
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedback)
      .select()
      .single();

    return { data, error };
  },

  // ============ CHECKLIST PROGRESS ============
  
  async getChecklistProgress(userId: string) {
    const { data, error } = await supabase
      .from('checklist_progress')
      .select('*')
      .eq('user_id', userId);

    return { data, error };
  },

  async updateChecklistProgress(userId: string, checklistId: string, completed: boolean) {
    const { data, error } = await supabase
      .from('checklist_progress')
      .upsert({
        user_id: userId,
        checklist_id: checklistId,
        completed,
      })
      .select()
      .single();

    return { data, error };
  },
};
