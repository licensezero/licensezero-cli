module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var projectID = options['<project id>']

  var readLicensor = require('../read/licensor')
  readLicensor(config, function (error, licensor) {
    /* istanbul ignore next */
    if (error) return done(error)
    var request = require('../request')
    request(
      {
        action: 'retract',
        licensorID: licensor.licensorID,
        token: licensor.token,
        projectID: projectID
      },
      function (error, response) {
        if (error) return done(error)
        stdout.write(
          'Project ID ' + response.projectID + ' retracted from sale.\n'
        )
        done()
      }
    )
  })
}
