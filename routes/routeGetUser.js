var User = require('../models/user');

module.exports = function(req, res, next) {

	var user_id = req.param('user_id');

	console.log('GET user: ', user_id);

	if (!user_id) {
		var err = new Error('Must supply `user_id` to get user record');
		err.status = 400;
		return next(err);
	}

	User.get(user_id, function(error, result){
		if (error) {
			return next(error);
		}

		res.send({
			success: true,
			user: result
		});
	});

};