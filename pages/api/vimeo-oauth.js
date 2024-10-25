import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing authorization header" });
  }

  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const { data, error } = await supabase.functions.invoke("vimeo-oauth", {
      body: JSON.stringify({ user_id }),
      headers: {
        Authorization: authHeader,
      },
    });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("Error invoking Vimeo OAuth function:", error);
    res.status(500).json({ error: "Failed to start Vimeo OAuth process" });
  }
}
