var express = require('express');
var bodyParser = require('body-parser');
var auth = require('./lib/auth');
var app = express();

var User = require('./models/user');

// Configure app
app.set('port', process.env.PORT || 8000);
app.use(bodyParser.json());

// Load routes
var routePostUser = require('./routes/routePostUser');
var routePostPayment = require('./routes/routePostPayment');
var routeGetUser = require('./routes/routeGetUser');

app.post('/users', auth.verifySignature, routePostUser);
app.post('/payments', auth.verifySignature, routePostPayment);
app.get('/users/:user_id', auth.verifySignature, routeGetUser);

// For testing purposes only (obviously)
app.post('/showmethemoney', function(req, res, next){
	var user = req.body;
	User.save(user.user_id, user, function(error, result){
		if (error) {
			return next(error);
		}

		res.json({
			success: true,
			user: result
		});
	});
});

app.get('/hello', function(req, res){
	res.send('hello. this is your smart contract speaking. (what else did you think this would do?)');
});

// Error handler
app.use(function(err, req, res, next) {
	if (err) {
		console.error(err.name, err.message, '\n', err.stack);
		res.status(err.status || 500).send(err.name + ': ' + err.message + '\n');
		return;
	}
	next();
});

// Start app
app.listen(app.get('port'));
console.log('Contract listening on port: ' + app.get('port'));
