var db = require('../lib/db');
var crypto = require('../lib/crypto');

exports.object_name = 'users';
exports.init = init;
exports.get = get;
exports.save = save;
exports.isUser = isUser;
exports.isValidUserId = isValidUserId;

var saveUser = db.saveToObject.bind(db, exports.object_name);
var getUser = db.getFromObject.bind(db, exports.object_name);

function init (callback) {
	db.ensureObjectExists(exports.object_name, callback);
}

function get (user_id, callback) {
	getUser(user_id, function(error, result){
		if (error) {
			return callback(error);
		} else if (!result) {
			return callback(new Error('User does not exist. user_id: ' + user_id));
		}

		callback(null, result);
	});
}

function save (user_id, user, callback) {
	getUser(user_id, function(error, result){
		if (error) {
			return callback(error);
		}

		var newUserEntry = result || {};
		Object.keys(user || {}).forEach(function(key){
			newUserEntry[key] = user[key];
		});

		if (!newUserEntry.user_id) {
			newUserEntry.user_id = user_id;
		}

		if (!newUserEntry.balances) {
			newUserEntry.balances = {};
		}

		if (!newUserEntry.public_key) {
			return callback(new Error('User entry must include public_key'));
		}

		saveUser(user_id, newUserEntry, function(error, result){
			if (error) {
				return callback(error);
			}

			console.log('Saved user: ', newUserEntry);

			callback(null, newUserEntry);
		});
	});

}

function updateBalance(user_id, currency, newBalance, callback) {
	getUser(user_id, function(error, result){
		if (error) {
			return callback(error);
		}

		if (!result.balances[currency]) {
			result.balances[currency] = newBalance;
		}

		saveUser(user_id, result, callback);
	});
}

function isUser (user) {
	if (!user || typeof user !== 'object') {
		return false;
	}

	if (!isValidUserId(user.user_id)) {
		return false;
	}

	if (typeof user.public_key !== 'string' || !crypto.BASE64_REGEX.test(user.public_key)) {
		return false;
	}

	return true;
}

function isValidUserId(user_id) {
	return (typeof user_id === 'string' && user_id && user_id.length <= 32);
}
