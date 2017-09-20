module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'Sponsor relicensing of a License Zero dependency on two-clause BSD terms.',
    '',
    'Usage:',
    '  l0-sponsor <nickname> <UUID> [--no-open]',
    '  l0-sponsor -h | --help',
    '  l0-sponsor -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.',
    '  -n, --no-open  Do not open the buy page in a browser.'
  ]).apply(null, arguments)
  if (!options) return

  var nickname = options['<nickname>']
  var projectID = options['<UUID>']

  var readLicensee = require('../read/licensee')
  readLicensee(config, nickname, function (error, licensee) {
    /* istanbul ignore if */
    if (error) return done(error)
    var request = require('../request')
    request({
      action: 'sponsor',
      projectID: projectID,
      sponsor: licensee.name,
      jurisdiction: licensee.jurisdiction
    }, function (error, response) {
      /* istanbul ignore if */
      if (error) return done(error)
      var url = 'https://licensezero.com' + response.location
      stdout.write(url + '\n')
      if (!options['--no-open']) {
        var openWebpage = require('../open-webpage')
        openWebpage(url)
      }
      done(0)
    })
  })
}
