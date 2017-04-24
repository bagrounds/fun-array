/**
 *
 * @module fun-array
 */
;(function () {
  'use strict'

  /* imports */
  var curry = require('fun-curry')

  /* exports */
  module.exports = {
    length: length,
    reIndex: curry(reIndex),
    of: of,
    empty: empty,
    concat: curry(concat),
    map: curry(map),
    ap: curry(ap),
    get: curry(get),
    set: curry(set),
    filter: curry(filter),
    reverse: reverse,
    sort: curry(sort),
    zipWith: curry(zipWith)
  }

  /**
   *
   * @function module:fun-array.zipWith
   *
   * @param {Function} f - to apply to each pair of elements from a1 and a2
   * @param {Array} a1 - first arguments to f
   * @param {Array} a2 - second arguments to f
   *
   * @return {Array} [f(a1[0], a2[0]), f(a1[1], a2[1]), ...]
   */
  function zipWith (f, a1, a2) {
    return a1.map(function (v, i) {
      return f(v, a2[i])
    })
  }

  /**
   *
   * @function module:fun-array.length
   *
   * @param {Array} source - to take length of
   *
   * @return {Number} of elements in this array
   */
  function length (source) {
    return source.length
  }

  /**
   *
   * @function module:fun-array.reIndex
   *
   * @param {Array<Number>} indices - array of old indices in a new order
   * @param {Array} source - to get values from
   *
   * @return {Array} in a new order
   */
  function reIndex (indices, source) {
    return source.reduce(function (result, value, i) {
      result[i] = typeof indices[i] === 'number' ? source[indices[i]] : value

      return result
    }, [])
  }

  /**
   *
   * @function module:fun-array.filter
   *
   * @param {Function} predicate - to determine value membership
   * @param {Array} source - to get values from
   *
   * @return {Array} of values that passed predicate
   */
  function filter (predicate, source) {
    return source.filter(predicate)
  }

  /**
   *
   * @function module:fun-array.ap
   *
   * @param {Array} functions - to apply
   * @param {Array} source - to get value from
   *
   * @return {Array} [functions[0](source[0]), functions[1](source[1]), ...]
   */
  function ap (functions, source) {
    return source.map(function (value, i) {
      return (functions[i] || id)(value)
    })
  }

  /**
   *
   * @function module:fun-array.map
   *
   * @param {Function} f - * -> *
   * @param {Array} source - to map f over
   *
   * @return {Array} [f(source[1]), f(source[2]), ...]
   */
  function map (f, source) {
    return source.map(f)
  }

  /**
   *
   * @function module:fun-array.get
   *
   * @param {Number} index - of value
   * @param {Array} source - to get value from
   *
   * @return {*} value at key
   */
  function get (index, source) {
    return source[index]
  }

  /**
   *
   * @function module:fun-array.set
   *
   * @param {Number} index - to set
   * @param {*} value - to set
   * @param {Array} source - to set value on
   *
   * @return {Array} copy of source object containing value at key
   */
  function set (index, value, source) {
    var result = source.map(id)
    result[index] = value

    return result
  }

  /**
   *
   * @function module:fun-array.concat
   *
   * @param {Array} a1 - first array
   * @param {Array} a2 - second array
   *
   * @return {Array} [...a1, ...a2]
   */
  function concat (a1, a2) {
    return a1.concat(a2)
  }

  /**
   *
   * @function module:fun-array.empty
   *
   * @return {Array} []
   */
  function empty () {
    return []
  }

  /**
   *
   * @function module:fun-array.of
   *
   * @param {*} value - to put in an array
   *
   * @return {Array} [value]
   */
  function of (value) {
    return [value]
  }

  /**
   *
   * @function module:fun-array.reverse
   *
   * @param {Array} array - to reverse
   *
   * @return {Array} of values in reverse order
   */
  function reverse (array) {
    return map(id, array).reverse()
  }

  /**
   *
   * @function module:fun-array.sort
   *
   * @param {Function} comparator - (a, b) => (a < b) ? -1 : (a == b) ? 0 : 1
   * @param {Array} array - to sort
   *
   * @return {Array} of values sorted by comparator
   */
  function sort (comparator, array) {
    return map(id, array).sort(comparator)
  }

  function id (x) {
    return x
  }
})()

