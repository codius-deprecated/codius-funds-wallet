var express = require('express');
var bodyParser = require('body-parser');
var auth = require('./lib/auth');
var app = express();

var User = require('./models/user');

// Configure app
app.set('port', process.env.PORT || 8000);
app.use(bodyParser.json({
	verify: function(req, res, buf, encoding) {
		// Take advantage of the built in verify function
		// to retain a copy of the bodyString, which
		// we need for signature verification
		req.bodyString = buf.toString('utf8');
	}
}));
app.use(auth.middleware.addUserToReq);
app.use(auth.middleware.verifySignature);

// Load routes
var routePostUser = require('./routes/routePostUser');
var routeGetUser = require('./routes/routeGetUser');

app.post('/user', routePostUser);
app.get('/user/:uid', routeGetUser);

// Error handler
app.use(function(err, req, res, next) {
	if (err) {
		console.error(err.stack);
		res.status(err.status || 500).send('Error: ' + err.message + '\n');
	}
});

// Start app
// TODO make this nicer by adding promises
User.init(function(){
	app.listen(app.get('port'));
	console.log('Contract listening on port: ' + app.get('port'));
});
