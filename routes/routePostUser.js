var User = require('../models/user');

module.exports = function(req, res, next) {
	// TODO: prevent someone from spamming contract with new accounts
	
	console.log('POST user: ', req.body);

	var uid = req.param('uid');
	var err;
	if (!uid) {
		err = new Error('Must supply user `uid`');
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

	User.save(uid, dataToSave, function(error, result){
		if (error) {
			return next(error);
		}

		console.log('Saved user: ', result);

		res.send({
			success: true,
			user: result
		});
	});
};