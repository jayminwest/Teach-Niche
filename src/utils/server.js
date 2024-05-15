// server.js
require('dotenv').config();
const express = require('express');
const supabase = require('@supabase/supabase-js').createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
const app = express();
app.use(express.json());

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ user });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { user, error } = await supabase.auth.signIn({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ user });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
