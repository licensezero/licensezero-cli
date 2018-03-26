module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var readIdentities = require('../read/identities')
  readIdentities(config, function (error, identities) {
    /* istanbul ignore if */
    if (error) return done(error)

    var confirm = require('../confirm')
    var prompt = [
      'You have already created an identity.',
      'Create another one?'
    ].join('\n')
    confirm(stdin, stdout, prompt, function (error, accepted) {
      if (error) return done(error)
      if (!accepted) return done()
      var validations = {
        name: require('../validate/name'),
        jurisdiction: require('../validate/jurisdiction'),
        email: require('../validate/email')
      }
      var keys = Object.keys(validations)
      var newIdentity = {}
      for (var index = 0; index < keys.length; index++) {
        var key = keys[index]
        var value = newIdentity[key] = options['<' + key + '>']
        if (!validations[key](value)) return done('invalid ' + key)
      }

      var identical = identities.find(function (existingIdentity) {
        return (
          existingIdentity.name === newIdentity.name &&
          existingIdentity.jurisdiction === newIdentity.jurisdiction &&
          existingIdentity.email === newIdentity.email
        )
      })
      if (identical) return done('identical to existing identity')
      var writeIdentity = require('../write/identity')
      writeIdentity(config, newIdentity, done)
    })
  })
}
