const express = require('express');
const bodyParser = require('body-parser'); // latest version of exressJS now comes with Body-Parser!
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const axios = require('axios'); // Import axios for HTTP requests

const db = knex({
  // Enter your own database information here based on what you created
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: '',
    password: '',
    database: 'smart-brain',
  },
});

const app = express();

app.use(cors());
app.use(express.json()); // latest version of exressJS now comes with Body-Parser!

// Clarifai API Configuration
const CLARIFAI_API_KEY = 'fa8e58ad34254e81a699b9915d980346'; // Replace with your Clarifai API Key
const CLARIFAI_MODEL_ID = 'face-detection'; // Replace with your Clarifai model ID
const CLARIFAI_URL = `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/outputs`;

app.post('/clarifai', async (req, res) => {
  const { imageUrl } = req.body;

  try {
    const response = await axios.post(
      CLARIFAI_URL,
      {
        user_app_id: {
          user_id: 'andresgrc', // Replace with your Clarifai user ID
          app_id: 'smart-brain', // Replace with your Clarifai app ID
        },
        inputs: [
          {
            data: {
              image: {
                url: imageUrl,
              },
            },
          },
        ],
      },
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Key ${CLARIFAI_API_KEY}`,
        },
      }
    );

    res.json(response.data); // Send the response data back to the client
  } catch (error) {
    console.error('Error calling Clarifai API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Unable to work with API' });
  }
});

app.post('/signin', (req, res) => {
  db.select('email', 'hash')
    .from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0]);
          })
          .catch(_err => res.status(400).json('unable to get user'));
      } else {
        res.status(400).json('wrong credentials');
      }
    })
    .catch(_err => res.status(400).json('wrong credentials'));
});

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date(),
          })
          .then(user => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(_err => res.status(400).json('unable to register'));
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*')
    .from('users')
    .where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('Not found');
      }
    })
    .catch(_err => res.status(400).json('error getting user'));
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0].entries);
    })
    .catch(_err => res.status(400).json('unable to get entries'));
});

app.listen(3001, () => {
  console.log('app is running on port 3001');
});
