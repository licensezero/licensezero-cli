var helper = require('./helper')
var tape = require('tape')

module.exports = function (name, cli) {
  tape(name + ' --version', function (test) {
    helper(function (tmp, run, rm) {
      run(cli, [
        '--version'
      ], function (status, stdout, stderr) {
        test.equal(status, 0, 'exit 0')
        test.assert(
          stdout.includes(require('../package.json').version),
          'version'
        )
        test.equal(stderr, '', 'no stderr')
        rm(test)
      })
    })
  })

  tape(name + ' -v', function (test) {
    helper(function (tmp, run, rm) {
      run(cli, [
        '--version'
      ], function (status, stdout, stderr) {
        test.equal(status, 0, 'exit 0')
        test.assert(
          stdout.includes(require('../package.json').version),
          'version'
        )
        test.equal(stderr, '', 'no stderr')
        rm(test)
      })
    })
  })
}
