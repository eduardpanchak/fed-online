import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.72.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REVENUECAT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    // Initialize Supabase with service role for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
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
    
    // Get the Supabase user ID from subscriber attributes or app_user_id
    const supabaseUserId = subscriberAttributes.$supabaseUserId?.value || appUserId;
    
    logStep("Processing event", { eventType, appUserId, supabaseUserId });

    if (!supabaseUserId) {
      logStep("No user ID found");
      return new Response(JSON.stringify({ error: "No user ID" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Determine entitlement status based on event type
    let entitlementActive = false;
    let entitlementExpiresAt: string | null = null;

    // Events that indicate active subscription
    const activeEvents = [
      "INITIAL_PURCHASE",
      "RENEWAL",
      "PRODUCT_CHANGE",
      "UNCANCELLATION",
      "SUBSCRIPTION_EXTENDED",
    ];

    // Events that indicate inactive subscription
    const inactiveEvents = [
      "CANCELLATION",
      "EXPIRATION",
      "BILLING_ISSUE",
      "SUBSCRIPTION_PAUSED",
    ];

    if (activeEvents.includes(eventType)) {
      entitlementActive = true;
      // Use expiration date from event
      if (event.expiration_at_ms) {
        entitlementExpiresAt = new Date(event.expiration_at_ms).toISOString();
      } else if (event.period_end_ms) {
        entitlementExpiresAt = new Date(event.period_end_ms).toISOString();
      } else {
        // Default to 30 days if no expiration provided
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        entitlementExpiresAt = expiresAt.toISOString();
      }
      logStep("Activating entitlement", { entitlementExpiresAt });
    } else if (inactiveEvents.includes(eventType)) {
      entitlementActive = false;
      entitlementExpiresAt = null;
      logStep("Deactivating entitlement");
    } else {
      logStep("Unhandled event type, skipping", { eventType });
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update user entitlement using the RPC function
    const { data, error } = await supabaseAdmin.rpc('update_user_entitlement', {
      p_user_id: supabaseUserId,
      p_active: entitlementActive,
      p_expires_at: entitlementExpiresAt,
      p_revenuecat_customer_id: event.original_app_user_id || appUserId,
    });

    if (error) {
      logStep("Error updating entitlement", { error: error.message });
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    logStep("Entitlement updated successfully", { updated: data });

    // Also expire any trial ads if subscription became inactive
    if (!entitlementActive) {
      await supabaseAdmin.rpc('expire_trial_ads');
      logStep("Expired trial ads check completed");
    }

    return new Response(JSON.stringify({ 
      received: true, 
      entitlementActive,
      entitlementExpiresAt 
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
