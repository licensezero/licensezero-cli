var helper = require('./helper')
var noArgumentsUsage = require('./no-arguments-usage')
var runSeries = require('run-series')
var tape = require('tape')

noArgumentsUsage('identify', 'identify')

tape('identify', function (test) {
  helper(function (tmp, run, rm) {
    run([
      'identify', 'Test Licensee', 'US-CA', 'test@example.com'
    ], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, '', 'no stderr')
      rm(test)
    })
  })
})

tape('whoami', function (test) {
  helper(function (tmp, run, rm) {
    run([
      'identify', 'Test Licensee', 'US-CA', 'test@example.com'
    ], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      run([
        'whoami'
      ], function (status, stdout, stderr) {
        test.assert(stdout.indexOf('Name: Test Licensee') !== -1)
        test.assert(stdout.indexOf('Jurisdiction: US-CA') !== -1)
        test.assert(stdout.indexOf('E-Mail: test@example.com') !== -1)
        rm(test)
      })
    })
  })
})

tape('identify w/ identical details', function (test) {
  helper(function (tmp, run, rm) {
    var NAME = 'Test Licensee'
    var JURISDICTION = 'US-CA'
    var EMAIL = 'test@example.com'
    runSeries([
      function (done) {
        run([
          'identify', NAME, JURISDICTION, EMAIL
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run([
          'identify', NAME, JURISDICTION, EMAIL
        ], function (status, stdout, stderr) {
          test.equal(status, 1, 'exit 1')
          test.equal(stdout, '', 'no stdout')
          test.equal(stderr, 'Error: identical to existing identity\n', 'identical')
          done()
        })
      }
    ], function () {
      rm(test)
    })
  })
})

tape('identify w/ invalid name', function (test) {
  helper(function (tmp, run, rm) {
    run([
      'identify', '', 'US-CA', 'test@example.com'
    ], function (status, stdout, stderr) {
      test.equal(status, 1, 'exit 1')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, 'Error: invalid name\n', 'invalid')
      rm(test)
    })
  })
})

tape('identify w/ invalid jurisdiction', function (test) {
  helper(function (tmp, run, rm) {
    run([
      'identify', 'Test Licensee', 'US-XX', 'test@example.com'
    ], function (status, stdout, stderr) {
      test.equal(status, 1, 'exit 1')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, 'Error: invalid jurisdiction\n', 'invalid')
      rm(test)
    })
  })
})

tape('identify w/ invalid e-mail', function (test) {
  helper(function (tmp, run, rm) {
    run([
      'identify', 'Test Licensee', 'US-CA', 'blah'
    ], function (status, stdout, stderr) {
      test.equal(status, 1, 'exit 1')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, 'Error: invalid email\n', 'invalid')
      rm(test)
    })
  })
})
