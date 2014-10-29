exports.verifyEd25519 = verifyEd25519;
exports.BASE64_REGEX = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;

var nacl = require('tweetnacl');

function verifyEd25519 (messageString, signatureBase64, publicKeyBase64) {
	var message, signature, publicKey;

	try {
		message = nacl.util.decodeUTF8(messageString);
		signature = nacl.util.decodeBase64(signatureBase64);
		publicKey = nacl.util.decodeBase64(publicKeyBase64);
	} catch (e) {
		return false;
	}
	
	return nacl.sign.detached.verify(message, signature, publicKey);
}
