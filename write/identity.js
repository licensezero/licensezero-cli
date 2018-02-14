var identitiesPath = require('../paths/identities')
var mkdirp = require('mkdirp')
var path = require('path')
var readIdentities = require('../read/identities')
var runSeries = require('run-series')
var writeJSONFile = require('./json-file')

module.exports = function (config, identity, callback) {
  var file = identitiesPath(config)
  runSeries(
    [
      mkdirp.bind(null, path.dirname(file)),
      function (done) {
        readIdentities(config, function (error, identities) {
          /* istanbul ignore if */
          if (error) return done(error)
          identities.unshift(identity)
          writeJSONFile(file, identities, done)
        })
      }
    ],
    callback
  )
}
