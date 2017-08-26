module.exports = function (argv, cwd, config, stdout, stderr, done) {
  var options = require('./usage')([
    'List licensee identities.',
    '',
    'Usage:',
    '  l0-list-identities',
    '  l0-list-identities -h | --help',
    '  l0-list-identities -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

  var readIdentities = require('../read-identities')
  readIdentities(config, function (error, identities) {
    /* istanbul ignore if */
    if (error) {
      stderr.write(error.message + '\n')
      return done(1)
    }
    identities.forEach(function (identity) {
      stdout.write(identity.nickname + '\n')
    })
    return done(0)
  })
}
