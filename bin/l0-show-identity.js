module.exports = function (argv, cwd, config, stdout, stderr, done) {
  var options = require('./usage')([
    'Show information about a licensee identity.',
    '',
    'Usage:',
    '  l0-show-identity <nickname>',
    '  l0-show-identity -h | --help',
    '  l0-show-identity -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

  var nickname = options['<nickname>']

  // TODO: list waivers

  var ecb = require('ecb')
  var readIdentity = require('../read/identity')
  readIdentity(config, nickname, ecb(fail, function (identity) {
    var readLicenses = require('../read/licenses')
    readLicenses(config, nickname, ecb(fail, function (licenses) {
      var lamos = require('lamos')
      stdout.write(
        lamos.stringify({
          'Nickname': identity.nickname,
          'Legal Name': identity.name,
          'Jurisdiction': identity.jurisdiction,
          'License Tier': identity.tier,
          'Licenses': licenses.length === 0
            ? 'None'
            : licenses.map(function (license) {
              return license.productID
            })
        }) + '\n'
      )
      return done(0)
    }))
  }))

  /* istanbul ignore next */
  function fail (error) {
    stderr.write(error.message + '\n')
    done(1)
  }
}
