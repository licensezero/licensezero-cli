module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var url = options['<URL>']

  var https = require('https')
  https
    .request(url)
    .once('error', done)
    .once('response', function (response) {
      if (response.statusCode !== 200) {
        return done('server responded ' + response.statusCode)
      }
      var simpleConcat = require('simple-concat')
      simpleConcat(response, function (error, buffer) {
        if (error) return done(error)
        var parseJSON = require('json-parse-errback')
        parseJSON(buffer, function (error, parsed) {
          if (error) return done(error)
          if (!Array.isArray(parsed.licenses)) {
            return done('invalid licenses bundle')
          }
          var importLicense = require('../import/license')
          var formatError = require('./format-error')
          var anyError = false
          var runSeries = require('run-series')
          runSeries(
            parsed.licenses.map(function (license) {
              return function (done) {
                importLicense(config, license, function (error, summary) {
                  if (error) {
                    stderr.write(formatError(error))
                    anyError = true
                  } else {
                    stdout.write(summary + '\n')
                  }
                  done()
                })
              }
            }),
            function () {
              if (anyError) return done('error importing license')
              done()
            }
          )
        })
      })
    })
    .end()
}
