var fs = require('fs')
var helpFlags = require('./help-flags')
var helper = require('./helper')
var mkdirp = require('mkdirp')
var noArgumentsUsage = require('./no-arguments-usage')
var path = require('path')
var runSeries = require('run-series')
var tape = require('tape')
var versionFlags = require('./version-flags')

var createIdentity = require('../bin/l0-create-identity.js')
var bom = require('../bin/l0-bom.js')

helpFlags('bom', bom)
noArgumentsUsage('bom', bom)
versionFlags('bom', bom)

tape('bom no deps', function (test) {
  helper(function (tmp, run, rm) {
    runSeries([
      function (done) {
        run(createIdentity, [
          'test', 'Test Licensee', 'US-CA', 'team'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          done()
        })
      },
      function (done) {
        run(bom, [
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

tape('bom non-l0 dep', function (test) {
  helper(function (tmp, run, rm) {
    runSeries([
      function (done) {
        run(createIdentity, [
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
        run(bom, [
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

tape('bom one l0 dep', function (test) {
  var PRODUCT_ID = '76809c77-9bb3-4316-a7fd-29bdadb0c475'
  helper(function (tmp, run, rm) {
    require('../request').mocks.push({
      action: 'quote',
      handler: function (payload, callback) {
        callback(null, {
          products: [
            {
              productID: PRODUCT_ID,
              description: 'test product',
              repository: 'https://example.com',
              grace: 180,
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
        run(createIdentity, [
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
          fs.writeFile.bind(null, file, JSON.stringify({
            name: 'x',
            version: '1.0.0',
            licensezero: {
              metadata: {
                productID: PRODUCT_ID
              }
            }
          }))
        ], done)
      },
      function (done) {
        run(bom, [
          'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout,
            [
              'License Zero Products: 1',
              'Licensed: 0',
              'Waived: 0',
              'Unlicensed: 1',
              'Products:',
              '  - Product: ' + PRODUCT_ID,
              '    Description: test product',
              '    Repository: https://example.com',
              '    Grace Period: 180 calendar days',
              '    Licensor: Test Licensor [US-CA]',
              '    Price: $15.00 (Team License)',
              'Total: $15.00'
            ].join('\n'),
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

tape('bom one retracted l0 dep', function (test) {
  var PRODUCT_ID = '76809c77-9bb3-4316-a7fd-29bdadb0c475'
  var RETRACTED = new Date().toISOString()
  helper(function (tmp, run, rm) {
    require('../request').mocks.push({
      action: 'quote',
      handler: function (payload, callback) {
        callback(null, {
          products: [
            {
              productID: PRODUCT_ID,
              retracted: RETRACTED,
              description: 'test product',
              repository: 'https://example.com',
              grace: 180,
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
        run(createIdentity, [
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
          fs.writeFile.bind(null, file, JSON.stringify({
            name: 'x',
            version: '1.0.0',
            licensezero: {
              metadata: {
                productID: PRODUCT_ID
              }
            }
          }))
        ], done)
      },
      function (done) {
        run(bom, [
          'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout,
            [
              'License Zero Products: 1',
              'Licensed: 0',
              'Waived: 0',
              'Unlicensed: 1',
              'Products:',
              '  - Product: ' + PRODUCT_ID,
              '    Description: test product',
              '    Repository: https://example.com',
              '    Grace Period: 180 calendar days',
              '    Licensor: Test Licensor [US-CA]',
              '    Retracted: ' + RETRACTED,
              'Total: $0.00'
            ].join('\n'),
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
