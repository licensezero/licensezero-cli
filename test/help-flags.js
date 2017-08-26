var helper = require('./helper')
var tape = require('tape')

module.exports = function (name, cli) {
  tape(name + ' --help', function (test) {
    helper(function (tmp, run, rm) {
      run(cli, [
        '--help'
      ], function (status, stdout, stderr) {
        test.equal(status, 0, 'exit 0')
        test.assert(stdout.includes('Usage:'), 'usage')
        test.assert(stdout.includes('Options:'), 'options')
        test.equal(stderr, '', 'no stderr')
        rm(test)
      })
    })
  })

  tape(name + ' -h', function (test) {
    helper(function (tmp, run, rm) {
      run(cli, [
        '-h'
      ], function (status, stdout, stderr) {
        test.equal(status, 0, 'exit 0')
        test.assert(stdout.includes('Usage:'), 'usage')
        test.assert(stdout.includes('Options:'), 'options')
        test.equal(stderr, '', 'no stderr')
        rm(test)
      })
    })
  })
}
