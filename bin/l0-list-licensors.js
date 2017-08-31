module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'List licensor credentials.',
    '',
    'Usage:',
    '  l0-list-licensors',
    '  l0-list-licensors -h | --help',
    '  l0-list-licensors -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

  var readLicensors = require('../read/licensors')
  readLicensors(config, function (error, licensors) {
    if (error) return done(error)
    licensors.forEach(function (licensor) {
      stdout.write(licensor.licensorID + '\n')
    })
    return done()
  })
}
