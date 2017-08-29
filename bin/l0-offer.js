/* eslint-disable max-len */
var USAGE = [
  'Offer paid licenses through licensezero.com.',
  '',
  'Usage:',
  '  l0-offer -s CENTS -t CENTS -c CENTS -e CENTS -g DAYS [-l ID]',
  '  l0-offer -h | --help',
  '  l0-offer -v | --version',
  '',
  'Options:',
  '  -h, --help                    Print this screen to standard output.',
  '  -v, --version                 Print version to standard output.',
  '  -l ID, --licensor ID          Licensor offering licenses.',
  '  -s CENTS, --solo CENTS        Price for solo licenses, in cents.',
  '  -t CENTS, --team CENTS        Price for team licenses, in cents.',
  '  -c CENTS, --company CENTS     Price for company licenses, in cents.',
  '  -e CENTS, --enterprise CENTS  Price for enterprise licenses, in cents.',
  '  -g DAYS, --grace DAYS         Grace period, in calendar days.'
]
/* eslint-enable max-len */

module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')(USAGE).apply(null, arguments)
  if (!options) return

  var readJSONFile = require('../read/json-file')
  var path = require('path')
  readJSONFile(path.join(cwd, 'package.json'), function (error, data) {
    /* istanbul ignore next */
    if (error) return done(error)
    var normalizePackageData = require('normalize-package-data')
    normalizePackageData(data)
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
      agreeToTerms(stdin, stdout, function (error, accepted) {
        if (error) return done(error)
        if (!accepted) return done('must accept terms')
        var request = require('../request')
        request({
          action: 'offer',
          licensorID: licensorID,
          password: licensor.password,
          repository: data.repository,
          pricing: {
            solo: parseInt(options['--solo']),
            team: parseInt(options['--team']),
            company: parseInt(options['--company']),
            enterprise: parseInt(options['--enterprise'])
          },
          description: data.description,
          grace: parseInt(data.grace),
          terms: 'I agree to the latest published terms of service.'
        }, function (error, response) {
          if (error) return done(error)
          stdout.write('Product ID: ' + response.productID + '\n')
          done()
        })
      })
    })
  })
}
