module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'Log in as a licensor, saving your access token for future use.',
    '',
    'Usage:',
    '  l0-create-licensor <UUID>',
    '  l0-create-licensor -h | --help',
    '  l0-create-licensor -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

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
