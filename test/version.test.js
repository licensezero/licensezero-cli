var helper = require('./helper')
var tape = require('tape')

tape('--version', function (test) {
  helper(function (tmp, run, rm) {
    run(['--version'], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      test.assert(stdout.indexOf('.') > -1, 'shows version')
      rm(test)
    })
  })
})

tape('-v', function (test) {
  helper(function (tmp, run, rm) {
    run(['-v'], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      test.assert(stdout.indexOf('.') > -1, 'shows version')
      rm(test)
    })
  })
})
