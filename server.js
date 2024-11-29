const express = require('express');
const app = express();
const bcrypt = require('bcrypt'); // Correct bcrypt import
const cors = require('cors');
const knex = require('knex');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

// Initialize database connection
const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Enable for Render compatibility
    },
  },
});

// Log query errors for debugging
db.on('query-error', (error, obj) => {
  console.error('Database query error:', error.message, obj);
});

// Test database connection
db.raw('SELECT 1')
  .then(() => console.log('Database connected successfully'))
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1); // Exit process if the database connection fails
  });

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Allow all origins in CORS configuration
app.use(
  cors({
    origin: '*', // Allow requests from all origins
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Include Authorization header
  })
);

// Log each incoming request for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Body:`, req.body || 'No body');
  next();
});

// Define Routes
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.status(200).send('It is working!');
});

app.post('/signin', (req, res) => {
  console.log('Signin endpoint hit');
  signin.handleSignin(req, res, db, bcrypt);
});

app.post('/register', (req, res) => {
  console.log('Register endpoint hit');
  register.handleRegister(req, res, db, bcrypt);
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Profile endpoint hit with ID: ${id}`);
  profile.handleProfileGet(req, res, db);
});

app.put('/image', (req, res) => {
  console.log('Image endpoint hit with body:', req.body);
  image.handleImage(req, res, db);
});

app.post('/imageurl', (req, res) => {
  console.log('Image URL endpoint hit with body:', req.body);
  image.handleApiCall(req, res);
});

// Catch-all route for undefined endpoints
app.all('*', (req, res) => {
  console.error(`Invalid route: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
});

// Error-handling middleware for unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
