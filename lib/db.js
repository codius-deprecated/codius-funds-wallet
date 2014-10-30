var localstorage = require('localstorage');

exports.ensureObjectExists = ensureObjectExists;
exports.getFromObject = getFromObject;
exports.saveToObject = saveToObject;
exports.removeFromObject = removeFromObject;
exports.clearObject = clearObject;
exports.keysOfObject = keysOfObject;

function ensureObjectExists(obj, callback) {
	localstorage.getItem(obj, function(error, result){
		if (error) {
			return callback(error);
		}
		if (!result) {
			localstorage.setItem(obj, {}, callback);
		} else {
			callback();
		}
	});
}

function getFromObject (obj, key, callback) {
	console.log('getFromObject', obj, key);
	localstorage.getItem(obj, function(error, result){
		if (error) {
			return callback(error);
		} else if (!obj) {
			return callback(new Error('Object ' + obj + ' does not exist.'));
		}

		console.log(result[key]);

		callback(null, result[key]);
	});
}

function saveToObject (obj, key, value, callback) {
	localstorage.getItem(obj, function(error, result){
		if (error) {
			return callback(error);
		} else if (!obj) {
			return callback(new Error('Object ' + obj + ' does not exist.'));
		}
		result[key] = value;
		localstorage.setItem(obj, result, callback);
	});
}

function removeFromObject (obj, key, callback) {
	localstorage.getItem(obj, function(error, result){
		if (error) {
			return callback(error);
		} else if (!obj) {
			return callback(new Error('Object ' + obj + ' does not exist.'));
		}
		delete result[key];
		localstorage.setItem(obj, result, callback);
	});
}

function clearObject (obj, callback) {
	localstorage.removeItem(obj, callback);
}

function keysOfObject (obj, callback) {
	localstorage.getItem(obj, function(error, result){
		if (error) {
			return callback(error);
		} else if (!obj) {
			return callback(new Error('Object ' + obj + ' does not exist.'));
		}
		callback(null, Object.keys(result));
	});
}