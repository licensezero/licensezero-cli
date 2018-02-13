module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var projectID = options['<UUID>']
  var beneficiary = options['--beneficiary']
  var jurisdiction = options['--jurisdiction']
  var days = options['--days']

  var readLicensor = require('../read/licensor')
  readLicensor(config, function (error, licensor) {
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
