import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-SERVICE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAdmin.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    logStep("User authenticated", { userId: user.id });

    const { serviceId } = await req.json();
    
    if (!serviceId) {
      throw new Error("serviceId is required");
    }

    // Verify service belongs to user
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('id, user_id, service_name, subscription_tier')
      .eq('id', serviceId)
      .eq('user_id', user.id)
      .single();

    if (serviceError || !service) {
      throw new Error("Service not found or unauthorized");
    }

    logStep("Service found", { serviceId: service.id });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({ 
        success: false,
        message: "No Stripe customer found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Customer found", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 100,
    });

    logStep("Subscriptions found", { count: subscriptions.data.length });

    // Find subscription for this service tier (matching the product)
    const tierPriceIds = {
      standard: "price_1SWH4LCrmDMqUoI5uJd6C7jo",
      top: "price_1SWH4bCrmDMqUoI5NGzRQzcv",
    };

    const expectedPriceId = tierPriceIds[service.subscription_tier as keyof typeof tierPriceIds];
    
    const matchingSubscription = subscriptions.data.find((sub: any) => 
      sub.items.data.some((item: any) => item.price.id === expectedPriceId)
    );

    if (matchingSubscription) {
      logStep("Active subscription found", { subscriptionId: matchingSubscription.id });

      // Update service to active status
      const { error: updateError } = await supabaseAdmin
        .from('services')
        .update({
          status: 'active',
          stripe_subscription_id: matchingSubscription.id,
        })
        .eq('id', serviceId);

      if (updateError) {
        throw new Error(`Failed to update service: ${updateError.message}`);
      }

      logStep("Service updated to active");

      return new Response(JSON.stringify({ 
        success: true,
        status: 'active',
        subscriptionId: matchingSubscription.id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      logStep("No matching subscription found");
      
      return new Response(JSON.stringify({ 
        success: false,
        message: "No active subscription found for this service tier" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
