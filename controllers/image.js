const axios = require('axios');

const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY; // Use environment variables for security
const CLARIFAI_MODEL_ID = 'face-detection';
const CLARIFAI_URL = `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/outputs`;

const handleApiCall = (req, res) => {
  const { input } = req.body;

  axios
    .post(
      CLARIFAI_URL,
      {
        user_app_id: {
          user_id: 'clarifai', // Replace with your user ID
          app_id: 'main', // Replace with your app ID
        },
        inputs: [
          {
            data: {
              image: {
                url: input,
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
    )
    .then(response => {
      res.json(response.data); // Return the API response to the frontend
    })
    .catch(err => {
      console.error('Clarifai API error:', err.response?.data || err.message);
      res.status(400).json('Unable to work with API');
    });
};

const handleImage = (req, res, db) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0].entries);
    })
    .catch(err => {
      console.error('Database error:', err.message);
      res.status(400).json('Unable to get entries');
    });
};

module.exports = {
  handleImage,
  handleApiCall,
};
