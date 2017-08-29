module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'Remove licensor credentials.',
    '',
    'Usage:',
    '  l0-remove-licensor <UUID>',
    '  l0-remove-licensor -h | --help',
    '  l0-remove-licensor -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

  var deleteLicensor = require('../delete/licensor')
  var licensorID = options['<UUID>']
  deleteLicensor(config, licensorID, done)
}
