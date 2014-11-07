var User = require('../models/user');

exports.processPayment = processPayment;

// TODO make this a class
// TODO make this MUCH more intelligent to avoid conflicting payments
// TODO handle cross-currency transactions
// TODO use payment_id to avoid duplicate payments

// TODO clean this up to get rid of callback hell
function processPayment(payment, callback) {
	User.get(payment.source, function(error, sender){
		if (error) {
			return callback(error);
		}
		User.get(payment.destination, function(error, receiver){
			if (error) {
				return callback(error);
			}

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

			User.save(sender.user_id, sender, function(error, result){
				if (error) {
					return callback(error);
				}
				User.save(receiver.user_id, receiver, function(error, result){
					if (error) {
						return callback(error);
					}

					callback();
				});
			})

		});
	});
}

function indexOfBalance(balances, currency) {
	for (var i = 0; i < balances.length; i++) {
		if (balances[i].currency === currency) {
			return i;
		}
	}
	return -1;
}