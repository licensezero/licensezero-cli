module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var readLicensees = require('../read/licensees')
  readLicensees(config, function (error, licensees) {
    /* istanbul ignore if */
    if (error) return done(error)
    licensees.forEach(function (licensee) {
      stdout.write(licensee.nickname + '\n')
    })
    return done()
  })
}
