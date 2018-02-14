var readIdentities = require('../read/identities')
var request = require('../request')
var validSignature = require('../validate/signature')
var validWaiver = require('../validate/waiver')
var writeWaiver = require('../write/waiver')

module.exports = function (config, waiver, done) {
  if (!validWaiver(waiver)) return done('invalid waiver')
  try {
    var manifest = JSON.parse(waiver.manifest)
  } catch (error) {
    return done('invalid waiver')
  }
  var projectID = waiver.projectID
  var summary = []
  function log (argument) {
    summary.push(argument)
  }
  log('Project ID: ' + projectID)
  var beneficiary = manifest.beneficiary
  log('Beneficiary: ' + beneficiary.name)
  var name = beneficiary.name
  var jurisdiction = beneficiary.jurisdiction
  log('Jurisdiction: ' + beneficiary.jurisdiction)
  var email = beneficiary.email
  log('email: ' + beneficiary.email)
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
    if (!validSignature(waiver)) {
      return done('invalid cryptographic signature')
    }
    log('Signature: valid')
    log('Public Key: ' + waiver.publicKey.slice(0, 32) + '...')
    request(
      {
        action: 'project',
        projectID: projectID
      },
      function (error, response) {
        if (error) return done(error)
        if (waiver.publicKey !== response.licensor.publicKey) {
          return done('public key does not match')
        }
        log('licensezero.com Public Key: matches')
        writeWaiver(config, waiver, function (error) {
          if (error) return done(error)
          log('Imported waiver.')
          done(null, summary.join('\n'))
        })
      }
    )
  })
}
