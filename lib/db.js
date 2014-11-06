var localstorage = require('localstorage');

exports.getFromTable = getFromTable;
exports.saveToTable = saveToTable;
exports.removeFromTable = removeFromTable;


function getFromTable (table, key, callback) {
	localstorage.getItem(table + '_' + key, function(error, result){
		callback(error, result);
	});
}

function saveToTable (table, key, value, callback) {
	localstorage.setItem(table + '_' + key, value, function(error, result){
		callback(error, result);
	});
}

function removeFromTable (table, key, callback) {
	localstorage.removeItem(table + '_' + key, callback);
}
