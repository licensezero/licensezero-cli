module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var readJSONFile = require('../read/json-file')
  var path = require('path')
  readJSONFile(path.join(cwd, 'package.json'), function (error, packageData) {
    /* istanbul ignore next */
    if (error) return done(error)
    if (
      !packageData.hasOwnProperty('licensezero') ||
      !Array.isArray(packageData.licensezero)
    ) {
      return done(new Error('no project metadata in package.json'))
    }
    var projectID
    for (var index = 0; index < packageData.licensezero.length; index++) {
      var element = packageData.licensezero[index]
      if (
        typeof element === 'object' &&
        element.hasOwnProperty('license') &&
        typeof element.license === 'object' &&
        element.license.hasOwnProperty('projectID')
      ) {
        projectID = element.license.projectID
        break
      }
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
        stdout.write('Project ID ' + response.projectID + ' pricing updated.\n')
        done()
      })
    })
  })
}
