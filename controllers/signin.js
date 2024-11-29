const handleSignin = (db, bcrypt) => (req, res) => {
	const { email, password } = req.body;
  
	// Validate input
	if (!email || !password) {
	  console.error('Signin validation error: Missing email or password');
	  return res.status(400).json('Incorrect form submission');
	}
  
	console.log(`Signin attempt for email: ${email}`); // Log email being signed in
  
	db.select('email', 'hash')
	  .from('login')
	  .where('email', '=', email)
	  .then((data) => {
		if (data.length === 0) {
		  console.error('Signin error: Email not found');
		  return res.status(400).json('Wrong credentials');
		}
  
		const isValid = bcrypt.compareSync(password, data[0].hash);
  
		if (isValid) {
		  console.log(`Password valid for email: ${email}`); // Log valid password
  
		  return db
			.select('*')
			.from('users')
			.where('email', '=', email)
			.then((user) => {
			  if (user.length) {
				console.log(`User data retrieved: ${JSON.stringify(user[0])}`); // Log user data
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
  