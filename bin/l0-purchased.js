module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'Download and import a bundle of License Zero private licenses.',
    '',
    'Usage:',
    '  l0-purchased <URL>',
    '  l0-purchased -h | --help',
    '  l0-purchased -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

  var url = options['<URL>']

  var https = require('https')
  https.request(url)
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
          var importLicense = require('../import-license')
          var formatError = require('./format-error')
          var anyError = false
          var runSeries = require('run-series')
          runSeries(parsed.licenses.map(function (license) {
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
          }), function () {
            if (anyError) return done('error importing license')
            done()
          })
        })
      })
    })
    .end()
}
