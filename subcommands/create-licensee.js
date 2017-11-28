module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var validations = {
    nickname: require('../validate/nickname'),
    name: require('../validate/name'),
    jurisdiction: require('../validate/jurisdiction'),
    tier: require('../validate/tier')
  }
  var keys = Object.keys(validations)
  var newLicensee = {}
  for (var index = 0; index < keys.length; index++) {
    var key = keys[index]
    var value = newLicensee[key] = options['<' + key + '>']
    if (!validations[key](value)) return done('invalid ' + key)
  }

  var readLicensees = require('../read/licensees')
  readLicensees(config, function (error, licensees) {
    /* istanbul ignore if */
    if (error) return done(error)
    var existing = licensees.some(function (licensee) {
      return licensee.nickname === newLicensee.nickname
    })
    if (existing) return done('nickname taken')
    var identical = licensees.find(function (existingLicensee) {
      return (
        existingLicensee.name === newLicensee.name &&
        existingLicensee.jurisdiction === newLicensee.jurisdiction
      )
    })
    if (identical) return done('identical to ' + identical.nickname)
    var writeLicensee = require('../write/licensee')
    writeLicensee(config, newLicensee, done)
  })
}
