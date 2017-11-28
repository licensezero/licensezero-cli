module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var validations = {
    email: require('../validate/email'),
    name: require('../validate/name'),
    jurisdiction: require('../validate/jurisdiction')
  }
  var keys = Object.keys(validations)
  var newLicensor = {}
  for (var index = 0; index < keys.length; index++) {
    var key = keys[index]
    var value = newLicensor[key] = options['<' + key + '>']
    if (!validations[key](value)) return done('invalid ' + key)
  }

  var agreeToTerms = require('../agree-to-terms')
  agreeToTerms(stdin, stdout, false, function (error, accepted) {
    /* istanbul ignore if */
    if (error) return done(error)
    if (!accepted) return done('must accept terms')
    var request = require('../request')
    request({
      action: 'register',
      name: newLicensor.name,
      email: newLicensor.email,
      jurisdiction: newLicensor.jurisdiction,
      terms: (
        'I agree to the terms of service at ' +
        'https://licensezero.com/terms/service.'
      )
    }, function (error, response) {
      /* istanbul ignore if */
      if (error) return done(error)
      stdout.write('Follow the Stripe authorization link sent by e-mail.\n')
      done()
    })
  })
}
