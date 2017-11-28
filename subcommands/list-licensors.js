module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var readLicensors = require('../read/licensors')
  readLicensors(config, function (error, licensors) {
    /* istanbul ignore if */
    if (error) return done(error)
    licensors.forEach(function (licensor) {
      stdout.write(licensor.licensorID + '\n')
    })
    return done()
  })
}
