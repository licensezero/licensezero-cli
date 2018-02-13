module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var request = require('../request')
  var readLicensor = require('../read/licensor')
  readLicensor(config, function (error, licensor) {
    if (error) return done('Run `licensezero register` to register as a licensor.')
    request({
      action: 'reset',
      licensorID: licensor.licensorID,
      email: licensor.email
    }, function (error, response) {
      if (error) return done(error)
      stdout.write('Check e-mail for reset link.\n')
      done()
    })
  })
}
