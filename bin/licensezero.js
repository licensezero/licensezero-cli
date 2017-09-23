module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var DESCRIPTION = 'Offer and license License Zero software projects.'
  var options = require('./usage')([
    DESCRIPTION,
    '',
    'Usage: licensezero [<subcommand>]'
  ])(
    // Parse just the subcommand argument.
    argv.slice(0, 1),
    cwd, config, stdin, stdout, stderr, done
  )
  if (!options) return

  var subcommand = options['<subcommand>']

  if (subcommand) {
    var handler
    try {
      handler = require('./l0-' + subcommand)
    } catch (error) {
      stdout.write('Invalid Subcommand: ' + subcommand)
      return done(1)
    }
    // Split out the subcommand argument.
    argv.splice(0, 1)
    handler(argv, cwd, config, stdin, stdout, stderr, done)
  } else {
    stdout.write([
      DESCRIPTION,
      '',
      'Usage: licensezero [<subcommand>]',
      '',
      'Subcommands:'
    ].concat(
      Object.keys(require('../package.json').bin)
        .sort()
        .filter(function (key) {
          return key.indexOf('l0-') === 0
        })
        .map(function (key) {
          return '  ' + key.replace('l0-', '')
        })
    ).join('\n') + '\n')
  }
}
