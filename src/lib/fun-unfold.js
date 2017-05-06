;(function () {
  'use strict'

  module.exports = unfold

  /**
   *
   * @function module:fun-unfold.unfold
   *
   * @param {Function} next - generates the next value from the previous value
   * @param {Function} stop - predicate function for stopping condition
   * @param {*} value - initial value
   *
   * @return {*} the final unfolded value
   */
  function unfold (next, stop, value) {
    while (!stop(value)) {
      value = next(value)
    }

    return value
  }
})()

