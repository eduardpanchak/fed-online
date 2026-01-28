import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.72.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-revenuecat-webhook-auth-key",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REVENUECAT-WEBHOOK] ${step}${detailsStr}`);
};

// Map RevenueCat entitlement identifiers to our DB fields
const ENTITLEMENT_MAPPING: Record<string, { activeField: string; expiresField: string }> = {
  'ads': { activeField: 'ads_active', expiresField: 'ads_expires_at' },
  'top_service': { activeField: 'top_service_active', expiresField: 'top_service_expires_at' },
  'premium': { activeField: 'premium_active', expiresField: 'premium_expires_at' },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

     // Verify webhook secret
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
    const authHeader = req.headers.get("x-revenuecat-webhook-auth-key") || req.headers.get("authorization");
    
    if (webhookSecret && authHeader) {
      const providedSecret = authHeader.replace("Bearer ", "");
      if (providedSecret !== webhookSecret) {
        logStep("Invalid webhook secret");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
    }

    // Initialize Supabase with service role for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("VITE_SUPABASE_URL") ?? "",
      Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    logStep("Webhook body parsed", { event_type: body.event?.type });

    const event = body.event;
    if (!event) {
      logStep("No event in body");
      return new Response(JSON.stringify({ error: "No event" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const eventType = event.type;
    const appUserId = event.app_user_id;
    const subscriberAttributes = event.subscriber_attributes || {};
    const entitlementIds = event.entitlement_ids || [];
    const productId = event.product_id || '';
    
    // Get the Supabase user ID from subscriber attributes or app_user_id
    const supabaseUserId = subscriberAttributes.$supabaseUserId?.value || appUserId;
    
     logStep("Processing event", { 
      eventType, 
      appUserId, 
      supabaseUserId, 
      entitlementIds,
      productId 
    });

    if (!supabaseUserId) {
      logStep("No user ID found");
      return new Response(JSON.stringify({ error: "No user ID" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Events that indicate active subscription
    const activeEvents = [
      "INITIAL_PURCHASE",
      "RENEWAL",
      "PRODUCT_CHANGE",
      "UNCANCELLATION",
      "SUBSCRIPTION_EXTENDED",
      "NON_RENEWING_PURCHASE",
    ];

    // Events that indicate inactive subscription
    const inactiveEvents = [
      "CANCELLATION",
      "EXPIRATION",
      "BILLING_ISSUE",
      "SUBSCRIPTION_PAUSED",
    ];

   // Determine expiration date
    let expiresAt: string | null = null;
    if (event.expiration_at_ms) {
      expiresAt = new Date(event.expiration_at_ms).toISOString();
    } else if (event.period_end_ms) {
      expiresAt = new Date(event.period_end_ms).toISOString();
    }

    // Build entitlement update parameters
    const updateParams: Record<string, any> = {
      p_user_id: supabaseUserId,
      p_revenuecat_customer_id: event.original_app_user_id || appUserId,
    };

    if (activeEvents.includes(eventType)) {
      // Activate entitlements
      for (const entitlementId of entitlementIds) {
        const mapping = ENTITLEMENT_MAPPING[entitlementId];
        if (mapping) {
          // Convert to snake_case parameter names
          const activeParam = `p_${mapping.activeField}`;
          const expiresParam = `p_${mapping.expiresField}`;
          updateParams[activeParam] = true;
          updateParams[expiresParam] = expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          logStep(`Activating entitlement: ${entitlementId}`, { expiresAt: updateParams[expiresParam] });
        }
      }
    } else if (inactiveEvents.includes(eventType)) {
      // Deactivate entitlements
      for (const entitlementId of entitlementIds) {
        const mapping = ENTITLEMENT_MAPPING[entitlementId];
        if (mapping) {
          const activeParam = `p_${mapping.activeField}`;
          updateParams[activeParam] = false;
          logStep(`Deactivating entitlement: ${entitlementId}`);
        }
      }
    } else {
      logStep("Unhandled event type, skipping", { eventType });
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

   // Update entitlements using the RPC function
    const { data, error } = await supabaseAdmin.rpc('sync_user_entitlements', updateParams);

    if (error) {
      logStep("Error syncing entitlements", { error: error.message });
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    logStep("Entitlements synced successfully", { updated: data });

    // Also update the legacy profiles entitlement fields for backward compatibility
    if (entitlementIds.includes('ads')) {
      const isActive = activeEvents.includes(eventType);
      await supabaseAdmin.rpc('update_user_entitlement', {
        p_user_id: supabaseUserId,
        p_active: isActive,
        p_expires_at: isActive ? expiresAt : null,
        p_revenuecat_customer_id: event.original_app_user_id || appUserId,
      });
      logStep("Legacy profiles entitlement updated");
    }

    // Expire trial ads if subscription became inactive
    if (inactiveEvents.includes(eventType)) {
      await supabaseAdmin.rpc('expire_trial_ads');
      logStep("Expired trial ads check completed");
    }

     return new Response(JSON.stringify({ 
      received: true,
      eventType,
      entitlementsUpdated: entitlementIds,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

