module.exports = function (packageData) {
  if (
    !packageData.hasOwnProperty('licensezero') ||
    !Array.isArray(packageData.licensezero)
  ) return undefined
  for (var index = 0; index < packageData.licensezero.length; index++) {
    var element = packageData.licensezero[index]
    if (
      typeof element === 'object' &&
      element.hasOwnProperty('license') &&
      typeof element.license === 'object' &&
      element.license.hasOwnProperty('projectID')
    ) {
      return element.license.projectID
    }
  }
  return undefined
}
