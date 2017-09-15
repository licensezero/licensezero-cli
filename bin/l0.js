module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  stdout.write([
    'License Zero command-line interface.',
    '',
    'Interact with License Zero using subcommands,',
    'all of which begin with "l0":'
  ].concat(
    Object.keys(require('../package.json').bin)
      .sort()
      .map(function (key) {
        return '- ' + key
      })
  ).join('\n') + '\n')
}
