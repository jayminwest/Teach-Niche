// server.js
require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js"); // Updated import

// Use service role key for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Ensure this is the service role key
);
const app = express();
app.use(express.json());

/**
 * Registers a new user with email and password.
 */
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ user });
});

/**
 * Logs in a user with email and password.
 */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { user, error } = await supabase.auth.signIn({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ user });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
