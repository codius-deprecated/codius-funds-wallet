var User = require('../models/user');
var crypto = require('./crypto')

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
	// TODO sign GET requests as well
	if (req.method !== 'POST') {
		return next();
	}

	// TODO more sophisticated handling of requests
	// that are not tied to a specific user
	if (!req.user) {
		var err = new Error('All requests must be associated with a user specified by `user_id`');
		err.status = 400;
		return next(err);
	}

	var signature;
	var authenticationHeader = req.header('Authentication');
	if (!authenticationHeader || authenticationHeader.indexOf('Ed25519') !== 0) {
		var err = new Error('Request must be sent with `Authentication` header set to `Ed25519 [base64-encoded signature]`');
		err.status = 400;
		return next(err);
	} else {
		signature = authenticationHeader.replace('Ed25519 ', '');
	}


	var user = req.user;
	var message = req.bodyString || '';
	var publicKey = user.public_key;

	if (crypto.verifyEd25519(message, signature, publicKey)) {
		return next();
	} else {
		var err = new Error('Invalid signature');
		err.status = 400;
		return next(err);
	}
}