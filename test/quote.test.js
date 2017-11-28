var NONCOMMERCIAL_PACKAGE = require('./noncommercial-package.json')
var RECIPROCAL_PACKAGE = require('./reciprocal-package.json')
var fs = require('fs')
var helper = require('./helper')
var mkdirp = require('mkdirp')
var noArgumentsUsage = require('./no-arguments-usage')
var path = require('path')
var runSeries = require('run-series')
var tape = require('tape')

var RECIPROCAL_PROJECT_ID = RECIPROCAL_PACKAGE
  .licensezero[0].license.projectID

noArgumentsUsage('quote', 'quote')

tape('quote no deps', function (test) {
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
          'quote', 'test'
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
        run([
          'create-licensee', 'test', 'Test Licensee', 'US-CA', 'team'
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
        run([
          'quote', 'test'
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
  helper(function (tmp, run, rm) {
    require('../request').mocks.push({
      action: 'quote',
      handler: function (payload, callback) {
        callback(null, {
          projects: [
            {
              projectID: RECIPROCAL_PROJECT_ID,
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
        run([
          'create-licensee', 'test', 'Test Licensee', 'US-CA', 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        var file = path.join(tmp, 'node_modules', 'x', 'package.json')
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(RECIPROCAL_PACKAGE))
        ], done)
      },
      function (done) {
        run([
          'quote', 'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout,
            [
              'License Zero Projects: 1',
              'Licensed: 0',
              'Waived: 0',
              'Ignored: 0',
              'Unlicensed: 1',
              'Invalid: 0',
              'Projects:',
              '  - Project: ' + RECIPROCAL_PROJECT_ID,
              '    Description: test project',
              '    Repository: https://example.com',
              '    Terms: reciprocal',
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
  helper(function (tmp, run, rm) {
    require('../request').mocks.push({
      action: 'quote',
      handler: function (payload, callback) {
        callback(null, {
          projects: [
            {
              projectID: RECIPROCAL_PROJECT_ID,
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
        run([
          'create-licensee', 'test', 'Test Licensee', 'US-CA', 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        var file = path.join(tmp, 'node_modules', 'x', 'package.json')
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(RECIPROCAL_PACKAGE))
        ], done)
      },
      function (done) {
        var file = path.join(tmp, 'node_modules', 'y', 'package.json')
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(RECIPROCAL_PACKAGE))
        ], done)
      },
      function (done) {
        run([
          'quote', 'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout,
            [
              'License Zero Projects: 1',
              'Licensed: 0',
              'Waived: 0',
              'Ignored: 0',
              'Unlicensed: 1',
              'Invalid: 0',
              'Projects:',
              '  - Project: ' + RECIPROCAL_PROJECT_ID,
              '    Description: test project',
              '    Repository: https://example.com',
              '    Terms: reciprocal',
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

tape('quote --no-reciprocal one L0-R dep', function (test) {
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
        var file = path.join(tmp, 'node_modules', 'x', 'package.json')
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(RECIPROCAL_PACKAGE))
        ], done)
      },
      function (done) {
        run([
          'quote', 'test', '--no-reciprocal'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout,
            [
              'License Zero Projects: 1',
              'Licensed: 0',
              'Waived: 0',
              'Ignored: 1',
              'Unlicensed: 0',
              'Invalid: 0'
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

tape('quote --no-noncommercial one L0-NC dep', function (test) {
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
        var file = path.join(tmp, 'node_modules', 'x', 'package.json')
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(NONCOMMERCIAL_PACKAGE))
        ], done)
      },
      function (done) {
        run([
          'quote', 'test', '--no-noncommercial'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout,
            [
              'License Zero Projects: 1',
              'Licensed: 0',
              'Waived: 0',
              'Ignored: 1',
              'Unlicensed: 0',
              'Invalid: 0'
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
  helper(function (tmp, run, rm) {
    require('../request').mocks.push({
      action: 'quote',
      handler: function (payload, callback) {
        callback(null, {
          projects: [
            {
              projectID: RECIPROCAL_PROJECT_ID,
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
        run([
          'create-licensee', 'test', 'Test Licensee', 'US-CA', 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        var file = path.join(tmp, 'node_modules', 'x', 'package.json')
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(RECIPROCAL_PACKAGE))
        ], done)
      },
      function (done) {
        var file = path.join(tmp, 'node_modules', 'y', 'package.json')
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(RECIPROCAL_PACKAGE))
        ], done)
      },
      function (done) {
        run([
          'quote', 'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout,
            [
              'License Zero Projects: 1',
              'Licensed: 0',
              'Waived: 0',
              'Ignored: 0',
              'Unlicensed: 1',
              'Invalid: 0',
              'Projects:',
              '  - Project: ' + RECIPROCAL_PROJECT_ID,
              '    Description: test project',
              '    Repository: https://example.com',
              '    Terms: reciprocal',
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
  var RETRACTED = new Date().toISOString()
  helper(function (tmp, run, rm) {
    require('../request').mocks.push({
      action: 'quote',
      handler: function (payload, callback) {
        callback(null, {
          projects: [
            {
              projectID: RECIPROCAL_PROJECT_ID,
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
        run([
          'create-licensee', 'test', 'Test Licensee', 'US-CA', 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        var file = path.join(tmp, 'node_modules', 'x', 'package.json')
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(RECIPROCAL_PACKAGE))
        ], done)
      },
      function (done) {
        run([
          'quote', 'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout,
            [
              'License Zero Projects: 1',
              'Licensed: 0',
              'Waived: 0',
              'Ignored: 0',
              'Unlicensed: 1',
              'Invalid: 0',
              'Projects:',
              '  - Project: ' + RECIPROCAL_PROJECT_ID,
              '    Description: test project',
              '    Repository: https://example.com',
              '    Terms: reciprocal',
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

tape('quote one invalid metadata', function (test) {
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
        var file = path.join(tmp, 'node_modules', 'x', 'package.json')
        var malformed = JSON.parse(JSON.stringify(RECIPROCAL_PACKAGE))
        malformed.licensezero[0].licensorSignature = 'a'.repeat(128)
        runSeries([
          mkdirp.bind(null, path.dirname(file)),
          fs.writeFile.bind(null, file, JSON.stringify(malformed))
        ], done)
      },
      function (done) {
        run([
          'quote', 'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout,
            [
              'License Zero Projects: 1',
              'Licensed: 0',
              'Waived: 0',
              'Ignored: 0',
              'Unlicensed: 0',
              'Invalid: 1'
            ].join('\n') + '\n'
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
