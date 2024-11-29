const handleRegister = (req, res, db, bcrypt) => {
	const { name, email, password } = req.body;
  
	// Validate inputs
	if (!name || !email || !password) {
	  console.error('Validation error: Missing required fields');
	  return res.status(400).json('Incorrect form submission');
	}
  
	try {
	  // Hash the password
	  const hash = bcrypt.hashSync(password, 10); // Ensure password and salt are provided
  
	  // Transaction for inserting data into 'login' and 'users' tables
	  db.transaction((trx) => {
		trx('login')
		  .insert({
			hash: hash,
			email: email,
		  })
		  .returning('email')
		  .then((loginEmail) => {
			console.log('Email inserted into login table:', loginEmail);
  
			return trx('users')
			  .returning('*')
			  .insert({
				email: loginEmail[0], // Ensure valid email is used
				name: name,
				joined: new Date(),
			  })
			  .then((user) => {
				console.log('User inserted into users table:', user);
				if (user.length) {
				  res.json(user[0]);
				} else {
				  console.error('User creation failed: No user returned from query');
				  throw new Error('User creation failed');
				}
			  });
		  })
		  .then(trx.commit)
		  .catch((err) => {
			trx.rollback();
			console.error('Transaction rollback due to error:', err.message);
			res.status(400).json('Unable to register');
		  });
	  }).catch((err) => {
		console.error('Database transaction error:', err.message);
		res.status(500).json('Database error');
	  });
	} catch (err) {
	  console.error('Error during hashing or transaction setup:', err.message);
	  res.status(500).json('Internal server error');
	}
  };
  
  module.exports = {
	handleRegister,
  };
  