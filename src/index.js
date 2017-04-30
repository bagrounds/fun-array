/**
 *
 * @module fun-array
 */
;(function () {
  'use strict'

  /* imports */
  var curry = require('fun-curry')
  var predicate = require('fun-predicate')
  var fn = require('fun-function')
  var scalar = require('fun-scalar')
  var funUnfold = require('fun-unfold')

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
    zipWith: curry(zipWith),
    fold: curry(fold),
    take: curry(take),
    takeWhile: curry(takeWhile),
    drop: curry(drop),
    dropWhile: curry(dropWhile),
    slice: curry(slice),
    split: curry(split),
    partition: curry(partition),
    unique: unique,
    union: curry(union),
    intersect: curry(intersect),
    contains: curry(contains),
    insert: curry(insert),
    append: curry(append),
    prepend: curry(prepend),
    all: curry(all),
    any: curry(any),
    index: index,
    range: curry(range),
    repeat: curry(repeat),
    sequence: curry(sequence),
    last: last,
    first: first,
    unfold: curry(unfold),
    iterate: curry(iterate),
    iterateN: curry(iterateN),
    cartesian: curry(cartesian),
    cartesianN: curry(cartesianN),
    flatten: flatten,
    flattenR: flattenR,
    isArray: isArray
  }

  /**
   *
   * @function module:fun-array.cartesian
   *
   * @param {Array} a1 - first array
   * @param {Array} a2 - second array
   *
   * @return {Array<Array>} the cartesian product of the elements of a1 and a2
   */
  function cartesian (a1, a2) {
    return a1.map(function (i) {
      return a2.map(function (j) {
        return [i, j]
      })
    }).reduce(concat, [])
  }

  /**
   *
   * @function module:fun-array.cartesianN
   *
   * @param {Array<Array>} arrays - to multiply
   *
   * @return {Array<Array>} the n-fold cartesian product of arrays
   */
  function cartesianN (arrays) {
    return arrays.reduce(function (result, next) {
      return cartesian(result, next).map(function (pair) {
        return append(pair[1], pair[0])
      })
    }, [[]])
  }

  /**
   *
   * @function module:fun-array.flattenR
   *
   * @param {Array} array - to flatten
   *
   * @return {Array} recursively flattened array
   */
  function flattenR (array) {
    return unfold(flatten, curry(all)(predicate.not(isArray)), array)
  }

  /**
   *
   * @function module:fun-array.isArray
   *
   * @param {*} a - anything
   *
   * @return {Boolean} if a is an instanceof Array
   */
  function isArray (a) {
    return a instanceof Array
  }

  /**
   *
   * @function module:fun-array.flatten
   *
   * @param {Array} array - to flatten
   *
   * @return {Array} with one level of nested arrays removed
   */
  function flatten (array) {
    return Array.prototype.concat.apply([], array)
  }

  /**
   *
   * @function module:fun-array.unfold
   *
   * @param {Function} next - Array -> Array
   * @param {Function} stop - Array -> Boolean (stopping condition)
   * @param {Array} seed - inial array
   *
   * @return {Array} seed unfolded with next until stop => true
   */
  function unfold (next, stop, seed) {
    return funUnfold(next, stop, seed)
  }

  /**
   *
   * @function module:fun-array.iterateN
   *
   * @param {Function} f - a -> a
   * @param {Number} n - length of resulting array
   * @param {*} seed - inial value
   *
   * @return {Array} [seed, f(seed), f(f(seed)) ...] (length n)
   */
  function iterateN (f, n, seed) {
    return unfold(next, fn.compose(gt(n), length), [seed])

    function gt (n) {
      return function (x) {
        return x > n
      }
    }

    function next (array) {
      return append(f(last(array)), array)
    }
  }

  /**
   *
   * @function module:fun-array.iterate
   *
   * @param {Function} f - a -> a
   * @param {Function} stop - a -> Boolean (stopping condition)
   * @param {*} seed - inial value
   *
   * @return {Array} [seed, f(seed), f(f(seed)) ...] (length n)
   */
  function iterate (f, stop, seed) {
    return unfold(next, fn.compose(stop, last), [seed])

    function next (array) {
      return append(f(last(array)), array)
    }
  }

  /**
   *
   * @function module:fun-array.sequence
   *
   * @param {Function} f - Int -> *
   * @param {Number} n - length of resulting sequence
   *
   * @return {Array} [f(0), ..., f(n - 1)]
   */
  function sequence (f, n) {
    return Array.apply(null, { length: n }).map(function (v, i) {
      return f(i)
    })
  }

  /**
   *
   * @function module:fun-array.repeat
   *
   * @param {Number} n - number of times to repeat value
   * @param {*} value - to repeat
   *
   * @return {Array} of length n containing value for every element
   */
  function repeat (n, value) {
    return sequence(fn.k(value), n)
  }

  /**
   *
   * @function module:fun-array.range
   *
   * @param {Number} first - number in the range
   * @param {Number} last - number in the range
   *
   * @return {Array<Number>} [first, ..., last]
   */
  function range (first, last) {
    return sequence(scalar.sum(first), last - first + 1)
  }

  /**
   *
   * @function module:fun-array.index
   *
   * @param {Number} n - length of the index to generate
   *
   * @return {Array<Number>} [0, 1, ..., n - 1]
   */
  function index (n) {
    return sequence(fn.id, n)
  }

  /**
   *
   * @function module:fun-array.any
   *
   * @param {Function} p - element -> Boolean
   * @param {Array} source - to check
   *
   * @return {Boolean} if any element of source passes p
   */
  function any (p, source) {
    return source.reduce(function (result, v) {
      return result || p(v)
    }, false)
  }

  /**
   *
   * @function module:fun-array.all
   *
   * @param {Function} p - element -> Boolean
   * @param {Array} source - to check
   *
   * @return {Boolean} if all elements of source pass p
   */
  function all (p, source) {
    return source.reduce(function (result, v) {
      return result && p(v)
    }, true)
  }

  /**
   *
   * @function module:fun-array.prepend
   *
   * @param {*} v - value to prepend
   * @param {Array} source - to prepend v to
   *
   * @return {Array} [v, ...source]
   */
  function prepend (v, source) {
    return insert(0, v, source)
  }

  /**
   *
   * @function module:fun-array.append
   *
   * @param {*} v - value to append
   * @param {Array} source - to append value to
   *
   * @return {Array} [...source, v]
   */
  function append (v, source) {
    return insert(source.length, v, source)
  }

  /**
   *
   * @function module:fun-array.insert
   *
   * @param {Number} i - index to insert at
   * @param {*} v - value to insert
   * @param {Array} source - to insert v into
   *
   * @return {Array} source with v inserted at i
   */
  function insert (i, v, source) {
    return [take(i, source), [v], drop(i, source)].reduce(concat)
  }

  /**
   *
   * @function module:fun-array.contains
   *
   * @param {*} v - value to look for in source
   * @param {Array} source - to get values from
   *
   * @return {Boolean} if source contains v
   */
  function contains (v, source) {
    return source.indexOf(v) !== -1
  }

  /**
   *
   * @function module:fun-array.intersect
   *
   * @param {Array} a1 - to get values from
   * @param {Array} a2 - to get values from
   *
   * @return {Array} unique intersection of a1 and a2
   */
  function intersect (a1, a2) {
    return unique(a1).filter(function (e) {
      return contains(e, a2)
    })
  }

  /**
   *
   * @function module:fun-array.union
   *
   * @param {Array} a1 - to get values from
   * @param {Array} a2 - to get values from
   *
   * @return {Array} unique union of a1 and a2
   */
  function union (a1, a2) {
    return unique(a1.concat(a2))
  }

  /**
   *
   * @function module:fun-array.unique
   *
   * @param {Array} source - to get values from
   *
   * @return {Array} containing only unique elements of source
   */
  function unique (source) {
    return source.filter(function (v, i) {
      return source.indexOf(v) === i
    })
  }

  /**
   *
   * @function module:fun-array.partition
   *
   * @param {Function} p - element -> Boolean
   * @param {Array} source - to get values from
   *
   * @return {Array<Array>} [filter(p, source), filter(not(p), souce)]
   */
  function partition (p, source) {
    return [filter(p, source), filter(predicate.not(p), source)]
  }

  /**
   *
   * @function module:fun-array.dropWhile
   *
   * @param {Function} p - element -> Boolean
   * @param {Array} source - to get values from
   *
   * @return {Array} suffix of source from first element to pass p
   */
  function dropWhile (p, source) {
    return drop(source.findIndex(predicate.not(p)), source)
  }

  /**
   *
   * @function module:fun-array.takeWhile
   *
   * @param {Function} p - element -> Boolean
   * @param {Array} source - to get values from
   *
   * @return {Array} prefix of source for which p is true
   */
  function takeWhile (p, source) {
    return take(source.findIndex(predicate.not(p)), source)
  }

  /**
   *
   * @function module:fun-array.take
   *
   * @param {Number} n - number of elements to take
   * @param {Array} source - to get values from
   *
   * @return {Array} sub array of source including first n elements
   */
  function take (n, source) {
    return source.slice(0, n)
  }

  /**
   *
   * @function module:fun-array.drop
   *
   * @param {Number} n - number of elements to drop
   * @param {Array} source - to get values from
   *
   * @return {Array} sub array of source excluding first n elements
   */
  function drop (n, source) {
    return source.slice(n)
  }

  /**
   *
   * @function module:fun-array.slice
   *
   * @param {Number} from - first index to keep
   * @param {Number} to - last index to keep + 1
   * @param {Array} source - to get values from
   *
   * @return {Array} sub array from from (inclusive) to to (exclusive)
   */
  function slice (from, to, source) {
    return source.slice(from, to)
  }

  /**
   *
   * @function module:fun-array.split
   *
   * @param {Number} index - to split at
   * @param {Array} source - to get values from
   *
   * @return {Array<Array>} [prefix, suffix] from splitting at index
   */
  function split (index, source) {
    return [take(index, source), drop(index, source)]
  }

  /**
   *
   * @function module:fun-array.fold
   *
   * @param {Function} combine - (a, b) -> a
   * @param {*} init - first value to use
   * @param {Array} source - to get values from
   *
   * @return {*} result of folding
   */
  function fold (combine, init, source) {
    return source.reduce(combine, init)
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
   * @param {Function} p - to determine value membership
   * @param {Array} source - to get values from
   *
   * @return {Array} of values that passed p
   */
  function filter (p, source) {
    return source.filter(p)
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
   * @function module:fun-array.first
   *
   * @param {Array} source - to get value from
   *
   * @return {*} first element of source
   */
  function first (source) {
    return get(0, source)
  }

  /**
   *
   * @function module:fun-array.last
   *
   * @param {Array} source - to get value from
   *
   * @return {*} last element of source
   */
  function last (source) {
    return get(source.length - 1, source)
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

