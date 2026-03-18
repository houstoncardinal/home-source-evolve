import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, password } = await req.json();

    if (!userId || !email || !password) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      email,
      password,
      email_confirm: true,
      user_metadata: {
        platform_role: "superadmin",
      },
    });

    if (updateError) {
      throw updateError;
    }

    const { error: cleanupError } = await supabase
      .from("user_roles")
      .delete()
      .eq("role", "admin")
      .neq("user_id", userId);

    if (cleanupError) {
      throw cleanupError;
    }

    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert(
        {
          user_id: userId,
          role: "admin",
        },
        { onConflict: "user_id,role" }
      );

    if (roleError) {
      throw roleError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: updatedUser.user?.id,
          email: updatedUser.user?.email,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("admin-user-repair error", error);

    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});