// TODO: waiver import

module.exports = function (argv, cwd, config, stdout, stderr, done) {
  var options = require('./usage')([
    'Import a License Zero waiver or license file.',
    '',
    'Usage:',
    '  l0-import <file>',
    '  l0-import -h | --help',
    '  l0-import -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.',
    '  -q, --quiet    Suppress output.'
  ]).apply(null, arguments)
  if (!options) return

  var file = options['<file>']

  var ecb = require('ecb')
  var readJSONFile = require('../read/json-file')
  readJSONFile(file, ecb(done, function (license) {
    var validLicense = require('../validate/license')
    if (!validLicense(license)) return done('invalid license')
    var lamos = require('lamos')
    try {
      var manifest = lamos.parse(license.manifest)
    } catch (error) {
      return done('invalid license')
    }
    var productID = license.productID
    log('Product ID: ' + productID)
    var licensee = manifest.licensee
    log('Licensee: ' + licensee)
    var name = licensee.name
    var jurisdiction = licensee.jurisdiction
    log('Jurisdiction: ' + licensee)
    var readIdentities = require('../read/identities')
    readIdentities(config, ecb(done, function (identities) {
      var matchingIdentity = identities.find(function (identity) {
        return (
          identity.name === name &&
          identity.jurisdiction === jurisdiction
        )
      })
      if (!matchingIdentity) {
        return done(
          'license for ' + name + ' [' + jurisdiction + '] ' +
          'does not match any existing identity'
        )
      }
      var nickname = matchingIdentity.nickname
      log('Matches Identity: ' + nickname)
      var tier = manifest.tier
      if (matchingIdentity.tier !== tier) {
        stderr.write(
          'Warning: ' + nickname + ' is configured for ' +
          matchingIdentity.tier + '-tier licenses.\n' +
          '         This is a ' + license.tier + '-tier license.'
        )
      }
      log('Tier: ' + tier)
      var validSignature = require('../validate/signature')
      if (!validSignature(license)) {
        return done('invalid cryptographic signature')
      }
      log('Signature: valid')
      log('Public Key: ' + license.publicKey.slice(0, 32) + '...')
      var request = require('../request')
      request({
        action: 'product',
        productID: productID
      }, ecb(done, function (response) {
        if (license.publicKey !== response.licensor.publicKey) {
          return done('public key does not match')
        }
        log('licensezero.com Public Key: matches')
        var writeLicense = require('../write/license')
        writeLicense(config, nickname, license, ecb(done, function () {
          stdout.write('Imported license.')
          done()
        }))
      }))
    }))
  }))

  function log (message) {
    if (!options['--quiet']) stdout.write(message + '\n')
  }
}
