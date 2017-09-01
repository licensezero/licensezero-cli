// TODO: waiver import

module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'Import a License Zero waiver or license file.',
    '',
    'Usage:',
    '  l0-import <file>',
    '  l0-import -h | --help',
    '  l0-import -v | --version',
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
    var importLicense = require('../import-license')
    importLicense(config, license, function (error, summary) {
      if (error) return done(error)
      stdout.write(quiet ? '' : (summary + '\n'))
      done()
    })
  })
}
