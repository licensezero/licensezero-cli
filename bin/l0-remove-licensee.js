module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'Remove a licensee licensee and related licenses.',
    '',
    'Usage:',
    '  l0-remove-licensee <nickname>',
    '  l0-remove-licensee -h | --help',
    '  l0-remove-licensee -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

  var deleteLicensee = require('../delete/licensee')
  var nickname = options['<nickname>']
  deleteLicensee(config, nickname, done)
}
