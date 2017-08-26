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
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

  var file = options['<file>']

  var ecb = require('ecb')
  var readJSONFile = require('../read/json-file')
  readJSONFile(file, ecb(fail, function (license) {
    var validLicense = require('../validate/license')
    if (!validLicense(license)) return fail('invalid license')
    var lamos = require('lamos')
    try {
      var manifest = lamos.parse(license.manifest)
    } catch (error) {
      return fail('invalid license')
    }
    var licensee = manifest.licensee
    var name = licensee.name
    var jurisdiction = licensee.jurisdiction
    var readIdentities = require('../read/identities')
    readIdentities(config, ecb(fail, function (identities) {
      var matchingIdentity = identities.find(function (identity) {
        return (
          identity.name === name &&
          identity.jurisdiction === jurisdiction
        )
      })
      if (!matchingIdentity) {
        return fail(
          'license for ' + name + ' [' + jurisdiction + '] ' +
          'does not match any existing identity'
        )
      }
      var nickname = matchingIdentity.nickname
      if (matchingIdentity.tier !== manifest.tier) {
        stderr.write(
          'Warning: ' + nickname + ' is configured for ' +
          matchingIdentity.tier + '-tier licenses.\n' +
          '         This is a ' + license.tier + '-tier license.'
        )
      }
      var validSignature = require('../validate/signature')
      if (!validSignature(license)) {
        return fail('invalid cryptographic signature')
      }
      var request = require('../request')
      request({
        action: 'product',
        productID: license.productID
      }, ecb(fail, function (response) {
        if (license.publicKey !== response.licensor.publicKey) {
          return fail('public key does not match')
        }
        var writeLicense = require('../write/license')
        writeLicense(config, nickname, license, ecb(fail, function () {
          stdout.write('imported')
          done(0)
        }))
      }))
    }))
  }))

  function fail (error) {
    stderr.write(error + '\n')
    done(1)
  }
}
