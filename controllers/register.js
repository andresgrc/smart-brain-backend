const handleRegister = (req, res, db, bcrypt) => {
	const { name, email, password } = req.body;
  
	// Validate inputs
	if (!name || !email || !password) {
	  console.error('Validation error: Missing required fields');
	  return res.status(400).json('Incorrect form submission');
	}
  
	try {
	  // Hash the password securely
	  const hash = bcrypt.hashSync(password.trim(), 10); // Ensure the password is trimmed and hashed
  
	  // Use a transaction to insert data into 'login' and 'users' tables
	  db.transaction((trx) => {
		trx('login')
		  .insert({
			hash: hash,
			email: email.toLowerCase().trim(), // Store email in lowercase and trimmed
		  })
		  .returning('email')
		  .then((loginEmail) => {
			// Ensure the returned email is plain text
			const plainEmail = typeof loginEmail[0] === 'string' ? loginEmail[0] : loginEmail[0].email;
			console.log('Email inserted into login table:', plainEmail);
  
			return trx('users')
			  .returning('*')
			  .insert({
				email: plainEmail, // Use plain text email
				name: name.trim(), // Trim whitespace from name
				joined: new Date(),
			  })
			  .then((user) => {
				if (user.length) {
				  console.log('User inserted into users table:', user);
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
  