var User = require('../models/user');
var httpSignature = require('http-signature');

if (!exports.middleware) {
	exports.middleware = {};
}
exports.middleware.addUserToReq = addUserToReq;
exports.middleware.verifySignature = verifySignature;

function addUserToReq(req, res, next){
	// Get user_id either from the params or the JSON body
	var user_id = req.param('user_id') || req.param('source');
	if (!user_id) {
		return next();
	}

	User.get(user_id, function(error, result){
		if (!result && User.isUser(req.body)) {
			req.user = req.body;
			return next();
		} else if (error) {
			return next(error);
		}

		req.user = result;
		next();
	});
}

function verifySignature(req, res, next){
	var parsedSignature, valid;
	try {
		parsedSignature = httpSignature.parseRequest(req);
		valid = httpSignature.verify(parsedSignature, req.user.public_key);
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
}