var fs = require('fs')
var helper = require('./helper')
var mkdirp = require('mkdirp')
var path = require('path')
var runSeries = require('run-series')
var tape = require('tape')

var createLicensee = require('../bin/l0-create-licensee.js')
var buy = require('../bin/l0-buy.js')

tape('buy one l0 dep', function (test) {
  var PRODUCT_ID = '76809c77-9bb3-4316-a7fd-29bdadb0c475'
  helper(function (tmp, run, rm) {
    require('../request').mocks.push({
      action: 'buy',
      handler: function (payload, callback) {
        callback(null, {location: 'https://licensezero.com/buy/TEST'})
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
        run(buy, [
          'test'
        ], function (status, stdout, stderr) {
          test.equal(status, 0, 'exit 0')
          test.equal(
            stdout, 'https://licensezero.com/buy/TEST\n',
            'location'
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
