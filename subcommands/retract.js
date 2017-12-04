module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var projectID = options['<UUID>']
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
      action: 'retract',
      licensorID: licensor.licensorID,
      token: licensor.token,
      projectID: projectID
    }, function (error, response) {
      if (error) return done(error)
      stdout.write('Project ID ' + response.projectID + ' retracted from sale.\n')
      done()
    })
  })
}
