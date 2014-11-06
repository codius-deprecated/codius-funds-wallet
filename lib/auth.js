var User = require('../models/user');
var httpSignature = require('http-signature');

exports.verifySignature = verifySignature;

function verifySignature(req, res, next){
	var user_id = req.param('user_id') || req.param('source');

	if (!user_id) {
		return next(new Error('Invalid user'));
	}

	User.get(user_id, function(error, result){
		var user;

		if (!result && User.isUser(req.body)) {
			user = req.body;
		} else if (error) {
			return next(error);
		} else if (result) {
			user = result;
		}


		if (!user) {
			return next(new Error('Invalid user', user_id));
		}
		
		var parsedSignature, valid;
		try {
			parsedSignature = httpSignature.parseRequest(req);
			valid = httpSignature.verify(parsedSignature, user.public_key);
		} catch (error) {
			return next(error);
		}

		if (valid) {
			return next();
		} else {
			var err = new Error('Invalid signature');
			err.status = 400;
			return next(err);
		}
	});

	
}