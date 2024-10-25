import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { lessonId } = await req.json();
    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get("Authorization")!.replace("Bearer ", ""),
    );

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check if the user has purchased the lesson
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("tutorial_id", lessonId)
      .single();

    if (purchaseError || !purchase) {
      throw new Error("User has not purchased this lesson");
    }

    // Fetch the lesson to get the Vimeo video ID
    const { data: lesson, error: lessonError } = await supabase
      .from("tutorials")
      .select("vimeo_video_id")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      throw new Error("Lesson not found");
    }

    // Generate a Vimeo private video URL
    const videoUrl = await getVimeoPrivateVideoUrl(lesson.vimeo_video_id);

    return new Response(
      JSON.stringify({ videoUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function getVimeoPrivateVideoUrl(videoId: string): Promise<string> {
  const vimeoAccessToken = Deno.env.get("VIMEO_ACCESS_TOKEN");
  const response = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
    headers: {
      "Authorization": `bearer ${vimeoAccessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Vimeo video data");
  }

  const data = await response.json();
  return data.player_embed_url;
}
