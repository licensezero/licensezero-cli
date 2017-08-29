var helpFlags = require('./help-flags')
var helper = require('./helper')
var noArgumentsUsage = require('./no-arguments-usage')
var runSeries = require('run-series')
var tape = require('tape')
var uuid = require('uuid/v4')
var versionFlags = require('./version-flags')

var createLicensor = require('../bin/l0-create-licensor.js')
var listLicensors = require('../bin/l0-list-licensors.js')
var removeLicensor = require('../bin/l0-remove-licensor.js')

noArgumentsUsage('create', createLicensor)
noArgumentsUsage('remove', removeLicensor)

tape('create licensor', function (test) {
  var licensorID = uuid()
  mockLicensorResponse()
  helper(function (tmp, run, rm) {
    var stdin = run(createLicensor, [
      licensorID
    ], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      rm(test)
    })
    stdin.write('test\n')
  })
})

function mockLicensorResponse () {
  require('../request').mocks.push({
    action: 'licensor',
    handler: function (payload, callback) {
      callback(null, {
        licensorID: payload.licensorID,
        name: 'Test Licensor',
        jurisdiction: 'US-CA',
        publicKey: '',
        products: []
      })
    }
  })
}

helpFlags('create', createLicensor)
helpFlags('list', listLicensors)
helpFlags('remove', removeLicensor)

versionFlags('create', createLicensor)
versionFlags('list', listLicensors)
versionFlags('remove', removeLicensor)

tape('create w/ invalid id', function (test) {
  helper(function (tmp, run, rm) {
    run(createLicensor, [
      'blah'
    ], function (status, stdout, stderr) {
      test.equal(status, 1, 'exit 1')
      test.equal(stdout, '', 'no stdout')
      test.equal(stderr, 'Error: invalid licensor id\n', 'no stderr')
      rm(test)
    })
  })
})

tape('list w/o licensors', function (test) {
  helper(function (tmp, run, rm) {
    run(listLicensors, [
    ], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      rm(test)
    })
  })
})

tape('create, list', function (test) {
  var licensorID = uuid()
  mockLicensorResponse()
  helper(function (tmp, run, rm) {
    runSeries([
      function (done) {
        var stdin = run(createLicensor, [
          licensorID
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
        stdin.end('test')
      },
      function (done) {
        run(listLicensors, [], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(stdout, licensorID + '\n', 'lists created')
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
  var licensorID = uuid()
  mockLicensorResponse()
  helper(function (tmp, run, rm) {
    runSeries([
      function (done) {
        var stdin = run(createLicensor, [
          licensorID
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
        stdin.end('test')
      },
      function (done) {
        run(removeLicensor, [
          licensorID
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run(listLicensors, [
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
