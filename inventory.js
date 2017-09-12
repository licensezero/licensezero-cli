var TIERS = require('./tiers')
var readLicensee = require('./read/licensee')
var readLicenses = require('./read/licenses')
var readPackageTree = require('read-package-tree')
var readWaivers = require('./read/waivers')
var runParallel = require('run-parallel')

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
          licenseRecords(node.package).forEach(function (license) {
            if (!licensable.some(function (existing) {
              return existing.projectID === license.projectID
            })) {
              licensable.push(license)
            }
          })
        })
        var unlicensed = []
        var licensed = []
        var waived = []
        licensable.forEach(function (license) {
          var projectID = license.projectID
          var haveLicense = existing.licenses.some(function (license) {
            return (
              license.projectID === projectID &&
              sufficientTier(license.tier, licensee.tier)
            )
          })
          if (haveLicense) return licensed.push(license)
          var haveWaiver = existing.waivers.some(function (waiver) {
            return waiver.projectID === projectID
          })
          if (haveWaiver) return waived.push(license)
          unlicensed.push(license)
        })
        return callback(null, {
          licensee: licensee,
          licensable: licensable,
          licensed: licensed,
          waived: waived,
          unlicensed: unlicensed
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
    if (
      isObject(element.license) &&
      typeof element.license.projectID === 'string'
    ) {
      returned.push(element.license)
    }
  })
  return returned
}

function isObject (argument) {
  return typeof argument === 'object' && argument !== null
}

function sufficientTier (have, need) {
  if (have === need) return true
  var haveIndex = TIERS.indexOf(have)
  var needIndex = TIERS.indexOf(need)
  return haveIndex > needIndex
}
