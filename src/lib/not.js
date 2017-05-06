;(function () {
  'use strict'

  module.exports = not

  function not (predicate, subject) {
    return !predicate(subject)
  }
})()

