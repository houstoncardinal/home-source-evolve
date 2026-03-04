import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, customerEmail, orderNumber, items, total, shippingAddress } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log the notification
    const { error } = await supabase.from("order_notifications").insert({
      order_id: orderId,
      customer_email: customerEmail,
      notification_type: "order_confirmation",
      status: "logged",
      metadata: {
        order_number: orderNumber,
        items_count: items?.length || 0,
        total,
        shipping_address: shippingAddress,
        timestamp: new Date().toISOString(),
      },
    });

    if (error) throw error;

    // NOTE: To send actual emails, integrate a transactional email provider
    // (e.g., Resend, SendGrid) and add their API key as a secret.
    // For now, notifications are logged for admin review.

    return new Response(
      JSON.stringify({ success: true, message: "Order notification logged" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Notification error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
