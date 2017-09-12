/* eslint-disable max-len */
var USAGE = [
  'Offer paid licenses through licensezero.com.',
  '',
  'Usage:',
  '  l0-reset-token <UUID> <E-Mail>',
  '  l0-reset-token -h | --help',
  '  l0-reset-token -v | --version',
  '',
  'Options:',
  '  -h, --help                    Print this screen to standard output.',
  '  -v, --version                 Print version to standard output.'
]
/* eslint-enable max-len */

module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')(USAGE).apply(null, arguments)
  if (!options) return
  var licensorID = options['<UUID>']
  var email = options['<E-Mail>']
  var request = require('../request')
  request({
    action: 'reset',
    licensorID: licensorID,
    email: email
  }, function (error, response) {
    if (error) return done(error)
    stdout.write('Check e-mail for reset link.\n')
    done()
  })
}
