import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SERVICE-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Stripe price IDs for service subscriptions
const SUBSCRIPTION_PRICES = {
  standard: "price_1SWH4LCrmDMqUoI5uJd6C7jo", // £1.99/month
  top: "price_1SWH4bCrmDMqUoI5NGzRQzcv", // £4.99/month
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get request body
    const { serviceId, tier } = await req.json();
    
    if (!serviceId || !tier) {
      throw new Error("serviceId and tier are required");
    }

    if (tier !== 'standard' && tier !== 'top') {
      throw new Error("Invalid tier. Must be 'standard' or 'top'");
    }

    logStep("Request validated", { serviceId, tier });

    // Verify service belongs to user
    const { data: service, error: serviceError } = await supabaseClient
      .from('services')
      .select('id, user_id, service_name')
      .eq('id', serviceId)
      .eq('user_id', user.id)
      .single();

    if (serviceError || !service) {
      throw new Error("Service not found or unauthorized");
    }

    logStep("Service verified", { serviceId: service.id, serviceName: service.service_name });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    // Create checkout session
    const priceId = SUBSCRIPTION_PRICES[tier as keyof typeof SUBSCRIPTION_PRICES];
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/my-services?subscription=success&service=${serviceId}`,
      cancel_url: `${req.headers.get("origin")}/my-services?subscription=cancelled`,
      metadata: {
        service_id: serviceId,
        user_id: user.id,
        tier: tier,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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
