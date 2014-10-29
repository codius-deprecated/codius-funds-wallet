var User = require('../models/user');

module.exports = function(req, res, next) {

	var uid = req.param('uid');

	console.log('GET user: ', uid);

	if (!uid) {
		var err = new Error('Must supply `uid` to get user record');
		err.status = 400;
		return next(err);
	}

	User.get(uid, function(error, result){
		if (error) {
			return next(error);
		}

		res.send(result);
	});

};