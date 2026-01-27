import { supabase } from "@/integrations/supabase/client";

export interface Advertisement {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'photo' | 'video';
  target_url: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'payment_required';
  impressions: number;
  clicks: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
  category?: string;
  languages?: string[];
  country?: string;
  city?: string;
  postcode?: string;
  address?: string | null;
  paid_until?: string;
  latitude?: number | null;
  longitude?: number | null;
  is_trial?: boolean;
  trial_started_at?: string | null;
  trial_ended_at?: string | null;
}

export interface AdLocationData {
  category: string;
  languages: string[];
  country: string;
  city: string;
  postcode: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}



// Validation constants
export const AD_VALIDATION = {
  photo: {
    maxSize: 5 * 1500 * 500, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    aspectRatio: 3 / 1,
    aspectRatioTolerance: 0.05,
  },
  video: {
    maxSize: 10 * 1500 * 500, // 10MB
    maxDuration: 7, // seconds
    allowedTypes: ['video/mp4', 'video/webm'],
    aspectRatio: 3 / 1,
    aspectRatioTolerance: 0.07,
  },
};

export const advertisingService = {
  /**
   * Get all active ads for the feed
   */
  async getActiveAds(): Promise<{ data: Advertisement[] | null; error: any }> {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
    //   .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    return { data: data as Advertisement[] | null, error };
  },

  /**
   * Get active ads filtered by category
   */
  async getActiveAdsByCategory(category: string): Promise<{ data: Advertisement[] | null; error: any }> {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
    //   .eq('status', 'active')
      .eq('category', category)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    return { data: data as Advertisement[] | null, error };
  },

  /**
   * Get active ads filtered by location (postcode prefix match)
   */
  async getActiveAdsByLocation(postcode: string): Promise<{ data: Advertisement[] | null; error: any }> {
    const postcodePrefix = postcode.split(' ')[0].toUpperCase();
    
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
    //   .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .ilike('postcode', `${postcodePrefix}%`)
      .order('created_at', { ascending: false });

    return { data: data as Advertisement[] | null, error };
  },

  /**
   * Get user's advertisements
   */
  async getUserAds(userId: string): Promise<{ data: Advertisement[] | null; error: any }> {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data: data as Advertisement[] | null, error };
  },

  /**
   * Get user's trial and entitlement status
   */
  async getTrialStatus(): Promise<{ 
    hasUsedTrial: boolean; 
    trialEndsAt: string | null;
    entitlementActive: boolean;
    entitlementExpiresAt: string | null;
    error: any 
  }> {
    const { data, error } = await supabase.rpc('get_ad_trial_status');
    
    if (error || !data) {
      return { 
        hasUsedTrial: false, 
        trialEndsAt: null, 
        entitlementActive: false,
        entitlementExpiresAt: null,
        error 
      };
    }
    
    const result = data as {
      has_used_trial: boolean;
      trial_ended_at: string | null;
      entitlement_active: boolean;
      entitlement_expires_at: string | null;
    };
    
    return { 
      hasUsedTrial: result.has_used_trial || false, 
      trialEndsAt: result.trial_ended_at,
      entitlementActive: result.entitlement_active || false,
      entitlementExpiresAt: result.entitlement_expires_at,
      error: null 
    };
  },

  /**
   * Publish a new advertisement using secure RPC (enforces trial rules server-side)
   * - First ad with request_trial=true: 14-day trial, status='active'
   * - Subsequent ads or request_trial=false: requires paid entitlement
   */
  async publishAd(
    mediaUrl: string,
    mediaType: 'photo' | 'video',
    targetUrl: string,
    requestTrial: boolean,
    locationData?: AdLocationData
  ): Promise<{ 
    success: boolean; 
    adId?: string; 
    isTrial?: boolean;
    trialEndsAt?: string;
    paidUntil?: string;
    error?: string;
    errorCode?: string;
  }> {
    const { data, error } = await supabase.rpc('publish_ad', {
      p_media_url: mediaUrl,
      p_media_type: mediaType,
      p_target_url: targetUrl,
      p_request_trial: requestTrial,
      p_category: locationData?.category || null,
      p_languages: locationData?.languages || ['en'],
      p_country: locationData?.country || null,
      p_city: locationData?.city || null,
      p_postcode: locationData?.postcode || null,
      p_address: locationData?.address || null,
      p_latitude: locationData?.latitude ?? null,
      p_longitude: locationData?.longitude ?? null,
    });

    if (error) {
      return { success: false, error: error.message, errorCode: 'RPC_ERROR' };
    }

    const result = data as {
      success: boolean;
      ad_id?: string;
      is_trial?: boolean;
      trial_ends_at?: string;
      paid_until?: string;
      error?: string;
      message?: string;
    };

    if (!result.success) {
      return { 
        success: false, 
        error: result.message || 'Failed to publish ad',
        errorCode: result.error
      };
    }

    return { 
      success: true,
      adId: result.ad_id,
      isTrial: result.is_trial,
      trialEndsAt: result.trial_ends_at,
      paidUntil: result.paid_until
    };
  },

  /**
   * @deprecated Use publishAd instead - this is kept for backwards compatibility
   */
  async createAd(
    userId: string,
    mediaUrl: string,
    mediaType: 'photo' | 'video',
    targetUrl: string,
    durationDays: number = 7,
    locationData?: AdLocationData
  ): Promise<{ data: { id: string } | null; error: any; requiresPayment?: boolean }> {
    // Use the new publishAd with trial request
    const result = await this.publishAd(mediaUrl, mediaType, targetUrl, true, locationData);
    
    if (!result.success) {
      // If trial already used, indicate payment required
      if (result.errorCode === 'TRIAL_ALREADY_USED' || result.errorCode === 'PAYMENT_REQUIRED') {
        return { data: null, error: null, requiresPayment: true };
      }
      return { data: null, error: new Error(result.error || 'Failed to create ad') };
    }

    return { 
      data: result.adId ? { id: result.adId } : null, 
      error: null,
      requiresPayment: false
    };
  },

  /**
   * Activate an advertisement (after payment)
   */
  async activateAd(adId: string): Promise<{ data: Advertisement | null; error: any }> {
    const { data, error } = await supabase
      .from('advertisements')
      .update({ status: 'active' })
      .eq('id', adId)
      .select()
      .single();

    return { data: data as Advertisement | null, error };
  },

  /**
   * Renew an advertisement
   */
  async renewAd(adId: string, durationDays: number = 30): Promise<{ data: Advertisement | null; error: any }> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const { data, error } = await supabase
      .from('advertisements')
      .update({ 
        status: 'active',
        expires_at: expiresAt.toISOString(),
        paid_until: expiresAt.toISOString(),
      })
      .eq('id', adId)
      .select()
      .single();

    return { data: data as Advertisement | null, error };
  },

  /**
   * Mark ad as paid and activate using secure RPC
   */
  async markAdAsPaid(adId: string): Promise<{ success: boolean; paidUntil?: string; error: any }> {
    const { data, error } = await supabase.rpc('activate_paid_ad', {
      p_ad_id: adId,
    });

    if (error) {
      return { success: false, error };
    }

    const result = data as { success: boolean; paid_until?: string; error?: string };
    
    if (!result.success) {
      return { success: false, error: new Error(result.error || 'Failed to activate ad') };
    }

    return { success: true, paidUntil: result.paid_until, error: null };
  },

  /* Delete an advertisment
  */
  async deleteAd(adId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', adId);

    return { error };
  },

  /**
   * Upload ad media to storage
   */
  async uploadAdMedia(
    userId: string,
    file: File
  ): Promise<{ url: string | null; error: any }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('advertisements')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    const { data: urlData } = supabase.storage
      .from('advertisements')
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl, error: null };
  },

  /**
   * Delete ad media from storage
   */
  async deleteAdMedia(mediaUrl: string): Promise<{ error: any }> {
    const path = mediaUrl.split('/advertisements/')[1];
    if (!path) return { error: null };

    const { error } = await supabase.storage
      .from('advertisements')
      .remove([path]);

    return { error };
  },

  /**
   * Validate image file
   */
  validateImage(file: File): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const { photo } = AD_VALIDATION;

      // Check file type
      if (!photo.allowedTypes.includes(file.type)) {
        resolve({ valid: false, error: 'ads.invalidPhotoType' });
        return;
      }

      // Check file size
      if (file.size > photo.maxSize) {
        resolve({ valid: false, error: 'ads.photoTooLarge' });
        return;
      }

      // Check aspect ratio
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const targetRatio = photo.aspectRatio;
        const tolerance = photo.aspectRatioTolerance;

        if (Math.abs(aspectRatio - targetRatio) > tolerance) {
          resolve({ valid: false, error: 'ads.invalidAspectRatio' });
        } else {
          resolve({ valid: true });
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({ valid: false, error: 'ads.invalidImage' });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Validate video file
   */
  validateVideo(file: File): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const { video } = AD_VALIDATION;

      // Check file type
      if (!video.allowedTypes.includes(file.type)) {
        resolve({ valid: false, error: 'ads.invalidVideoType' });
        return;
      }

      // Check file size
      if (file.size > video.maxSize) {
        resolve({ valid: false, error: 'ads.videoTooLarge' });
        return;
      }

      // Check duration and aspect ratio
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.onloadedmetadata = () => {
        // Check duration
        if (vid.duration > video.maxDuration) {
          resolve({ valid: false, error: 'ads.videoTooLong' });
          URL.revokeObjectURL(vid.src);
          return;
        }

        // Check aspect ratio
        const aspectRatio = vid.videoWidth / vid.videoHeight;
        const targetRatio = video.aspectRatio;
        const tolerance = video.aspectRatioTolerance;

        if (Math.abs(aspectRatio - targetRatio) > tolerance) {
          resolve({ valid: false, error: 'ads.invalidAspectRatio' });
        } else {
          resolve({ valid: true });
        }
        URL.revokeObjectURL(vid.src);
      };
      vid.onerror = () => {
        resolve({ valid: false, error: 'ads.invalidVideo' });
        URL.revokeObjectURL(vid.src);
      };
      vid.src = URL.createObjectURL(file);
    });
  },
};