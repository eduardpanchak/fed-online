import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-EXPIRED-TRIALS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Validate env vars early
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      const missing = [
        !SUPABASE_URL ? "SUPABASE_URL" : null,
        !SUPABASE_SERVICE_ROLE_KEY ? "SUPABASE_SERVICE_ROLE_KEY" : null
      ].filter(Boolean);
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }

    // Initialize Supabase client with service role key for admin access
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // Get all services with trial status and expired trial_end date
    const now = new Date().toISOString();
    logStep("Checking for expired trials", { currentTime: now });

    const { data, error: fetchError } = await supabaseAdmin
      .from('services')
      .select('id, user_id, service_name, trial_end, stripe_subscription_id')
      .eq('status', 'trial')
      .lt('trial_end', now);

    if (fetchError) {
      throw new Error(`Error fetching expired trials: ${fetchError.message}`);
    }

    const expiredServices = Array.isArray(data) ? data : [];
    logStep("Found expired trials", { count: expiredServices.length });

    if (expiredServices.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No expired trials found",
        cancelled: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Only cancel entries without an active Stripe subscription id
    const servicesToCancel = expiredServices.filter((s: any) => !s?.stripe_subscription_id);
    logStep("Services to cancel", { count: servicesToCancel.length, ids: servicesToCancel.map(s => s.id) });

    if (servicesToCancel.length > 0) {
      const serviceIds = servicesToCancel.map((s: any) => s.id);
      const { error: updateError } = await supabaseAdmin
        .from('services')
        .update({ status: 'cancelled' })
        .in('id', serviceIds);

      if (updateError) {
        throw new Error(`Error updating services: ${updateError.message}`);
      }
      logStep("Services cancelled", { count: serviceIds.length, serviceIds });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Cancelled ${servicesToCancel.length} expired trial services`,
      cancelled: servicesToCancel.length,
      checked: expiredServices.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-expired-trials", { message: errorMessage });
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
