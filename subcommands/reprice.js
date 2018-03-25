module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var readJSONFile = require('../read/json-file')
  var path = require('path')
  readJSONFile(path.join(cwd, 'package.json'), function (error, packageData) {
    /* istanbul ignore next */
    if (error) return done(error)
    var readProjectID = require('../read/project-id')
    var projectID = readProjectID(packageData)
    if (!projectID) {
      return done(new Error('no project metadata in package.json'))
    }
    var homepage = packageData.homepage
    if (!homepage && packageData.repository) {
      var hostedGitInfo = require('hosted-git-info')
      homepage = hostedGitInfo.fromUrl(packageData.repository).browse()
    }
    var readLicensor = require('../read/licensor')
    readLicensor(config, function (error, licensor) {
      /* istanbul ignore next */
      if (error) return done(error)
      var request = require('../request')
      var pricing = {private: parseInt(options['<PRICE>'])}
      if (options['--relicense']) {
        pricing.relicense = parseInt(options['--relicense'])
      }
      var payload = {
        action: 'reprice',
        licensorID: licensor.licensorID,
        token: licensor.token,
        projectID: projectID,
        pricing: pricing
      }
      request(payload, function (error, response) {
        /* istanbul ignore if */
        if (error) return done(error)
        stdout.write('Project ID ' + projectID + ' pricing updated.\n')
        done()
      })
    })
  })
}
