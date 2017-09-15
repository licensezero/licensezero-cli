var EXAMPLE = require('./example')
var fs = require('fs')
var helpFlags = require('./help-flags')
var helper = require('./helper')
var mkdirp = require('mkdirp')
var noArgumentsUsage = require('./no-arguments-usage')
var path = require('path')
var runSeries = require('run-series')
var tape = require('tape')
var versionFlags = require('./version-flags')

var createLicensee = require('../bin/l0-create-licensee.js')
var quote = require('../bin/l0-quote.js')

helpFlags('quote', quote)
noArgumentsUsage('quote', quote)
versionFlags('quote', quote)

tape('quote no deps', function (test) {
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
        run(quote, [
          'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout, 'No License Zero dependencies found.\n',
            'none found'
          )
          test.equal(stderr, '', 'no stderr')
          done()
        })
      }
    ], function () {
      rm(test)
    })
  })
})

tape('quote non-l0 dep', function (test) {
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
        fs.writeFile(
          path.join(tmp, 'node_modules', 'x', 'package.json'),
          JSON.stringify({
            name: 'x',
            version: '1.0.0'
          }),
          done
        )
      },
      function (done) {
        run(quote, [
          'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout, 'No License Zero dependencies found.',
            'none found'
          )
          test.equal(stderr, '', 'no stderr')
          done()
        })
      }
    ], function () {
      rm(test)
    })
  })
})

tape('quote one l0 dep', function (test) {
  var PROJECT_ID = '76809c77-9bb3-4316-a7fd-29bdadb0c475'
  helper(function (tmp, run, rm) {
    require('../request').mocks.push({
      action: 'quote',
      handler: function (payload, callback) {
        callback(null, {
          projects: [
            {
              projectID: PROJECT_ID,
              description: 'test project',
              repository: 'https://example.com',
              licensor: {
                name: 'Test Licensor',
                jurisdiction: 'US-CA'
              },
              pricing: {
                solo: 1000,
                team: 1500,
                company: 2000,
                enterprise: 3000
              }
            }
          ]
        })
      }
    })
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
        var file = path.join(tmp, 'node_modules', 'x', 'package.json')
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(EXAMPLE))
        ], done)
      },
      function (done) {
        run(quote, [
          'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout,
            [
              'License Zero Projects: 1',
              'Licensed: 0',
              'Waived: 0',
              'Unlicensed: 1',
              'Invalid: 0',
              'Projects:',
              '  - Project: ' + PROJECT_ID,
              '    Description: test project',
              '    Repository: https://example.com',
              '    Licensor: Test Licensor [US-CA]',
              '    Price: $15.00 (Team License)',
              'Total: $15.00'
            ].join('\n') + '\n',
            'none found'
          )
          test.equal(stderr, '', 'no stderr')
          done()
        })
      }
    ], function () {
      rm(test)
    })
  })
})

tape('quote one duplicate l0 dep', function (test) {
  var PROJECT_ID = '76809c77-9bb3-4316-a7fd-29bdadb0c475'
  helper(function (tmp, run, rm) {
    require('../request').mocks.push({
      action: 'quote',
      handler: function (payload, callback) {
        callback(null, {
          projects: [
            {
              projectID: PROJECT_ID,
              description: 'test project',
              repository: 'https://example.com',
              licensor: {
                name: 'Test Licensor',
                jurisdiction: 'US-CA'
              },
              pricing: {
                solo: 1000,
                team: 1500,
                company: 2000,
                enterprise: 3000
              }
            }
          ]
        })
      }
    })
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
        var file = path.join(tmp, 'node_modules', 'x', 'package.json')
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(EXAMPLE))
        ], done)
      },
      function (done) {
        var file = path.join(tmp, 'node_modules', 'y', 'package.json')
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(EXAMPLE))
        ], done)
      },
      function (done) {
        run(quote, [
          'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout,
            [
              'License Zero Projects: 1',
              'Licensed: 0',
              'Waived: 0',
              'Unlicensed: 1',
              'Invalid: 0',
              'Projects:',
              '  - Project: ' + PROJECT_ID,
              '    Description: test project',
              '    Repository: https://example.com',
              '    Licensor: Test Licensor [US-CA]',
              '    Price: $15.00 (Team License)',
              'Total: $15.00'
            ].join('\n') + '\n',
            'one found'
          )
          test.equal(stderr, '', 'no stderr')
          done()
        })
      }
    ], function () {
      rm(test)
    })
  })
})

tape('quote one retracted l0 dep', function (test) {
  var PROJECT_ID = '76809c77-9bb3-4316-a7fd-29bdadb0c475'
  var RETRACTED = new Date().toISOString()
  helper(function (tmp, run, rm) {
    require('../request').mocks.push({
      action: 'quote',
      handler: function (payload, callback) {
        callback(null, {
          projects: [
            {
              projectID: PROJECT_ID,
              retracted: RETRACTED,
              description: 'test project',
              repository: 'https://example.com',
              licensor: {
                name: 'Test Licensor',
                jurisdiction: 'US-CA'
              },
              pricing: {
                solo: 1000,
                team: 1500,
                company: 2000,
                enterprise: 3000
              }
            }
          ]
        })
      }
    })
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
        var file = path.join(tmp, 'node_modules', 'x', 'package.json')
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(EXAMPLE))
        ], done)
      },
      function (done) {
        run(quote, [
          'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout,
            [
              'License Zero Projects: 1',
              'Licensed: 0',
              'Waived: 0',
              'Unlicensed: 1',
              'Invalid: 0',
              'Projects:',
              '  - Project: ' + PROJECT_ID,
              '    Description: test project',
              '    Repository: https://example.com',
              '    Licensor: Test Licensor [US-CA]',
              '    Retracted: ' + RETRACTED,
              'Total: $0.00'
            ].join('\n') + '\n',
            'none found'
          )
          test.equal(stderr, '', 'no stderr')
          done()
        })
      }
    ], function () {
      rm(test)
    })
  })
})
