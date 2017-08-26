module.exports = function (usage) {
  usage = usage.join('\n') + '\n'
  return function (argv, cwd, config, stdout, stderr, done) {
    try {
      var options = require('docopt').docopt(usage, {
        argv: argv,
        exit: false,
        help: false
      })
    } catch (error) {
      stderr.write(error.message + '\n')
      done(1)
      return false
    }

    if (options['--help']) {
      stdout.write(usage)
      done(0)
      return false
    }

    if (options['--version']) {
      stdout.write(require('../package.json').version + '\n')
      done(0)
      return false
    }

    return options
  }
}
