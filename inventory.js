var readIdentities = require('./read/identities')
var readLicenses = require('./read/licenses')
var readPackageTree = require('read-package-tree')
var readWaivers = require('./read/waivers')
var runParallel = require('run-parallel')
var validateMetadata = require('./validate/metadata')

module.exports = function (cwd, config, options, callback) {
  var noNoncommercial = options['--no-noncommercial']
  var noReciprocal = options['--no-reciprocal']
  readIdentities(config, function (error, identities) {
    /* istanbul ignore if */
    if (error) return callback(error)
    runParallel(
      {
        licenses: readLicenses.bind(null, config),
        waivers: readWaivers.bind(null, config)
      },
      function (error, existing) {
        /* istanbul ignore if */
        if (error) return callback(error)
        readPackageTree(cwd, function (error, tree) {
          /* istanbul ignore if */
          if (error) return callback(error)
          var licensable = []
          recurseTree(tree, function (node) {
            licenseRecords(node.package).forEach(function (record) {
              if (
                !licensable.some(function (existing) {
                  return existing.license.projectID === record.license.projectID
                })
              ) {
                licensable.push(record)
              }
            })
          })
          var unlicensed = []
          var licensed = []
          var ignored = []
          var waived = []
          var own = []
          var invalid = []
          runParallel(
            licensable.map(function (record) {
              return function (done) {
                validateMetadata(record, function (error, valid) {
                  /* istanbul ignore if */
                  if (error) return done(error)
                  if (!valid) {
                    invalid.push(record.license)
                    done()
                  }
                  var projectID = record.license.projectID
                  // Licensed?
                  var haveLicense = existing.licenses.some(function (license) {
                    return license.projectID === projectID
                  })
                  if (haveLicense) {
                    licensed.push(record.license)
                    done()
                  }
                  // Waived?
                  var haveWaiver = existing.waivers.some(function (waiver) {
                    return waiver.projectID === projectID
                  })
                  if (haveWaiver) {
                    waived.push(record.license)
                    done()
                  }
                  // Our own project?
                  var ownProject = identities.some(function (identity) {
                    return (
                      record.license.name === identity.name &&
                      record.license.jurisdiction === identity.jurisdiction &&
                      record.license.email === identity.email
                    )
                  })
                  if (ownProject) {
                    own.push(record.license)
                    done()
                  }
                  var terms = record.license.terms
                  if (terms === 'noncommercial' && noNoncommercial) {
                    ignored.push(record.license)
                  } else if (terms === 'reciprocal' && noReciprocal) {
                    ignored.push(record.license)
                  } else {
                    // Otherwise, it's unlicensed.
                    unlicensed.push(record.license)
                  }
                  done()
                })
              }
            }),
            function (error) {
              /* istanbul ignore if */
              if (error) return callback(error)
              callback(null, {
                identities: identities,
                licensable: licensable,
                licensed: licensed,
                waived: waived,
                unlicensed: unlicensed,
                ignored: ignored,
                invalid: invalid
              })
            }
          )
        })
      }
    )
  })
}

function recurseTree (tree, handler) {
  if (tree.children) {
    tree.children.forEach(function (child) {
      handler(child)
      if (child.children) recurseTree(child, handler)
    })
  }
}

function licenseRecords (packageData) {
  if (!Array.isArray(packageData.licensezero)) return []
  var returned = []
  packageData.licensezero.forEach(function (element) {
    var hasProjectID =
      isObject(element.license) && typeof element.license.projectID === 'string'
    if (hasProjectID) returned.push(element)
  })
  return returned
}

function isObject (argument) {
  return typeof argument === 'object' && argument !== null
}
