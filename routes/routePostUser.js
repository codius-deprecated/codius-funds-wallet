var User = require('../models/user');

module.exports = function(req, res, next) {
	// TODO: prevent someone from spamming contract with new accounts
	
	var user_id = req.param('user_id');
	var err;
	if (!user_id) {
		err = new Error('Must supply user `user_id`');
		err.status = 400;
		return next(err);
	}
	if (!req.body.public_key) {
		err = new Error('Must supply user `public_key`');
		err.status = 400;
		return next(err);
	}

	// Save only fields that users are allowed to modify (e.g. not balances)
	var dataToSave = {
		public_key: req.body.public_key
	};

	User.save(user_id, dataToSave, function(error, result){
		if (error) {
			return next(error);
		}

		res.json({
			success: true,
			user: result
		});
	});
};