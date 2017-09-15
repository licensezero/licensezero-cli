module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'List licensee licensees.',
    '',
    'Usage:',
    '  l0-list-licensees',
    '  l0-list-licensees -h | --help',
    '  l0-list-licensees -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

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
