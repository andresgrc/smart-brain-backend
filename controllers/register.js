const handleRegister = (req, res, db, bcrypt) => {
	const { name, email, password } = req.body;
  
	// Validate inputs
	if (!name || !email || !password) {
	  console.error('Validation error: Missing required fields');
	  return res.status(400).json('Incorrect form submission');
	}
  
	try {
	  const hash = bcrypt.hashSync(password);
  
	  db.transaction(async (trx) => {
		try {
		  // Insert into login table
		  const loginEmail = await trx('login')
			.insert({
			  hash: hash,
			  email: email,
			})
			.returning('email');
  
		  console.log('Email inserted into login table:', loginEmail);
  
		  // Ensure loginEmail is valid
		  const emailValue = Array.isArray(loginEmail) ? loginEmail[0] : loginEmail;
  
		  // Insert into users table
		  const user = await trx('users')
			.insert({
			  email: emailValue,
			  name: name,
			  joined: new Date(),
			})
			.returning('*');
  
		  console.log('User inserted into users table:', user);
  
		  // Ensure user is valid
		  if (user.length) {
			res.json(user[0]);
		  } else {
			console.error('User creation failed: No user returned from query');
			throw new Error('User creation failed');
		  }
  
		  // Commit transaction
		  await trx.commit();
		} catch (error) {
		  // Rollback transaction in case of error
		  await trx.rollback();
		  console.error('Transaction rollback due to error:', error.message);
		  res.status(400).json('Unable to register');
		}
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
  