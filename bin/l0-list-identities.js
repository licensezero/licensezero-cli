module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
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

  var ecb = require('ecb')
  var readIdentities = require('../read/identities')
  readIdentities(config, ecb(done, function (identities) {
    identities.forEach(function (identity) {
      stdout.write(identity.nickname + '\n')
    })
    return done()
  }))
}
