module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var projectID = options['<UUID>']
  var beneficiary = options['--beneficiary']
  var jurisdiction = options['--jurisdiction']
  var days = options['--days']
  var licensorID = options['--licensor']

  var readLicensor = require('../read/licensor')
  var readOnlyLicensor = require('../read/only-licensor')
  var licensorFunction = licensorID
    ? readLicensor.bind(null, config, licensorID)
    : readOnlyLicensor.bind(null, config)
  licensorFunction(function (error, licensor) {
    /* istanbul ignore next */
    if (error) return done(error)
    var request = require('../request')
    request({
      action: 'waiver',
      licensorID: licensor.licensorID,
      projectID: projectID,
      token: licensor.token,
      beneficiary: beneficiary,
      jurisdiction: jurisdiction,
      term: days.toLowerCase() === 'forever' ? 'forever' : parseInt(days)
    }, function (error, response) {
      if (error) return done(error)
      stdout.write(JSON.stringify(response, null, 2) + '\n')
      done()
    })
  })
}
