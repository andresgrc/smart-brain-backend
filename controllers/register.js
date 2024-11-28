const handleRegister = (req, res, db, bcrypt) => {
	const { name, email, password } = req.body;
  
	// Validate inputs
	if (!name || !email || !password) {
	  console.error('Validation error: Missing required fields');
	  return res.status(400).json('Incorrect form submission');
	}
  
	const hash = bcrypt.hashSync(password);
  
	db.transaction((trx) => {
	  trx('login')
		.insert({
		  hash: hash,
		  email: email,
		})
		.returning('email')
		.then((loginEmail) => {
		  // Log email returned
		  console.log('Email inserted into login table:', loginEmail);
  
		  // Ensure loginEmail is valid
		  const emailValue = Array.isArray(loginEmail) ? loginEmail[0] : loginEmail;
  
		  return trx('users')
			.returning('*')
			.insert({
			  email: emailValue,
			  name: name,
			  joined: new Date(),
			})
			.then((user) => {
			  // Log user creation
			  console.log('User inserted into users table:', user);
  
			  // Ensure user is valid
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
  };
  
  module.exports = {
	handleRegister,
  };
  