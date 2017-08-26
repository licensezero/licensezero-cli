var ed25519 = require('ed25519')

module.exports = function (object) {
  return ed25519.Verify(
    Buffer.from(object.manifest + '\n\n' + object.document, 'utf8'),
    Buffer.from(object.publicKey, 'hex'),
    Buffer.from(object.signature, 'hex')
  )
}
