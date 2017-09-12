module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'Import a License Zero waiver file.',
    '',
    'Usage:',
    '  l0-import-waiver <file>',
    '  l0-import-waiver -h | --help',
    '  l0-import-waiver -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.',
    '  -q, --quiet    Suppress output.'
  ]).apply(null, arguments)
  if (!options) return

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
