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
      done(error.message + '\n')
      return false
    }

    if (options['--help']) {
      stdout.write(usage)
      done()
      return false
    }

    if (options['--version']) {
      stdout.write(require('../package.json').version + '\n')
      done()
      return false
    }

    return options
  }
}
