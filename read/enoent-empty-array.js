module.exports = function (onError, onSuccess) {
  return function (error, result) {
    if (error) {
      /* istanbul ignore else */
      if (error.code === 'ENOENT') {
        onSuccess([])
      } else {
        onError(error)
      }
    } else {
      onSuccess(result)
    }
  }
}
