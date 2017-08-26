var RE = /^[a-z]+$/

module.exports = function (nickname) {
  return RE.test(nickname)
    ? []
    : ['nicknames must consist only of lower-case letters']
}
