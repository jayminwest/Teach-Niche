// server.js
require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");

/**
 * Supabase client for server-side operations.
 * Uses the service role key for elevated privileges.
 */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const app = express();
app.use(express.json());

/**
 * Register a new user.
 *
 * @route POST /register
 * @param {Object} req.body
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @returns {Object} User object or error message
 */
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Log in a user.
 *
 * @route POST /login
 * @param {Object} req.body
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @returns {Object} User object or error message
 */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
