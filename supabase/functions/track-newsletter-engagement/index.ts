import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const trackingId = url.searchParams.get('tid');
    const articleId = url.searchParams.get('aid');
    const section = url.searchParams.get('section');
    const action = url.searchParams.get('action');

    if (!trackingId) {
      throw new Error('Tracking ID required');
    }

    // Find the newsletter send record
    const { data: send } = await supabase
      .from('newsletter_sends')
      .select('*')
      .eq('id', trackingId)
      .single();

    if (!send) {
      console.warn(`Send record not found for tracking ID: ${trackingId}`);
    }

    // Handle different actions
    if (action === 'unsubscribe') {
      if (send) {
        await supabase
          .from('newsletter_subscribers')
          .update({ unsubscribed_at: new Date().toISOString() })
          .eq('id', send.subscriber_id);

        await supabase
          .from('newsletter_sends')
          .update({ unsubscribed_at: new Date().toISOString() })
          .eq('id', trackingId);
      }

      return new Response(
        `<html><body><h1>You've been unsubscribed</h1><p>Sorry to see you go!</p></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Track opening (via tracking pixel)
    if (!articleId && send && !send.opened_at) {
      console.log(`Tracking newsletter open for ${trackingId}`);
      
      await supabase
        .from('newsletter_sends')
        .update({ opened_at: new Date().toISOString() })
        .eq('id', trackingId);

      // Award points for opening (+5 points)
      if (send.subscriber_id) {
        const { data: subscriber } = await supabase
          .from('newsletter_subscribers')
          .select('*')
          .eq('id', send.subscriber_id)
          .single();

        if (subscriber) {
          await supabase
            .from('newsletter_subscribers')
            .update({
              points_earned: (subscriber.points_earned || 0) + 5,
              total_opens: (subscriber.total_opens || 0) + 1,
            })
            .eq('id', send.subscriber_id);

          // Also update user_stats if they're a registered user
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', subscriber.email)
            .single();

          if (profile) {
            await supabase.rpc('award_points', {
              _user_id: profile.id,
              _points: 5,
            });
          }
        }
      }

      // Return tracking pixel
      const pixel = new Uint8Array([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
        0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
      ]);

      return new Response(pixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Track article click
    if (articleId && send) {
      console.log(`Tracking article click: ${articleId} from section: ${section}`);

      if (!send.clicked_at) {
        await supabase
          .from('newsletter_sends')
          .update({
            clicked_at: new Date().toISOString(),
            clicked_sections: [section],
          })
          .eq('id', trackingId);
      } else {
        const sections = send.clicked_sections || [];
        if (!sections.includes(section)) {
          sections.push(section);
          await supabase
            .from('newsletter_sends')
            .update({ clicked_sections: sections })
            .eq('id', trackingId);
        }
      }

      // Award points for clicking (+2 points per article)
      if (send.subscriber_id) {
        const { data: subscriber } = await supabase
          .from('newsletter_subscribers')
          .select('*')
          .eq('id', send.subscriber_id)
          .single();

        if (subscriber) {
          await supabase
            .from('newsletter_subscribers')
            .update({
              points_earned: (subscriber.points_earned || 0) + 2,
              total_clicks: (subscriber.total_clicks || 0) + 1,
            })
            .eq('id', send.subscriber_id);

          // Check for bonus points (3+ clicks)
          const totalClicks = (send.clicked_sections?.length || 0) + 1;
          if (totalClicks === 3) {
            await supabase
              .from('newsletter_subscribers')
              .update({
                points_earned: (subscriber.points_earned || 0) + 10, // +10 bonus
              })
              .eq('id', send.subscriber_id);
          }

          // Update user_stats if registered user
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', subscriber.email)
            .single();

          if (profile) {
            let points = 2;
            if (totalClicks === 3) points += 10; // bonus

            await supabase.rpc('award_points', {
              _user_id: profile.id,
              _points: points,
            });
          }
        }
      }

      // Redirect to article
      return Response.redirect(`${supabaseUrl}/article/${articleId}`, 302);
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('Error tracking engagement:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
