module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var file = options['<file>']
  var quiet = options['--quiet']

  var readJSONFile = require('../read/json-file')
  readJSONFile(file, function (error, license) {
    if (error) return done(error)
    var importLicense = require('../import-waiver')
    importLicense(config, license, function (error, summary) {
      if (error) return done(error)
      stdout.write(quiet ? '' : (summary + '\n'))
      done()
    })
  })
}
