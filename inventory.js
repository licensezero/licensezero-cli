var TIERS = require('./tiers')
var readLicensee = require('./read/licensee')
var readLicenses = require('./read/licenses')
var readPackageTree = require('read-package-tree')
var readWaivers = require('./read/waivers')
var runParallel = require('run-parallel')
var validateMetadata = require('./validate/metadata')

module.exports = function (nickname, cwd, config, callback) {
  readLicensee(config, nickname, function (error, licensee) {
    if (error) return callback(error)
    runParallel({
      licenses: readLicenses.bind(null, config, nickname),
      waivers: readWaivers.bind(null, config, nickname)
    }, function (error, existing) {
      if (error) return callback(error)
      readPackageTree(cwd, function (error, tree) {
        if (error) return callback(error)
        var licensable = []
        recurseTree(tree, function (node) {
          licenseRecords(node.package).forEach(function (record) {
            if (!licensable.some(function (existing) {
              return existing.license.projectID === record.license.projectID
            })) {
              licensable.push(record)
            }
          })
        })
        var unlicensed = []
        var licensed = []
        var waived = []
        var own = []
        var invalid = []
        runParallel(licensable.map(function (record) {
          return function (done) {
            validateMetadata(record, function (error, valid) {
              if (error) return done(error)
              if (!valid) {
                invalid.push(record.license)
                done()
              }
              var projectID = record.license.projectID
              // Licensed?
              var haveLicense = existing.licenses.some(function (license) {
                var manifest = JSON.parse(license.manifest)
                return (
                  license.projectID === projectID &&
                  sufficientTier(manifest.tier, licensee.tier)
                )
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
              var ownProject = (
                record.license.name === licensee.name &&
                record.license.jurisdiction === licensee.jurisdiction
              )
              if (ownProject) {
                own.push(record.license)
                done()
              }
              // Otherwise, it's unlicensed.
              unlicensed.push(record.license)
              done()
            })
          }
        }), function (error) {
          if (error) return callback(error)
          callback(null, {
            licensee: licensee,
            licensable: licensable,
            licensed: licensed,
            waived: waived,
            unlicensed: unlicensed,
            invalid: invalid
          })
        })
      })
    })
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
    var hasProjectID = (
      isObject(element.license) &&
      typeof element.license.projectID === 'string'
    )
    if (hasProjectID) returned.push(element)
  })
  return returned
}

function isObject (argument) {
  return (
    typeof argument === 'object' &&
    argument !== null
  )
}

function sufficientTier (have, need) {
  if (have === need) return true
  var haveIndex = TIERS.indexOf(have)
  var needIndex = TIERS.indexOf(need)
  return haveIndex > needIndex
}
