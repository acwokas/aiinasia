import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommentNotification {
  comment_id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client first for auth check
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check authentication and admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin"
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin role required" }),
        { status: 403, headers: corsHeaders }
      );
    }

    const { comment_id, article_id, author_name, author_email, content }: CommentNotification = await req.json();
    
    console.log("Processing comment notification:", { comment_id, article_id });

    // Fetch article details
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("title, slug")
      .eq("id", article_id)
      .single();

    if (articleError) {
      console.error("Error fetching article:", articleError);
      throw articleError;
    }

    const articleUrl = `https://${req.headers.get("host")}/article/${article.slug}#comments`;
    const adminUrl = `https://${req.headers.get("host")}/admin#comments`;

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "AI in Asia Comments <onboarding@resend.dev>",
      to: ["contact@aiinasia.com"],
      subject: `New comment pending approval: ${article.title}`,
      html: `
        <h2>New Comment Pending Approval</h2>
        <p><strong>Article:</strong> ${article.title}</p>
        <p><strong>Author:</strong> ${author_name} (${author_email})</p>
        <p><strong>Comment:</strong></p>
        <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #333; margin: 15px 0;">
          ${content}
        </blockquote>
        <p>
          <a href="${articleUrl}" style="display: inline-block; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin-right: 10px;">View on Article</a>
          <a href="${adminUrl}" style="display: inline-block; padding: 10px 20px; background: #333; color: white; text-decoration: none; border-radius: 5px;">Go to Admin Dashboard</a>
        </p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-new-comment function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
