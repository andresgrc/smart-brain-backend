const express = require('express');
const app = express();
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Ensure compatibility with Heroku's Postgres
    },
    host: process.env.DATABASE_HOST,
    port: 5432,
    user: process.env.DATABAE_USER,
    password: process.env.DATABASE_PW,
    database: process.env.DATABASE_DB
  },
});

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('It is working!');
});
app.post('/signin', (req, res) => signin.handleSignin(req, res, db, bcrypt));
app.post('/register', (req, res) =>
  register.handleRegister(req, res, db, bcrypt)
);
app.get('/profile/:id', (req, res) => profile.handleProfileGet(req, res, db));
app.put('/image', (req, res) => image.handleImage(req, res, db));
app.post('/imageurl', (req, res) => image.handleApiCall(req, res)); // Clarifai API call route

app.listen(process.env.PORT || 3001, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});
