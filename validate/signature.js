var ed25519 = require('tweetnacl')

module.exports = function (object) {
  return ed25519.sign.detached.verify(
    Buffer.from(object.manifest + '\n\n' + object.document),
    Buffer.from(object.signature, 'hex'),
    Buffer.from(object.publicKey, 'hex')
  )
}
