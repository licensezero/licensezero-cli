module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var file = options['<file>']

  var readJSONFile = require('../read/json-file')
  readJSONFile(file, function (error, license) {
    if (error) return done(error)
    var importWaiver = require('../import/waiver')
    importWaiver(config, license, function (error, summary) {
      if (error) return done(error)
      stdout.write(summary + '\n')
      done()
    })
  })
}
