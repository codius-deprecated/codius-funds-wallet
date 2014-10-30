var Promise = require('bluebird');
var User = Promise.promisifyAll(require('../models/user'));

exports.processPayment = processPayment;

// TODO make this a class
// TODO make this MUCH more intelligent to avoid conflicting payments
// TODO handle cross-currency transactions
// TODO use payment_id to avoid duplicate payments

function processPayment(payment, callback) {
	Promise.map([payment.source, payment.destination], function(user_id){
		return User.getAsync(user_id);
	})
		.then(function(users){
			var sender = users[0];
			var receiver = users[1];

			console.log('processPayment', payment, sender, receiver)

			if (!sender) {
				throw new Error('Cannot execute payment. User: ' + payment.source + ' does not exist.');
			}
			if (!receiver) {
				throw new Error('Cannot execute payment. User: ' + payment.destination + ' does not exist.');
			}

			var senderBalance = sender.balances[payment.currency];
			if (!senderBalance || senderBalance < payment.amount) {
				throw new Error('Insufficient funds to execute payment.');
			}

			if (typeof receiver.balances[payment.currency] !== 'number') {
				receiver.balances[payment.currency] = 0;
			}

			sender.balances[payment.currency] -= payment.amount;
			receiver.balances[payment.currency] += payment.amount; 

			console.log('sender', sender, 'receiver', receiver);

			// TODO make this work

			return [sender, receiver];
		})
		.map(function(user){
			return User.saveAsync(user.user_id, user);
		})
		.then(callback)
		.catch(callback);
}