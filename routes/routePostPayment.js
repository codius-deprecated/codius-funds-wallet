var transactionEngine = require('../lib/transactionEngine');
var User = require('../models/user');

// TODO don't hard-code currency list
var currencies = ['BTC', 'EUR', 'USD', 'XAU', 'XRP'];

module.exports = function(req, res, next) {

	var payment = req.body;

	// TODO put field validation elsewhere
	console.log('POST /payments', payment);

	if (!payment.payment_id || typeof payment.payment_id !== 'string' || payment.payment_id.length > 32) {
		var err = new Error('Invalid payment. Must include `payment_id`');
		err.status = 400;
		return next(err);
	}
	if (!User.isValidUserId(payment.source)) {
		var err = new Error('Invalid payment. Must include valid `source` user_id');
		err.status = 400;
		return next(err);
	}
	if (!User.isValidUserId(payment.destination)) {
		var err = new Error('Invalid payment. Must include valid `destination` user_id');
		err.status = 400;
		return next(err);
	}
	if (!payment.currency || currencies.indexOf(payment.currency) === -1) {
		var err = new Error('Invalid payment. Must include valid `currency` code. Supported currencies are: ' + currencies.join(', '));
		err.status = 400;
		return next(err);
	}
	if (!payment.amount || typeof payment.amount !== 'number') {
		var err = new Error('Invalid payment. Must include valid `amount`');
		err.status = 400;
		return next(err);
	}

	transactionEngine.processPayment(payment, function(error, result){
		if (error) {
			return next(error);
		}

		res.send({
			status: success
		});
	});

};