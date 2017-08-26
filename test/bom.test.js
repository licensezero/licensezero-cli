var helpFlags = require('./help-flags')
var helper = require('./helper')
var noArgumentsUsage = require('./no-arguments-usage')
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
