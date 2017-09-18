/* eslint-disable max-len */
var USAGE = [
  'Offer paid licenses through licensezero.com.',
  '',
  'Usage:',
  '  l0-offer -s CENTS -t CENTS -c CENTS -e CENTS [-r CENTS] [-l UUID]',
  '  l0-offer -h | --help',
  '  l0-offer -v | --version',
  '',
  'Options:',
  '  -h, --help                    Print this screen to standard output.',
  '  -v, --version                 Print version to standard output.',
  '  -l UUID, --licensor UUID      Licensor offering licenses.',
  '  -s CENTS, --solo CENTS        Price for solo licenses, in cents.',
  '  -t CENTS, --team CENTS        Price for team licenses, in cents.',
  '  -c CENTS, --company CENTS     Price for company licenses, in cents.',
  '  -e CENTS, --enterprise CENTS  Price for enterprise licenses, in cents.',
  '  -r CENTS, --relicense CENTS   Price for relicensing, in cents.'
]
/* eslint-enable max-len */

module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')(USAGE).apply(null, arguments)
  if (!options) return

  var readJSONFile = require('../read/json-file')
  var path = require('path')
  readJSONFile(path.join(cwd, 'package.json'), function (error, packageData) {
    /* istanbul ignore next */
    if (error) return done(error)
    if (typeof packageData.repository !== 'string') {
      return done(new Error('package.json missing repository property'))
    }
    var hostedGitInfo = require('hosted-git-info')
    var repository = hostedGitInfo.fromUrl(packageData.repository).browse()
    var licensorID = options['--licensor']
    var readLicensor = require('../read/licensor')
    var readOnlyLicensor = require('../read/only-licensor')
    var licensorFunction = options['--licensor']
      ? readLicensor.bind(null, config, licensorID)
      : readOnlyLicensor.bind(null, config)
    licensorFunction(function (error, licensor) {
      /* istanbul ignore next */
      if (error) return done(error)
      var agreeToTerms = require('../agree-to-terms')
      agreeToTerms(stdin, stdout, true, function (error, accepted) {
        /* istanbul ignore if */
        if (error) return done(error)
        if (!accepted) return done('must accept terms')
        var request = require('../request')
        var pricing = {
          solo: parseInt(options['--solo']),
          team: parseInt(options['--team']),
          company: parseInt(options['--company']),
          enterprise: parseInt(options['--enterprise'])
        }
        if (options['--relicense']) {
          pricing.relicense = parseInt(options['--relicense'])
        }
        var payload = {
          action: 'offer',
          licensorID: licensor.licensorID,
          token: licensor.token,
          repository: repository,
          pricing: pricing,
          description: packageData.description,
          terms: (
            'I agree to the agency terms at ' +
            'https://licensezero.com/terms/agency.'
          )
        }
        request(payload, function (error, response) {
          /* istanbul ignore if */
          if (error) return done(error)
          stdout.write('Project ID: ' + response.projectID + '\n')
          done()
        })
      })
    })
  })
}
