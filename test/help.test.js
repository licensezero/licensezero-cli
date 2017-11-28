var helper = require('./helper')
var tape = require('tape')

tape('--help', function (test) {
  helper(function (tmp, run, rm) {
    run([
      '--help'
    ], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      test.assert(stdout.indexOf('Usage:') > -1, 'shows usage')
      rm(test)
    })
  })
})

tape('-h', function (test) {
  helper(function (tmp, run, rm) {
    run([
      '-h'
    ], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      test.assert(stdout.indexOf('Usage:') > -1, 'shows usage')
      rm(test)
    })
  })
})

tape('no arguments', function (test) {
  helper(function (tmp, run, rm) {
    run([], function (status, stdout, stderr) {
      test.equal(status, 1, 'exit 1')
      test.assert(stderr.indexOf('Usage:') > -1, 'usage on stderr')
      rm(test)
    })
  })
})
