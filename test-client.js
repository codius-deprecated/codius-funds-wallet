var Promise = require('bluebird');
var nacl = require('tweetnacl');
var httpSignature = require('http-signature');
var request = Promise.promisify(require('request'));


var keypair1 = nacl.sign.keyPair();
var keypair2 = nacl.sign.keyPair();

var user1 = {
	user_id: 'user1',
	public_key: nacl.util.encodeBase64(keypair1.publicKey),
	balances: [{
		currency: 'XRP',
		balance: 10000000000
	}]
};
var user2 = {
	user_id: 'user2',
	public_key: nacl.util.encodeBase64(keypair2.publicKey)
};


request({
	url: 'http://localhost:8000/showmethemoney',
	method: 'POST',
	json: user1,
	httpSignature: {
		keyId: user1.user_id,
		key: nacl.util.encodeBase64(keypair1.secretKey),
		algorithm: 'ed25519-sha512'
	}
})
.then(function(requestResponse){
	console.log('Registered User 1', JSON.stringify(requestResponse[1], null, 2));
})
.then(function(){
	return request({
		url: 'http://localhost:8000/users',
		method: 'POST',
		json: user2,
		httpSignature: {
			keyId: user2.user_id,
			key: nacl.util.encodeBase64(keypair2.secretKey),
			algorithm: 'ed25519-sha512'
		}
	})
})
.then(function(requestResponse){
	console.log('Registered User 2', JSON.stringify(requestResponse[1], null, 2));
})
.then(function(){
	var payment = {
		payment_id: 'test',
		source: 'user1',
		destination: 'user2',
		currency: 'XRP',
		amount: 999999
	};
	return request({
		url: 'http://localhost:8000/payments',
		method: 'POST',
		json: payment,
		httpSignature: {
			keyId: user1.user_id,
			key: nacl.util.encodeBase64(keypair1.secretKey),
			algorithm: 'ed25519-sha512'
		}
	})
})
.then(function(){
	return request('http://localhost:8000/users/user1');
})
.then(function(requestResponse){
	console.log('After payment this is User 1', JSON.stringify(requestResponse[1], null, 2));
})
.then(function(){
	return request('http://localhost:8000/users/user2');
})
.then(function(requestResponse){
	console.log('After payment this is User 2', JSON.stringify(requestResponse[1], null, 2));
})
.catch(function(error){
	console.error(error);
});
