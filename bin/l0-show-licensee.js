module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'Show information about a licensee licensee.',
    '',
    'Usage:',
    '  l0-show-licensee <nickname>',
    '  l0-show-licensee -h | --help',
    '  l0-show-licensee -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

  var nickname = options['<nickname>']

  // TODO: list waivers

  var readLicensee = require('../read/licensee')
  readLicensee(config, nickname, function (error, licensee) {
    if (error) return done(error)
    var readLicenses = require('../read/licenses')
    readLicenses(config, nickname, function (error, licenses) {
      if (error) return done(error)
      var lamos = require('lamos')
      stdout.write(
        lamos.stringify({
          'Nickname': licensee.nickname,
          'Legal Name': licensee.name,
          'Jurisdiction': licensee.jurisdiction,
          'License Tier': licensee.tier,
          'Licenses': licenses.length === 0
            ? 'None'
            : licenses.map(function (license) {
              return license.projectID
            })
        }) + '\n'
      )
      return done()
    })
  })
}
