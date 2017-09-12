var readLicensees = require('./read/licensees')
var request = require('./request')
var validWaiver = require('./validate/waiver')
var validSignature = require('./validate/signature')
var writeWaiver = require('./write/waiver')

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
    if (!validSignature(waiver)) {
      return done('invalid cryptographic signature')
    }
    log('Signature: valid')
    log('Public Key: ' + waiver.publicKey.slice(0, 32) + '...')
    request({
      action: 'project',
      projectID: projectID
    }, function (error, response) {
      if (error) return done(error)
      if (waiver.publicKey !== response.licensor.publicKey) {
        return done('public key does not match')
      }
      log('licensezero.com Public Key: matches')
      writeWaiver(config, nickname, waiver, function (error) {
        if (error) return done(error)
        log('Imported waiver.')
        done(null, summary.join('\n'))
      })
    })
  })
}
