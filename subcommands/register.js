module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var readIdentity = require('../read/identity')
  readIdentity(config, function (error, identity) {
    if (error) return done(error)
    var agreeToTerms = require('../agree-to-terms')
    agreeToTerms(stdin, stdout, false, function (error, accepted) {
      /* istanbul ignore if */
      if (error) return done(error)
      if (!accepted) return done('must accept terms')
      var request = require('../request')
      request({
        action: 'register',
        name: identity.name,
        email: identity.email,
        jurisdiction: identity.jurisdiction,
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
  })
}
