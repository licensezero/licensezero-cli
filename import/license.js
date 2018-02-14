var readIdentities = require('../read/identities')
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
  var projectID = license.projectID
  var summary = []
  function log (argument) {
    summary.push(argument)
  }
  log('Project ID: ' + projectID)
  var licensee = manifest.licensee
  log('Licensee: ' + licensee.name)
  var name = licensee.name
  var jurisdiction = licensee.jurisdiction
  log('Jurisdiction: ' + licensee.jurisdiction)
  var email = licensee.email
  log('email: ' + licensee.email)
  readIdentities(config, function (error, identities) {
    if (error) return done(error)
    var matchingIdentity = identities.find(function (identity) {
      return (
        identity.name === name &&
        identity.jurisdiction === jurisdiction &&
        identity.email === email
      )
    })
    if (!matchingIdentity) {
      return done(
        'license for ' +
          name +
          ' [' +
          jurisdiction +
          '] ' +
          'does not match any existing licensee'
      )
    }
    if (!validSignature(license)) {
      return done('invalid cryptographic signature')
    }
    log('Signature: valid')
    log('Public Key: ' + license.publicKey.slice(0, 32) + '...')
    request(
      {
        action: 'project',
        projectID: projectID
      },
      function (error, response) {
        if (error) return done(error)
        if (license.publicKey !== response.licensor.publicKey) {
          return done('public key does not match')
        }
        log('licensezero.com Public Key: matches')
        writeLicense(config, license, function (error) {
          if (error) return done(error)
          log('Imported license.')
          done(null, summary.join('\n'))
        })
      }
    )
  })
}
