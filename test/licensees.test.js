var helpFlags = require('./help-flags')
var helper = require('./helper')
var noArgumentsUsage = require('./no-arguments-usage')
var runSeries = require('run-series')
var tape = require('tape')
var versionFlags = require('./version-flags')

var createLicensee = require('../bin/l0-create-licensee.js')
var listLicensees = require('../bin/l0-list-licensees.js')
var removeLicensee = require('../bin/l0-remove-licensee.js')

noArgumentsUsage('create', createLicensee)
noArgumentsUsage('remove', removeLicensee)

tape('create licensee', function (test) {
  helper(function (tmp, run, rm) {
    run(createLicensee, [
      'test', 'Test Licensee', 'US-CA', 'team'
    ], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, '', 'no stderr')
      rm(test)
    })
  })
})

helpFlags('create', createLicensee)
helpFlags('list', listLicensees)
helpFlags('remove', removeLicensee)

versionFlags('create', createLicensee)
versionFlags('list', listLicensees)
versionFlags('remove', removeLicensee)

tape('create w/ invalid nickname', function (test) {
  helper(function (tmp, run, rm) {
    run(createLicensee, [
      'has space', 'Test Licensee', 'US-CA', 'team'
    ], function (status, stdout, stderr) {
      test.equal(status, 1, 'exit 1')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, 'Error: invalid nickname\n', 'no stderr')
      rm(test)
    })
  })
})

tape('create w/ taken nickname', function (test) {
  helper(function (tmp, run, rm) {
    runSeries([
      function (done) {
        run(createLicensee, [
          'test', 'First Licensee', 'US-CA', 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run(createLicensee, [
          'test', 'Second Licensee', 'US-CA', 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 1, 'exit 1')
          test.equal(stdout, '', 'no stdout')
          test.equal(stderr, 'Error: nickname taken\n', 'no stderr')
          done()
        })
      }
    ], function () {
      rm(test)
    })
  })
})

tape('create w/ identical details', function (test) {
  helper(function (tmp, run, rm) {
    var NAME = 'Test Licensee'
    var JURISDICTION = 'US-CA'
    runSeries([
      function (done) {
        run(createLicensee, [
          'apple', NAME, JURISDICTION, 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run(createLicensee, [
          'orange', NAME, JURISDICTION, 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 1, 'exit 1')
          test.equal(stdout, '', 'no stdout')
          test.equal(stderr, 'Error: identical to apple\n', 'identical')
          done()
        })
      }
    ], function () {
      rm(test)
    })
  })
})

tape('create w/ invalid name', function (test) {
  helper(function (tmp, run, rm) {
    run(createLicensee, [
      'test', '', 'US-CA', 'team'
    ], function (status, stdout, stderr) {
      test.equal(status, 1, 'exit 1')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, 'Error: invalid name\n', 'invalid')
      rm(test)
    })
  })
})

tape('create w/ invalid jurisdiction', function (test) {
  helper(function (tmp, run, rm) {
    run(createLicensee, [
      'test', 'Test Licensee', 'US-XX', 'team'
    ], function (status, stdout, stderr) {
      test.equal(status, 1, 'exit 1')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, 'Error: invalid jurisdiction\n', 'invalid')
      rm(test)
    })
  })
})

tape('create w/ invalid tier', function (test) {
  helper(function (tmp, run, rm) {
    run(createLicensee, [
      'test', 'Test Licensee', 'US-CA', 'invalid'
    ], function (status, stdout, stderr) {
      test.equal(status, 1, 'exit 1')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, 'Error: invalid tier\n', 'invalid')
      rm(test)
    })
  })
})

tape('list w/o licensees', function (test) {
  helper(function (tmp, run, rm) {
    run(listLicensees, [
    ], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      rm(test)
    })
  })
})

tape('create, list', function (test) {
  helper(function (tmp, run, rm) {
    runSeries([
      function (done) {
        run(createLicensee, [
          'test', 'Test Licensee', 'US-CA', 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run(listLicensees, [], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(stdout, 'test\n', 'lists created')
          test.equal(stderr, '', 'no stderr')
          done()
        })
      }
    ], function () {
      rm(test)
    })
  })
})

tape('create, remove, list', function (test) {
  helper(function (tmp, run, rm) {
    runSeries([
      function (done) {
        run(createLicensee, [
          'test', 'Test Licensee', 'US-CA', 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run(removeLicensee, [
          'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run(listLicensees, [
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(stdout, '', 'lists none')
          test.equal(stderr, '', 'no stderr')
          done()
        })
      }
    ], function () {
      rm(test)
    })
  })
})
