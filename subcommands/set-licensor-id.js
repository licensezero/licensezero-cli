module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var licensorID = options['<licensor ID>']
  var validUUID = require('../validate/uuid')
  if (!validUUID(licensorID)) return done('invalid licensor id')

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
    var licensor = {
      licensorID: licensorID,
      token: token
    }
    var writeLicensor = require('../write/licensor')
    writeLicensor(config, licensor, done)
  })
}
