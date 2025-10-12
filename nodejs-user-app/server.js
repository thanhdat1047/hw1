const express = require('express');
const path = require('path');
require('dotenv').config();
const db = require('./config/database');
const { time } = require('console');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Start database pool
let dbReady = false;

// Initialize database connection
async function initializeDatabase() {
  try {
    await db.initializePool();
    await db.testConnection();
    dbReady = true;
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    if (!dbReady) {
      console.error('Exiting due to database connection failure.');
      process.exit(1);
    }
  }
}

// Get all users
app.get('/api/users', async (req, res) => {
  dbCheck(req, res);
  console.log('[DEBUG] Received request to /api/users');
  console.log('[DEBUG] Database ready:', dbReady);
  
  if (!dbReady) {
    console.error('[ERROR] Database not ready');
    return res.status(503).json({ error: 'Database not connected' });
  }
  
  try {
    console.log('[DEBUG] Fetching users from database...');
    const users = await db.getUsers();
    console.log('[DEBUG] Users fetched:', users.length);
    
    // Add cache-busting headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json(users);
  } catch (error) {
    console.error('[ERROR] Error fetching users:', error.message);
    console.error('[ERROR] Stack:', error.stack);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  dbCheck(req, res);

  const userId = req.params.id;
  try {
    const user = await db.getUserById(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  dbCheck(req, res);
  const { name, email, role } = req.body;

  try {
    if (!name || !email || !role) {
      return res.status(400).send('Bad Request: Missing required fields');
    }

    const createdUser = await db.createUser({name, email, role});
    res.status(201).json({
      message: 'User created successfully',
      user: createdUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 200,
    database: dbReady ? 'Connected' : 'Disconnected',
    time: new Date().toISOString()
  });
});

// Middleware to check database connection
const dbCheck = (req, res) => {
  if (!dbReady) {
    return res.status(503).send('Service Unavailable: Database not connected');
  }
};

// Start server after initializing database
const startServer = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();