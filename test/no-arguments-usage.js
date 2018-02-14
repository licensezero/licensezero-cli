var tape = require('tape')
var helper = require('./helper')

module.exports = function (name, subcommand) {
  tape(name + ' usage', function (test) {
    helper(function (tmp, run, rm) {
      run([subcommand], function (status, stdout, stderr) {
        test.equal(status, 1, 'exit 1')
        test.equal(stdout, '', 'no stdout')
        test.assert(stderr.includes('Usage:'), 'usage')
        rm(test)
      })
    })
  })
}
