const handleSignin = (db, bcrypt) => (req, res) => {
	const { email, password } = req.body;
  
	// Validate input
	if (!email || !password) {
	  console.error('Signin validation error: Missing email or password');
	  return res.status(400).json('Incorrect form submission');
	}
  
	// Query login table
	db.select('email', 'hash')
	  .from('login')
	  .where('email', '=', email)
	  .then((data) => {
		if (!data.length) {
		  console.error(`Signin error: Email not found - ${email}`);
		  return res.status(400).json('Wrong credentials');
		}
  
		// Compare passwords using bcrypt
		const isValid = bcrypt.compareSync(password, data[0].hash);
  
		if (isValid) {
		  return db
			.select('*')
			.from('users')
			.where('email', '=', email)
			.then((user) => {
			  if (user.length) {
				console.log(`Signin successful for email: ${email}`);
				res.json(user[0]);
			  } else {
				console.error(`Signin error: No user found in users table for email: ${email}`);
				res.status(400).json('Unable to get user');
			  }
			})
			.catch((err) => {
			  console.error(`Database error while fetching user: ${err.message}`);
			  res.status(500).json('Error fetching user');
			});
		} else {
		  console.error(`Signin error: Invalid password for email: ${email}`);
		  res.status(400).json('Wrong credentials');
		}
	  })
	  .catch((err) => {
		console.error(`Database query error during signin: ${err.message}`);
		res.status(500).json('Error during signin');
	  });
  };
  
  module.exports = {
	handleSignin,
  };
  