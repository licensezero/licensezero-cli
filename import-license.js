var readLicensees = require('../read/licensees')
var request = require('../request')
var validLicense = require('../validate/license')
var validSignature = require('../validate/signature')
var writeLicense = require('../write/license')

module.exports = function (config, license, done) {
  if (!validLicense(license)) return done('invalid license')
  try {
    var manifest = JSON.parse(license.manifest)
  } catch (error) {
    return done('invalid license')
  }
  var productID = license.productID
  var summary = []
  function log (argument) {
    summary.push(argument)
  }
  log('Product ID: ' + productID)
  var licensee = manifest.licensee
  log('Licensee: ' + licensee)
  var name = licensee.name
  var jurisdiction = licensee.jurisdiction
  log('Jurisdiction: ' + licensee)
  readLicensees(config, function (error, licensees) {
    if (error) return done(error)
    var matchingLicensee = licensees.find(function (licensee) {
      return (
        licensee.name === name &&
        licensee.jurisdiction === jurisdiction
      )
    })
    if (!matchingLicensee) {
      return done(
        'license for ' + name + ' [' + jurisdiction + '] ' +
        'does not match any existing licensee'
      )
    }
    var nickname = matchingLicensee.nickname
    log('Matches Licensee: ' + nickname)
    var tier = manifest.tier
    if (matchingLicensee.tier !== tier) {
      return done(
        'Warning: ' + nickname + ' is configured for ' +
        matchingLicensee.tier + '-tier licenses.\n' +
        '         This is a ' + license.tier + '-tier license.'
      )
    }
    log('Tier: ' + tier)
    if (!validSignature(license)) {
      return done('invalid cryptographic signature')
    }
    log('Signature: valid')
    log('Public Key: ' + license.publicKey.slice(0, 32) + '...')
    request({
      action: 'product',
      productID: productID
    }, function (error, response) {
      if (error) return done(error)
      if (license.publicKey !== response.licensor.publicKey) {
        return done('public key does not match')
      }
      log('licensezero.com Public Key: matches')
      writeLicense(config, nickname, license, function (error) {
        if (error) return done(error)
        log('Imported license.')
        done(null, summary.join('\n'))
      })
    })
  })
}
