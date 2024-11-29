const express = require('express');
const app = express();
const bcrypt = require('bcrypt-nodejs');
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
    process.exit(1); // Exit if the database connection fails
  });

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(
  cors({
    origin: 'https://smart-brain-frontend-kw4t.onrender.com', // Allow specific frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type',
  })
);

// Routes
app.get('/', (req, res) => {
  res.send('It is working!');
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
  console.log('Profile endpoint hit with ID:', req.params.id);
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
