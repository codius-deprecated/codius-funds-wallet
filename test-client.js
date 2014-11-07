var Promise = require('bluebird');
var nacl = require('tweetnacl');
var httpSignature = require('http-signature');
var request = Promise.promisify(require('request'));

var UID_TO_FUND = 'xiW7zebyjI51kBGNeJaehA';

var keypair1 = nacl.sign.keyPair();
var keypair2 = nacl.sign.keyPair();

var user1 = {
	user_id: 'god' + (Math.random()),
	public_key: nacl.util.encodeBase64(keypair1.publicKey),
	balances: [{
		currency: 'XRP',
		balance: 150000
	}]
};
var user2 = {
	user_id: 'user2',
	public_key: nacl.util.encodeBase64(keypair2.publicKey)
};


// function sendPayment(amount){
// 	var payment = {
// 		payment_id: 'test',
// 		source: 'user1',
// 		destination: 'user2',
// 		currency: 'XRP',
// 		amount: amount
// 	};
// 	return request({
// 		url: 'https://5gp9j6-d3rx2q-25bc9x.codius.host/payments',
// 		method: 'POST',
// 		json: payment,
// 		httpSignature: {
// 			keyId: user1.user_id,
// 			key: nacl.util.encodeBase64(keypair1.secretKey),
// 			algorithm: 'ed25519-sha512'
// 		}
// 	})
// }

// function sendPaymentAndCheckBalances() {
// 	return sendPayment(100)
// 	.then(function(){
// 		return request({
// 			url: 'https://5gp9j6-d3rx2q-25bc9x.codius.host/users/user1',
// 			httpSignature: {
// 				keyId: user1.user_id,
// 				key: nacl.util.encodeBase64(keypair1.secretKey),
// 				algorithm: 'ed25519-sha512'
// 			}
// 		});
// 	})
// 	.then(function(requestResponse){
// 		console.log('After payment this is User 1', JSON.stringify(requestResponse[1], null, 2));
// 	})
// 	.then(function(){
// 		return request({
// 			url: 'https://5gp9j6-d3rx2q-25bc9x.codius.host/users/user2',
// 			httpSignature: {
// 				keyId: user2.user_id,
// 				key: nacl.util.encodeBase64(keypair2.secretKey),
// 				algorithm: 'ed25519-sha512'
// 			}
// 		});
// 	})
// 	.then(function(requestResponse){
// 		console.log('After payment this is User 2', JSON.stringify(requestResponse[1], null, 2));
// 	})
// }

request({
	url: 'https://5gp9j6-d3rx2q-25bc9x.codius.host/showmethemoney',
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
		var payment = {
		payment_id: 'test',
		source: user1.user_id,
		destination: UID_TO_FUND,
		currency: 'XRP',
		amount: 15002
	};
	return request({
		url: 'https://5gp9j6-d3rx2q-25bc9x.codius.host/payments',
		method: 'POST',
		json: payment,
		httpSignature: {
			keyId: user1.user_id,
			key: nacl.util.encodeBase64(keypair1.secretKey),
			algorithm: 'ed25519-sha512'
		}
	})
})
.then(function(requestResponse){
		console.log(JSON.stringify(requestResponse[1], null, 2));
	})
	.then(function(){
		return request({
			url: 'https://5gp9j6-d3rx2q-25bc9x.codius.host/users/' + user1.user_id,
			httpSignature: {
				keyId: user1.user_id,
				key: nacl.util.encodeBase64(keypair1.secretKey),
				algorithm: 'ed25519-sha512'
			}
		});
	})
.then(function(requestResponse){
	console.log('After payment user 1 is:', JSON.stringify(requestResponse[1], null, 2));
})
.catch(function(error){
	console.log(error);
})
// .then(function(){
// 	return request({
// 		url: 'https://5gp9j6-d3rx2q-25bc9x.codius.host/users',
// 		method: 'POST',
// 		json: user2,
// 		httpSignature: {
// 			keyId: user2.user_id,
// 			key: nacl.util.encodeBase64(keypair2.secretKey),
// 			algorithm: 'ed25519-sha512'
// 		}
// 	})
// })
// .then(function(requestResponse){
// 	console.log('Registered User 2', JSON.stringify(requestResponse[1], null, 2));
// })
// // .then(sendPaymentAndCheckBalances)
// // .then(sendPaymentAndCheckBalances)
// // .then(sendPaymentAndCheckBalances)
// // .then(sendPaymentAndCheckBalances)
// // .then(sendPaymentAndCheckBalances)
// // .then(sendPaymentAndCheckBalances)


// .then(function(){
// 	var numbers = [];
// 	for (var i = 0; i < 100; i++) {
// 		numbers.push(i);
// 	}

// 	return Promise.each(numbers, sendPaymentAndCheckBalances);
// })

// .catch(function(error){
// 	console.error(error);
// });


