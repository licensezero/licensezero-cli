module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var licensorID = options['<UUID>']
  var email = options['<email>']
  var request = require('../request')
  request({
    action: 'reset',
    licensorID: licensorID,
    email: email
  }, function (error, response) {
    if (error) return done(error)
    stdout.write('Check e-mail for reset link.\n')
    done()
  })
}
