var rp = require('request-promise');
var nacl = require('tweetnacl');

var keypair1 = nacl.sign.keyPair();
var keypair2 = nacl.sign.keyPair();

var user1 = {
	user_id: 'user1',
	public_key: nacl.util.encodeBase64(keypair1.publicKey),
	balances: {
		XRP: 10000000000
	}
};
var user2 = {
	user_id: 'user2',
	public_key: nacl.util.encodeBase64(keypair2.publicKey)
};

function sign(body, keypair) {
	var message = JSON.stringify(body);
	var signature = nacl.sign.detached(nacl.util.decodeUTF8(message), keypair.secretKey);
	return nacl.util.encodeBase64(signature);
}


rp({
	url: 'http://localhost:8000/showmethemoney',
	method: 'POST',
	json: user1,
	headers: {
		Authentication: 'Ed25519 ' + sign(user1, keypair1)
	}
})
.then(function(response){
	return rp('http://localhost:8000/users/user1');
})
.then(function(response){
	var user = response.body;
	console.log('After /showmethemoney user1 has record: ', user);
})
.catch(function(response){
	console.log(response.body);
})
.then(function(){
	return rp({
		url: 'http://localhost:8000/users',
		method: 'POST',
		json: user2,
		headers: {
			Authentication: 'Ed25519 ' + sign(user2, keypair2)
		}
	})
})
.then(function(){
	return rp('http://localhost:8000/users/user2');
})
.then(function(response){
	var user = response.body;
	console.log('After POST /users user2 has record: ', user);
})
.then(function(){
	var payment = {
		payment_id: 'test',
		source: 'user1',
		destination: 'user2',
		currency: 'XRP',
		amount: 999999
	};
	return rp({
		url: 'http://localhost:8000/payments',
		method: 'POST',
		json: payment,
		headers: {
			Authentication: 'Ed25519 ' + sign(payment, keypair1)
		}
	})
})
.then(function(response){
	return rp('http://localhost:8000/users/user1');
})
.then(function(response){
	console.log(response);
	var user = response.body;
	console.log('After POST /payments user1 has record: ', user);
})
.then(function(response){
	return rp('http://localhost:8000/users/user2');
})
.then(function(response){
	var user = response.body;
	console.log('After POST /payments user2 has record: ', user);
})
.catch(function(response){
	console.error(response.body);
});