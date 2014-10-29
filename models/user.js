var db = require('../lib/db');
var crypto = require('../lib/crypto');

exports.object_name = 'users';
exports.init = init;
exports.get = get;
exports.save = save;
exports.isUser = isUser;

function init (callback) {
	db.ensureObjectExists(exports.object_name, callback);
}

function get (uid, callback) {
	db.getFromObject(exports.object_name, uid, function(error, result){
		if (error) {
			return callback(error);
		} else if (!result) {
			return callback(new Error('User does not exist. uid: ' + uid));
		}

		console.log('get', result);

		callback(null, result);
	});
}

function save (uid, user, callback) {
	db.getFromObject(exports.object_name, uid, function(error, result){
		if (error) {
			return callback(error);
		}

		var newUserEntry = result || {};
		Object.keys(user || {}).forEach(function(key){
			newUserEntry[key] = user[key];
		});

		if (!newUserEntry.uid) {
			newUserEntry.uid = uid;
		}

		if (!newUserEntry.public_key) {
			return callback(new Error('User entry must include public_key'));
		}

		db.saveToObject(exports.object_name, uid, newUserEntry, function(error, result){
			if (error) {
				return callback(error);
			}

			callback(null, newUserEntry);
		});
	});

}

function isUser (user) {
	if (!user || typeof user !== 'object') {
		return false;
	}

	if (typeof user.uid !== 'string' || !user.uid || user.uid.length > 32) {
		return false;
	}

	if (typeof user.public_key !== 'string' || !crypto.BASE64_REGEX.test(user.public_key)) {
		return false;
	}

	return true;
}
