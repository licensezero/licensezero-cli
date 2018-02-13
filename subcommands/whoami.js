module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var readIdentity = require('../read/identity')
  readIdentity(config, function (error, identity) {
    /* istanbul ignore if */
    if (error) return done(error)
    var lamos = require('lamos')
    stdout.write(
      lamos.stringify({
        Name: identity.name,
        Jurisdiction: identity.jurisdiction,
        'E-Mail': identity.email
      }) + '\n'
    )
    done(0)
  })
}
