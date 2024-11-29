const express = require('express');
const app = express();
const bcrypt = require('bcrypt'); // Correct bcrypt import
const cors = require('cors');
const knex = require('knex');
const register = require('./controllers/register');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

// Initialize database connection
const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Render compatibility
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
    process.exit(1); // Exit the server if the database connection fails
  });

// Middleware
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Enable CORS for all origins

// Log each incoming request for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  console.log('Request Body:', req.body || 'No body');
  next();
});

// Routes
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.status(200).send('It is working!');
});

// Integrated signin logic directly into the route
app.post('/signin', (req, res) => {
  console.log('Signin endpoint hit');
  const { email, password } = req.body;

  // Log the incoming request body
  console.log('Signin request received with body:', req.body);

  // Validate input
  if (!email || !password) {
    console.error('Signin validation error: Missing email or password');
    return res.status(400).json('Incorrect form submission');
  }

  // Query the login table
  db.select('email', 'hash')
    .from('login')
    .where('email', '=', email)
    .then((data) => {
      // Log data retrieved from the database
      console.log('Login data fetched for email:', email, '| Data:', data);

      if (!data.length) {
        console.error('Signin error: Email not found');
        return res.status(400).json('Wrong credentials');
      }

      const isValid = bcrypt.compareSync(password, data[0].hash);

      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', '=', email)
          .then((user) => {
            // Log user data retrieved
            console.log('User data fetched:', user);

            if (user.length) {
              res.json(user[0]);
            } else {
              console.error('Signin error: User not found in users table');
              res.status(400).json('Unable to get user');
            }
          })
          .catch((err) => {
            console.error('Database error while fetching user:', err.message);
            res.status(500).json('Error fetching user');
          });
      } else {
        console.error('Signin error: Invalid password');
        res.status(400).json('Wrong credentials');
      }
    })
    .catch((err) => {
      console.error('Database query error during signin:', err.message);
      res.status(500).json('Error during signin');
    });
});

app.post('/register', (req, res) => {
  console.log('Register endpoint hit');
  try {
    register.handleRegister(req, res, db, bcrypt);
  } catch (error) {
    console.error('Error in /register route:', error.message);
    res.status(500).json({ error: 'Internal Server Error during registration' });
  }
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Profile endpoint hit with ID: ${id}`);
  try {
    profile.handleProfileGet(req, res, db);
  } catch (error) {
    console.error('Error in /profile route:', error.message);
    res.status(500).json({ error: 'Internal Server Error during profile retrieval' });
  }
});

app.put('/image', (req, res) => {
  console.log('Image endpoint hit with body:', req.body);
  try {
    image.handleImage(req, res, db);
  } catch (error) {
    console.error('Error in /image route:', error.message);
    res.status(500).json({ error: 'Internal Server Error during image update' });
  }
});

app.post('/imageurl', (req, res) => {
  console.log('Image URL endpoint hit with body:', req.body);
  try {
    image.handleApiCall(req, res);
  } catch (error) {
    console.error('Error in /imageurl route:', error.message);
    res.status(500).json({ error: 'Internal Server Error during API call' });
  }
});

// Catch-all route for undefined endpoints
app.all('*', (req, res) => {
  console.error(`Invalid route hit: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
});

// Error-handling middleware for unhandled server errors
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
