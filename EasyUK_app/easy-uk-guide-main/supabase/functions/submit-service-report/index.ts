import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user client to verify auth
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      console.error('[REPORT] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[REPORT] User authenticated:', user.id);

    // Parse request body
    const { serviceId, reason } = await req.json();
    
    if (!serviceId || !reason) {
      return new Response(
        JSON.stringify({ error: 'Missing serviceId or reason' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[REPORT] Processing report for service:', serviceId);

    // Check if report already exists from this user for this service
    const { data: existingReport, error: checkError } = await supabaseAdmin
      .from('service_reports')
      .select('id')
      .eq('service_id', serviceId)
      .eq('reporter_user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('[REPORT] Error checking existing report:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingReport) {
      console.log('[REPORT] User already reported this service');
      return new Response(
        JSON.stringify({ error: 'You have already reported this service' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the report
    const { error: insertError } = await supabaseAdmin
      .from('service_reports')
      .insert({
        service_id: serviceId,
        reporter_user_id: user.id,
        reason: reason
      });

    if (insertError) {
      console.error('[REPORT] Error inserting report:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[REPORT] Report inserted successfully');

    // Get current service data
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('reports_count, moderation_status')
      .eq('id', serviceId)
      .single();

    if (serviceError) {
      console.error('[REPORT] Error fetching service:', serviceError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newReportsCount = (service.reports_count || 0) + 1;
    console.log('[REPORT] New reports count:', newReportsCount);

    // Determine new moderation status based on thresholds
    let newModerationStatus = service.moderation_status || 'active';
    let flaggedForReview = false;

    if (newReportsCount >= 8) {
      // 8-10+ reports: Automatically suspend
      newModerationStatus = 'suspended';
      console.log('[REPORT] Service suspended due to report threshold');
    } else if (newReportsCount >= 4) {
      // 4-7 reports: Flag for moderator attention (status stays active)
      flaggedForReview = true;
      console.log('[REPORT] Service flagged for moderator review');
    }
    // 1-3 reports: Status remains active, no action needed

    // Update service with new reports_count and potentially new moderation_status
    const { error: updateError } = await supabaseAdmin
      .from('services')
      .update({
        reports_count: newReportsCount,
        moderation_status: newModerationStatus
      })
      .eq('id', serviceId);

    if (updateError) {
      console.error('[REPORT] Error updating service:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update service status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[REPORT] Service updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        reportsCount: newReportsCount,
        moderationStatus: newModerationStatus,
        flaggedForReview
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[REPORT] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
