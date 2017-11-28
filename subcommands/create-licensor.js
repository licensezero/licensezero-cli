module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var licensorID = options['<UUID>']
  var validateUUID = require('../validate/uuid')
  if (!validateUUID(licensorID)) {
    return done('invalid licensor id')
  }

  var read = require('read')
  read({
    prompt: 'Token: ',
    silent: true,
    replace: '*',
    input: stdin,
    output: stdout
  }, function (error, token) {
    /* istanbul ignore next */
    if (error) return done(error)
    var request = require('../request')
    request({
      action: 'licensor',
      licensorID: licensorID
    }, function (error, licensor) {
      /* istanbul ignore next */
      if (error) return done(error)
      licensor.licensorID = licensorID
      licensor.token = token
      var writeLicensor = require('../write/licensor')
      writeLicensor(config, licensor, done)
    })
  })
}
