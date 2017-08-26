var helper = require('./helper')
var runSeries = require('run-series')
var tape = require('tape')

var createIdentity = require('../bin/l0-create-identity.js')
var listIdentities = require('../bin/l0-list-identities.js')
var removeIdentity = require('../bin/l0-remove-identity.js')

noArgumentsUsage('create', createIdentity)
noArgumentsUsage('remove', removeIdentity)

function noArgumentsUsage (name, cli) {
  tape(name + ' usage', function (test) {
    helper(function (tmp, run, rm) {
      run(cli, [
      ], function (status, stdout, stderr) {
        test.equal(status, 1, 'exit 1')
        test.equal(stdout, '', 'no stdout')
        test.assert(stderr.includes('Usage:'), 'usage')
        rm(test)
      })
    })
  })
}

tape('create identity', function (test) {
  helper(function (tmp, run, rm) {
    run(createIdentity, [
      'test', 'Test Licensee', 'US-CA'
    ], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, '', 'no stderr')
      rm(test)
    })
  })
})

showsHelp('create', createIdentity)
showsHelp('list', listIdentities)
showsHelp('remove', removeIdentity)

function showsHelp (name, cli) {
  tape(name + ' help', function (test) {
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
}

showsVersion('create', createIdentity)
showsVersion('list', listIdentities)
showsVersion('remove', removeIdentity)

function showsVersion (name, cli) {
  tape(name + ' version', function (test) {
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

tape('create w/ invalid nickname', function (test) {
  helper(function (tmp, run, rm) {
    run(createIdentity, [
      'has space', 'Test Licensee', 'US-CA'
    ], function (status, stdout, stderr) {
      test.equal(status, 1, 'exit 1')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, 'invalid nickname\n', 'no stderr')
      rm(test)
    })
  })
})

tape('create w/ taken nickname', function (test) {
  helper(function (tmp, run, rm) {
    runSeries([
      function (done) {
        run(createIdentity, [
          'test', 'First Licensee', 'US-CA'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run(createIdentity, [
          'test', 'Second Licensee', 'US-CA'
        ], function (status, stdout, stderr) {
          test.equal(status, 1, 'exit 1')
          test.equal(stdout, '', 'no stdout')
          test.equal(stderr, 'nickname taken\n', 'no stderr')
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
        run(createIdentity, [
          'apple', NAME, JURISDICTION
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run(createIdentity, [
          'orange', NAME, JURISDICTION
        ], function (status, stdout, stderr) {
          test.equal(status, 1, 'exit 1')
          test.equal(stdout, '', 'no stdout')
          test.equal(stderr, 'identical to apple\n', 'identical')
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
    run(createIdentity, [
      'test', '', 'US-CA'
    ], function (status, stdout, stderr) {
      test.equal(status, 1, 'exit 1')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, 'invalid name\n', 'invalid')
      rm(test)
    })
  })
})

tape('create w/ invalid jurisdiction', function (test) {
  helper(function (tmp, run, rm) {
    run(createIdentity, [
      'test', 'Test Licensee', 'US-XX'
    ], function (status, stdout, stderr) {
      test.equal(status, 1, 'exit 1')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, 'invalid jurisdiction\n', 'invalid')
      rm(test)
    })
  })
})

tape('list w/o identities', function (test) {
  helper(function (tmp, run, rm) {
    run(listIdentities, [
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
        run(createIdentity, [
          'test', 'Test Licensee', 'US-CA'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run(listIdentities, [], function (status, stdout, stderr) {
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
        run(createIdentity, [
          'test', 'Test Licensee', 'US-CA'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run(removeIdentity, [
          'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run(listIdentities, [
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
