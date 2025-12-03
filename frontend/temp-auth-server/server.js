const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 3002;

// Middleware
app.use(cors({
  origin: true, // Allow any origin for development
  credentials: true
}));
app.use(express.json());

// Supabase Client (Service Role for Admin tasks, or Anon for public)
// Note: For exchanging auth code, we just need the URL and Anon Key usually, 
// but strictly speaking we call the token endpoint.
// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Route: Exchange Code for Session
app.post('/api/auth/google', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Supabase Auth Error:', error);
      return res.status(400).json({ error: error.message });
    }

    const { session, user } = data;

    // In a real app, you would set an HTTP-only cookie here
    // res.cookie('access_token', session.access_token, { httpOnly: true, ... });

    // For this temporary setup, we return the data to frontend
    return res.json({
      message: 'Login successful',
      user: user,
      session: session
    });

  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Helper to get token
const getToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  return authHeader.split(' ')[1];
};

// GET /auth/me - Fetch user profile and settings
app.get('/auth/me', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Return user data merged with metadata for settings
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.firstName,
      lastName: user.user_metadata?.lastName,
      phone: user.user_metadata?.phone,
      notificationSettings: user.user_metadata?.notificationSettings,
      systemSettings: user.user_metadata?.systemSettings,
      communicationSettings: user.user_metadata?.communicationSettings,
      emergencySettings: user.user_metadata?.emergencySettings,
      ...user.user_metadata
    };
    
    return res.json(userData);
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /auth/me - Update user profile and settings
app.put('/auth/me', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    const updates = req.body;
    
    // 2. Update user metadata using Admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { user_metadata: { ...user.user_metadata, ...updates } }
    );
    
    if (error) {
      console.error('Supabase Update Error:', error);
      throw error;
    }
    
    return res.json({ message: 'Settings updated', user: data.user });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Alias for Settings API (GET)
app.get('/api/settings/me', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.firstName,
      lastName: user.user_metadata?.lastName,
      phone: user.user_metadata?.phone,
      notificationSettings: user.user_metadata?.notificationSettings,
      systemSettings: user.user_metadata?.systemSettings,
      communicationSettings: user.user_metadata?.communicationSettings,
      emergencySettings: user.user_metadata?.emergencySettings,
      ...user.user_metadata
    };
    
    return res.json(userData);
  } catch (err) {
    console.error('Error fetching user settings:', err);
    return res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

// Alias for Settings API (PUT)
app.put('/api/settings/me', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    const updates = req.body;
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { user_metadata: { ...user.user_metadata, ...updates } }
    );
    
    if (error) {
      console.error('Supabase Update Error:', error);
      throw error;
    }
    
    return res.json({ message: 'Settings updated', user: data.user });
  } catch (err) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// User Management (Staff)
app.get('/api/users', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // In a real app, check if user is admin
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    // Filter/Map users to return necessary info
    const staffUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.user_metadata?.role || 'staff', // Default to staff if not set
      firstName: u.user_metadata?.firstName,
      lastName: u.user_metadata?.lastName,
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at
    }));

    return res.json(staffUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { email, password, firstName, lastName, role } = req.body;

  try {
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { firstName, lastName, role }
    });

    if (error) throw error;

    return res.status(201).json(user);
  } catch (err) {
    console.error('Error creating user:', err);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;

  try {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;

    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.listen(PORT, () => {
  console.log(`Temp Auth Server running on http://localhost:${PORT}`);
});
