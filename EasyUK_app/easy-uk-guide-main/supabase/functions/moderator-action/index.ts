import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[MODERATOR-ACTION] Function started');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create user client to verify the moderator
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('[MODERATOR-ACTION] No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);

    if (authError || !user) {
      console.log('[MODERATOR-ACTION] Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[MODERATOR-ACTION] User authenticated:', user.id);

    // Check if user is a moderator or admin using the has_role function
    const { data: isModerator, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'moderator'
    });

    const { data: isAdmin, error: adminRoleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || adminRoleError) {
      console.log('[MODERATOR-ACTION] Role check error:', roleError?.message || adminRoleError?.message);
      return new Response(
        JSON.stringify({ error: 'Failed to verify role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isModerator && !isAdmin) {
      console.log('[MODERATOR-ACTION] User is not a moderator or admin');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: moderator or admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[MODERATOR-ACTION] User has moderator/admin role');

    // Parse request body
    const { action, serviceId, ownerId, banReason } = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[MODERATOR-ACTION] Action:', action, 'ServiceId:', serviceId, 'OwnerId:', ownerId);

    switch (action) {
      case 'approve': {
        if (!serviceId) {
          return new Response(
            JSON.stringify({ error: 'serviceId is required for approve action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Reset reports_count and set moderation_status to active
        const { error: updateError } = await supabaseAdmin
          .from('services')
          .update({
            reports_count: 0,
            moderation_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId);

        if (updateError) {
          console.log('[MODERATOR-ACTION] Approve error:', updateError.message);
          return new Response(
            JSON.stringify({ error: 'Failed to approve service' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Delete all reports for this service
        const { error: deleteReportsError } = await supabaseAdmin
          .from('service_reports')
          .delete()
          .eq('service_id', serviceId);

        if (deleteReportsError) {
          console.log('[MODERATOR-ACTION] Delete reports error:', deleteReportsError.message);
        }

        console.log('[MODERATOR-ACTION] Service approved:', serviceId);
        return new Response(
          JSON.stringify({ success: true, message: 'Service approved successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        if (!serviceId) {
          return new Response(
            JSON.stringify({ error: 'serviceId is required for delete action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Delete all reports for this service first
        const { error: deleteReportsError } = await supabaseAdmin
          .from('service_reports')
          .delete()
          .eq('service_id', serviceId);

        if (deleteReportsError) {
          console.log('[MODERATOR-ACTION] Delete reports error:', deleteReportsError.message);
        }

        // Delete the service
        const { error: deleteError } = await supabaseAdmin
          .from('services')
          .delete()
          .eq('id', serviceId);

        if (deleteError) {
          console.log('[MODERATOR-ACTION] Delete error:', deleteError.message);
          return new Response(
            JSON.stringify({ error: 'Failed to delete service' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('[MODERATOR-ACTION] Service deleted:', serviceId);
        return new Response(
          JSON.stringify({ success: true, message: 'Service deleted successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'ban_owner': {
        if (!ownerId) {
          return new Response(
            JSON.stringify({ error: 'ownerId is required for ban_owner action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Add owner to bans table
        const { error: banError } = await supabaseAdmin
          .from('owner_bans')
          .insert({
            user_id: ownerId,
            banned_by: user.id,
            reason: banReason || 'Violation of terms of service'
          });

        if (banError) {
          // Check if already banned
          if (banError.code === '23505') {
            return new Response(
              JSON.stringify({ error: 'Owner is already banned' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.log('[MODERATOR-ACTION] Ban error:', banError.message);
          return new Response(
            JSON.stringify({ error: 'Failed to ban owner' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Suspend all services by this owner
        const { error: suspendError } = await supabaseAdmin
          .from('services')
          .update({
            moderation_status: 'suspended',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', ownerId);

        if (suspendError) {
          console.log('[MODERATOR-ACTION] Suspend services error:', suspendError.message);
        }

        console.log('[MODERATOR-ACTION] Owner banned:', ownerId);
        return new Response(
          JSON.stringify({ success: true, message: 'Owner banned successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'suspend': {
        if (!serviceId) {
          return new Response(
            JSON.stringify({ error: 'serviceId is required for suspend action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Set moderation_status to suspended
        const { error: suspendError } = await supabaseAdmin
          .from('services')
          .update({
            moderation_status: 'suspended',
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId);

        if (suspendError) {
          console.log('[MODERATOR-ACTION] Suspend error:', suspendError.message);
          return new Response(
            JSON.stringify({ error: 'Failed to suspend service' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('[MODERATOR-ACTION] Service suspended:', serviceId);
        return new Response(
          JSON.stringify({ success: true, message: 'Service suspended successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[MODERATOR-ACTION] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
