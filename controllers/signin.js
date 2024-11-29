const handleSignin = (db, bcrypt) => (req, res) => {
	const { email, password } = req.body;
  
	// Log the request body
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
  };
  
  module.exports = {
	handleSignin,
  };
  