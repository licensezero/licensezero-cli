var ed25519 = require('ed25519-supercop')

module.exports = function (object) {
  return ed25519.verify(
    object.manifest + '\n\n' + object.document,
    object.publicKey,
    object.signature
  )
}
