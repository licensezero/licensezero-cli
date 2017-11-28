var fs = require('fs')
var helper = require('./helper')
var noArgumentsUsage = require('./no-arguments-usage')
var path = require('path')
var runSeries = require('run-series')
var tape = require('tape')
var uuid = require('uuid/v4')

noArgumentsUsage('create', 'create-licensor')
noArgumentsUsage('remove', 'remove-licensor')

tape('register licensor', function (test) {
  require('../request').mocks.push({
    action: 'register',
    handler: function (payload, callback) {
      callback(null, {})
    }
  })
  helper(function (tmp, run, rm) {
    var stdin = run([
      'register-licensor', 'test@example.com', 'Test Licensor', 'US-CA'
    ], function (status, stdout, stderr) {
      test.equal(status, 0, 'exit 0')
      rm(test)
    })
    stdin.write('yes\n')
  })
})

tape('create licensor', function (test) {
  var licensorID = uuid()
  mockLicensorResponse()
  helper(function (tmp, run, rm) {
    var stdin = run([
      'create-licensor', licensorID
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
        projects: []
      })
    }
  })
}

tape('create w/ invalid id', function (test) {
  helper(function (tmp, run, rm) {
    run([
      'create-licensor', 'blah'
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
    run([
      'list-licensors'
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
        var stdin = run([
          'create-licensor', licensorID
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
        stdin.write('test\n')
      },
      function (done) {
        run(['list-licensors'], function (status, stdout, stderr) {
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
        var stdin = run([
          'create-licensor', licensorID
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
        stdin.write('test\n')
      },
      function (done) {
        run([
          'remove-licensor', licensorID
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run([
          'list-licensors'
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

tape('license', function (test) {
  var licensorID = uuid()
  mockLicensorResponse()
  mockOfferAcceptance()
  helper(function (tmp, run, rm) {
    var packageJSON = path.join(tmp, 'package.json')
    var projectID
    runSeries([
      function runCreatePackage (done) {
        fs.writeFile(packageJSON, JSON.stringify({
          name: 'l0-test',
          description: 'test package',
          version: '1.0.0',
          repository: 'https://github.com/licensezero/test'
        }), done)
      },
      function runCreateLicensor (done) {
        var stdin = run([
          'create-licensor', licensorID
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'create-licensor exit 0')
          done()
        })
        stdin.write('test\n')
      },
      function runOffer (done) {
        var stdin = run([
          'offer',
          '-s', '1000',
          '-t', '1000',
          '-c', '1000',
          '-e', '1000',
          '-l', licensorID
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'offer exit 0')
          var match = /Project ID: (\S+)/.exec(stdout)
          projectID = match[1]
          mockLicenseRequest(licensorID, projectID)
          done()
        })
        // Accept terms of service.
        stdin.write('Y\n')
      },
      function runLicense (done) {
        run([
          'license', projectID, '--noncommercial'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'license exit 0')
          done()
        })
      },
      function checkPackageJSON (done) {
        fs.readFile(packageJSON, function (error, buffer) {
          if (error) return done(error)
          var data = JSON.parse(buffer)
          test.assert(
            data.hasOwnProperty('licensezero'),
            'package.json .licensezero'
          )
          test.assert(
            Array.isArray(data.licensezero),
            'package.json .licensezero Array'
          )
          done()
        })
      },
      function checkLICENSE (done) {
        var file = path.join(tmp, 'LICENSE')
        fs.readFile(file, function (error, buffer) {
          if (error) return done(error)
          test.assert(
            buffer.toString().includes('License Zero Public License'),
            'LICENSE'
          )
          done()
        })
      }
    ], function () {
      rm(test)
    })
  })
})

function mockOfferAcceptance () {
  require('../request').mocks.push({
    action: 'offer',
    handler: function (payload, callback) {
      callback(null, {projectID: uuid()})
    }
  })
}

function mockLicenseRequest (licensorID, projectID) {
  require('../request').mocks.push({
    action: 'project',
    handler: function (payload, callback) {
      callback(null, {
        licensor: {licensorID: licensorID},
        projectID: projectID
      })
    }
  })
  require('../request').mocks.push({
    action: 'public',
    handler: function (payload, callback) {
      callback(null, {
        license: {
          document: 'License Zero Public License\n...\n',
          licensorSignature: 'LICENSOR SIG',
          agentSignature: 'AGENT SIG'
        },
        metadata: {
          license: 'SEE LICENSE IN LICENSE',
          licensezero: {
            license: {
              projectID: projectID,
              licensorID: licensorID
            },
            licensorSignature: 'LICENSOR SIG',
            agentSignature: 'AGENT SIG'
          }
        }
      })
    }
  })
}
