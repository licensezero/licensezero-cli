module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var projectID = options['<UUID>']
  var name = options['--name']
  var jurisdiction = options['--jurisdiction']
  var term = options['--term']
  var licensorID = options['--licensor']

  var readLicensor = require('../read/licensor')
  var readOnlyLicensor = require('../read/only-licensor')
  var licensorFunction = options['--licensor']
    ? readLicensor.bind(null, config, licensorID)
    : readOnlyLicensor.bind(null, config)
  licensorFunction(function (error, licensor) {
    /* istanbul ignore next */
    if (error) return done(error)
    var request = require('../request')
    var payload = {
      action: 'waiver',
      licensorID: licensor.licensorID,
      projectID: projectID,
      token: licensor.token,
      beneficiary: name,
      jurisdiction: jurisdiction,
      term: term.toLowerCase() === 'forever' ? 'forever' : parseInt(term)
    }
    request(payload, function (error, response) {
      if (error) return done(error)
      stdout.write(JSON.stringify(response, null, 2) + '\n')
      done()
    })
  })
}
