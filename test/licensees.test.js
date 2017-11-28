var helper = require('./helper')
var noArgumentsUsage = require('./no-arguments-usage')
var runSeries = require('run-series')
var tape = require('tape')

noArgumentsUsage('create', 'create-licensee')
noArgumentsUsage('remove', 'remove-licensee')

tape('create licensee', function (test) {
  helper(function (tmp, run, rm) {
    run([
      'create-licensee', 'test', 'Test Licensee', 'US-CA', 'team'
    ], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, '', 'no stderr')
      rm(test)
    })
  })
})

tape('create w/ invalid nickname', function (test) {
  helper(function (tmp, run, rm) {
    run([
      'create-licensee', 'has space', 'Test Licensee', 'US-CA', 'team'
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
        run([
          'create-licensee', 'test', 'First Licensee', 'US-CA', 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run([
          'create-licensee', 'test', 'Second Licensee', 'US-CA', 'team'
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
        run([
          'create-licensee', 'apple', NAME, JURISDICTION, 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run([
          'create-licensee', 'orange', NAME, JURISDICTION, 'team'
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
    run([
      'create-licensee', 'test', '', 'US-CA', 'team'
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
    run([
      'create-licensee', 'test', 'Test Licensee', 'US-XX', 'team'
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
    run([
      'create-licensee', 'test', 'Test Licensee', 'US-CA', 'invalid'
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
    run([
      'list-licensees'
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
        run([
          'create-licensee', 'test', 'Test Licensee', 'US-CA', 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run([
          'list-licensees'
        ], function (status, stdout, stderr) {
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
        run([
          'create-licensee', 'test', 'Test Licensee', 'US-CA', 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run([
          'remove-licensee', 'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run([
          'list-licensees'
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
