module.exports = function (argv, cwd, config, stdout, stderr, done) {
  var options = require('./usage')([
    'Remove a licensee identity and related licenses.',
    '',
    'Usage:',
    '  l0-remove-identity <nickname>',
    '  l0-remove-identity -h | --help',
    '  l0-remove-identity -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

  var deleteIdentity = require('../delete/identity')
  var nickname = options['<nickname>']
  deleteIdentity(config, nickname, function (error, identities) {
    /* istanbul ignore if */
    if (error) {
      stderr.write(error.message + '\n')
      return done()
    }
    return done()
  })
}
