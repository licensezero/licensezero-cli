module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var projectID = options['<UUID>']
  var noncommercial = options['--noncommercial']

  var request = require('../request')
  request({
    action: 'project',
    projectID: projectID
  }, function (error, project) {
    /* istanbul ignore if */
    if (error) return done(error)
    var readLicensor = require('../read/licensor')
    readLicensor(config, project.licensor.licensorID, function (error, licensor) {
      /* istanbul ignore next */
      if (error) return done(error)
      request({
        action: 'public',
        licensorID: licensor.licensorID,
        token: licensor.token,
        projectID: projectID,
        terms: noncommercial ? 'noncommercial' : 'reciprocal'
      }, function (error, response) {
        /* istanbul ignore if */
        if (error) return done(error)
        var fs = require('fs')
        var path = require('path')
        var runParallel = require('run-parallel')
        runParallel([
          function modifyPackageJSON (done) {
            var metadata = response.metadata
            var packageJSON = path.join(cwd, 'package.json')
            var modifyJSONFile = require('../modify/json-file')
            modifyJSONFile(packageJSON, function (data) {
              data.set('license', metadata.license)
              var existing = data.get('licensezero')
              // TODO: prompt before stacking metadata
              // TODO: concatenate LICENSE texts when stacking
              // TODO: replace existing if same projectID
              // TODO: --stack
              if (Array.isArray(existing)) {
                existing.push(metadata.licensezero)
              } else {
                existing = [metadata.licensezero]
              }
              data.set('licensezero', existing)
            }, function (error) {
              /* istanbul ignore next */
              if (error) return done(error)
              stdout.write('Modified ' + packageJSON + '.' + '\n')
              done()
            })
          },
          function writeLICENSE (done) {
            var license = response.license
            var licenseFile = path.join(cwd, 'LICENSE')
            var content = (
              license.document +
              '\n' +
              '---\n\n' +
              'Licensor Signature (Ed25519):\n\n' +
              signatureLines(license.licensorSignature) + '\n' +
              '\n' +
              '---\n\n' +
              'Agent Signature (Ed25519):\n\n' +
              signatureLines(license.agentSignature) + '\n'
            )
            fs.writeFile(licenseFile, content, function (error) {
              /* istanbul ignore next */
              if (error) return done(error)
              stdout.write('Wrote ' + licenseFile + '.' + '\n')
              done()
            })
          }
        ], function (error) {
          /* istanbul ignore if */
          if (error) return done(error)
          done()
        })
      })
    })
  })
}

function signatureLines (signature) {
  return [
    signature.slice(0, 32),
    signature.slice(32, 64),
    signature.slice(64, 96),
    signature.slice(96)
  ].join('\n')
}
