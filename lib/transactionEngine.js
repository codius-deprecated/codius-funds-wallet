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

			if (!sender) {
				throw new Error('Cannot execute payment. User: ' + payment.source + ' does not exist.');
			}
			if (!receiver) {
				throw new Error('Cannot execute payment. User: ' + payment.destination + ' does not exist.');
			}

			var senderBalanceIndex = indexOfBalance(sender.balances, payment.currency);
			var receiverBalanceIndex = indexOfBalance(receiver.balances, payment.currency);

			if (senderBalanceIndex === -1 || sender.balances[senderBalanceIndex].balance < payment.amount) {
				throw new Error('Insufficient funds to execute payment.');
			}

			if (receiverBalanceIndex === -1) {
				receiver.balances.push({
					currency: payment.currency,
					balance: 0
				});
				receiverBalanceIndex = receiver.balances.length - 1;
			}

			sender.balances[senderBalanceIndex].balance -= payment.amount;
			receiver.balances[receiverBalanceIndex].balance += payment.amount; 

			return [sender, receiver];
		})
		.map(function(user){
			return User.saveAsync(user.user_id, user);
		})
		.then(function(){
			callback();
		})
		.catch(callback);
}

function indexOfBalance(balances, currency) {
	for (var i = 0; i < balances.length; i++) {
		if (balances[i].currency === currency) {
			return i;
		}
	}
	return -1;
}