const express = require('express');
const app = express();
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

// Database connection setup
const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL, // Render's database URL
    ssl: {
      rejectUnauthorized: false, // Ensure compatibility with Render's Postgres
    },
  },
});

app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('It is working!');
});

// Endpoints for application features
app.post('/signin', (req, res) => signin.handleSignin(req, res, db, bcrypt));
app.post('/register', (req, res) =>
  register.handleRegister(req, res, db, bcrypt)
);
app.get('/profile/:id', (req, res) => profile.handleProfileGet(req, res, db));
app.put('/image', (req, res) => image.handleImage(req, res, db));
app.post('/imageurl', (req, res) => image.handleApiCall(req, res)); // Clarifai API call route

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
