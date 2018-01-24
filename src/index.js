/**
 *
 * @module fun-array
 */
;(() => {
  'use strict'

  /* imports */
  const curry = require('fun-curry')
  const { inputs } = require('guarded')
  const { any: anything, vector, vectorOf, tuple, array, arrayOf, fun, num } =
    require('fun-type')

  const id = x => x
  const oAp = (fs, o) => Object.keys(o).reduce((r, k) => {
    r[k] = (fs[k] || id)(o[k])
    return r
  }, {})
  const oMap = (f, o) => Object.keys(o).reduce((r, k) => {
    r[k] = f(o[k])
    return r
  }, {})
  const not = curry((p, s) => !p(s))

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
  const fold = (combine, init, source) => source.reduce(combine, init)

  /**
   * Structural equality.
   *
   * @function module:fun-array.equal
   *
   * @param {Function} eq - e -> e -> Bool
   * @param {Array} a1 - first array
   * @param {Array} a2 - second array
   *
   * @return {Boolean} if a1 and a2 are equal element-wise by eq
   */
  const equal = (eq, a1, a2) => a1.length === a2.length &&
    fold((a, b) => a && b, true, zipWith(eq, a1, a2))

  /**
   *
   * @function module:fun-array.spanPrefix
   *
   * @param {Function} p - [x] -> Bool
   * @param {Array} a - to span prefix
   *
   * @return {Array<Array>} [prefix satisfying predicate, rest]
   */
  const spanPrefix = (p, a) => split(takeWhilePrefix(p, a).length, a)

  /**
   *
   * @function module:fun-array.span
   *
   * @param {Function} p - x -> Bool
   * @param {Array} a - to span
   *
   * @return {Array<Array>} [prefix of elements satisfying predicate, rest]
   */
  const span = (p, a) => [takeWhile(p, a), dropWhile(p, a)]

  /**
   *
   * @function module:fun-array.rightPad
   *
   * @param {*} value - to pad with
   * @param {Number} length - of resulting Array
   * @param {Array} a - to pad
   *
   * @return {Array} padded with value to length
   */
  const rightPad = (value, length, a) => a.length >= length
    ? a
    : a.concat(repeat(length - a.length, value))

  /**
   *
   * @function module:fun-array.leftPad
   *
   * @param {*} value - to pad with
   * @param {Number} length - of resulting Array
   * @param {Array} a - to pad
   *
   * @return {Array} padded with value to length
   */
  const leftPad = (value, length, a) => a.length >= length
    ? a
    : repeat(length - a.length, value).concat(a)

  /**
   *
   * @function module:fun-array.permute
   *
   * @param {Array} a - array to find permutations of
   *
   * @return {Array<Array>} all permutations of elements of a
   */
  const permute = a => !a.length
    ? a
    : a.length === 1
      ? [a]
      : flatten(a.map((e, i) => map(a => prepend(e, a), permute(remove(i, a)))))

  /**
   *
   * @function module:fun-array.cartesian
   *
   * @param {Array} a1 - first array
   * @param {Array} a2 - second array
   *
   * @return {Array<Array>} the cartesian product of the elements of a1 and a2
   */
  const cartesian = (a1, a2) => flatten(map(i => map(j => [i, j], a2), a1))

  /**
   *
   * @function module:fun-array.cartesianN
   *
   * @param {Array<Array>} as - arrays to multiply
   *
   * @return {Array<Array>} the n-fold cartesian product of arrays
   */
  const cartesianN = as =>
    fold((r, a) => map(([x, y]) => append(y, x), cartesian(r, a)), [[]], as)

  /**
   *
   * @function module:fun-array.flattenR
   *
   * @param {Array} a - array to flatten
   *
   * @return {Array} recursively flattened array
   */
  const flattenR = a => unfold(flatten, b => all(not(isArray), b), a)

  /**
   *
   * @function module:fun-array.isArray
   *
   * @param {*} a - anything
   *
   * @return {Boolean} if a is an instanceof Array
   */
  const isArray = a => a instanceof Array

  /**
   *
   * @function module:fun-array.flatten
   *
   * @param {Array} a - array to flatten
   *
   * @return {Array} with one level of nested arrays removed
   */
  const flatten = a => fold(concat, [], a)

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
  const unfold = (next, stop, seed) => {
    while (!stop(seed)) {
      seed = next(seed)
    }

    return seed
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
  const iterateN = (f, n, seed) =>
    unfold(xs => append(f(last(xs)), xs), xs => xs.length >= n, [seed])

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
  const iterate = (f, stop, seed) =>
    unfold(xs => append(f(last(xs)), xs), xs => stop(last(xs)), [seed])

  /**
   *
   * @function module:fun-array.sequence
   *
   * @param {Function} f - Int -> *
   * @param {Number} n - length of resulting sequence
   *
   * @return {Array} [f(0), ..., f(n - 1)]
   */
  const sequence = (f, n) =>
    Array.apply(null, { length: n }).map((v, i) => f(i))

  /**
   *
   * @function module:fun-array.repeat
   *
   * @param {Number} n - number of times to repeat value
   * @param {*} value - to repeat
   *
   * @return {Array} of length n containing value for every element
   */
  const repeat = (n, value) => sequence(() => value, n)

  /**
   *
   * @function module:fun-array.range
   *
   * @param {Number} first - number in the range
   * @param {Number} last - number in the range
   *
   * @return {Array<Number>} [first, ..., last]
   */
  const range = (first, last) => sequence(n => first + n, last - first + 1)

  /**
   *
   * @function module:fun-array.index
   *
   * @param {Number} n - length of the index to generate
   *
   * @return {Array<Number>} [0, 1, ..., n - 1]
   */
  const index = n => sequence(id, n)

  /**
   *
   * @function module:fun-array.any
   *
   * @param {Function} p - element -> Boolean
   * @param {Array} a - source array to check
   *
   * @return {Boolean} if any element of source passes p
   */
  const any = (p, a) => fold((r, v) => r || p(v), false, a)

  /**
   *
   * @function module:fun-array.all
   *
   * @param {Function} p - element -> Boolean
   * @param {Array} a - source array to check
   *
   * @return {Boolean} if all elements of source pass p
   */
  const all = (p, a) => fold((r, v) => r && p(v), true, a)

  /**
   *
   * @function module:fun-array.insert
   *
   * @param {Number} i - index to insert at
   * @param {*} v - value to insert
   * @param {Array} a - source array to insert v into
   *
   * @return {Array} source with v inserted at i
   */
  const insert = (i, v, a) => [...take(i, a), v, ...drop(i, a)]

  /**
   *
   * @function module:fun-array.prepend
   *
   * @param {*} v - value to prepend
   * @param {Array} a - source array to prepend v to
   *
   * @return {Array} [v, ...source]
   */
  const prepend = (v, a) => [v, ...a]

  /**
   *
   * @function module:fun-array.append
   *
   * @param {*} v - value to append
   * @param {Array} a - source array to append value to
   *
   * @return {Array} [...source, v]
   */
  const append = (v, a) => [...a, v]

  /**
   *
   * @function module:fun-array.remove
   *
   * @param {Number} i - index to remove
   * @param {Array} a - source array to remove from
   *
   * @return {Array} source without the element at i
   */
  const remove = (i, a) => a.filter((x, j) => i !== j)

  /**
   *
   * @function module:fun-array.contains
   *
   * @param {*} v - value to look for in source
   * @param {Array} source - to get values from
   *
   * @return {Boolean} if source contains v
   */
  const contains = (v, source) => source.indexOf(v) !== -1

  /**
   *
   * @function module:fun-array.intersect
   *
   * @param {Array} a1 - to get values from
   * @param {Array} a2 - to get values from
   *
   * @return {Array} unique intersection of a1 and a2
   */
  const intersect = (a1, a2) => unique(a1).filter(e => contains(e, a2))

  /**
   *
   * @function module:fun-array.union
   *
   * @param {Array} a1 - to get values from
   * @param {Array} a2 - to get values from
   *
   * @return {Array} unique union of a1 and a2
   */
  const union = (a1, a2) => unique(a1.concat(a2))

  /**
   *
   * @function module:fun-array.unique
   *
   * @param {Array} a - source array to get values from
   *
   * @return {Array} containing only unique elements of source
   */
  const unique = a => a.filter((v, i) => a.indexOf(v) === i)

  /**
   *
   * @function module:fun-array.partition
   *
   * @param {Function} p - element -> Boolean
   * @param {Array} source - to get values from
   *
   * @return {Array<Array>} [filter(p, source), filter(not(p), souce)]
   */
  const partition = (p, source) => [filter(p, source), filter(not(p), source)]

  /**
   *
   * @function module:fun-array.dropWhile
   *
   * @param {Function} p - element -> Boolean
   * @param {Array} source - to get values from
   *
   * @return {Array} suffix of source from first element to pass p
   */
  const dropWhile = (p, source) => source.findIndex(not(p)) === -1
    ? []
    : drop(source.findIndex(not(p)), source)

  /**
   *
   * @function module:fun-array.push
   *
   * @param {*} v - value to append
   * @param {Array} a - source array to append value to
   *
   * @return {Array} [...source, v]
   */
  const push = append

  /**
   *
   * @function module:fun-array.pop
   *
   * @param {Array} a - source array to append value to
   *
   * @return {Array} [...source, v]
   */
  const pop = a => take(a.length - 1, a)

  /**
   *
   * @function module:fun-array.shift
   *
   * @param {Array} a - source array to append value to
   *
   * @return {Array} [...source, v]
   */
  const shift = a => drop(1, a)

  /**
   *
   * @function module:fun-array.unshift
   *
   * @param {*} v - value to prepend
   * @param {Array} a - source array to prepend value to
   *
   * @return {Array} [...source, v]
   */
  const unshift = prepend

  /**
   *
   * @function module:fun-array.popUnshift
   *
   * @param {Array<Array>} a - [[a1, ... an-1, an], [b1 ... bn]]
   *
   * @return {Array<Array>} [[a1, ... an-1], [an, b1 ... bn]]
   */
  const popUnshift = a => a[0].length
    ? split(a[0].length - 1, concat(a[0], a[1]))
    : a

  /**
   *
   * @function module:fun-array.pushShift
   *
   * @param {Array<Array>} a - [[a1, ... an], [b1, b2, ... bn]]
   *
   * @return {Array<Array>} [[a1, ... an, b1], [b2, ... bn]]
   */
  const pushShift = a => a[1].length
    ? split(a[0].length + 1, concat(a[0], a[1]))
    : a

  /**
   *
   * @function module:fun-array.takeWhilePrefix
   *
   * @param {Function} p - [element] -> Boolean
   * @param {Array} source - to get values from
   *
   * @return {Array} prefix of source for which p is true
   */
  const takeWhilePrefix = (p, source) => {
    var results = []
    for (var i = 0; i < source.length; i++) {
      if (!p(append(source[i], results))) return results
      results.push(source[i])
    }
    return results
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
  const take = (n, source) => source.slice(0, n)

  /**
   *
   * @function module:fun-array.takeWhile
   *
   * @param {Function} p - element -> Boolean
   * @param {Array} source - to get values from
   *
   * @return {Array} prefix of source for which p is true
   */
  const takeWhile = (p, source) => source.findIndex(not(p)) === -1
    ? source
    : take(source.findIndex(not(p)), source)

  /**
   *
   * @function module:fun-array.drop
   *
   * @param {Number} n - number of elements to drop
   * @param {Array} source - to get values from
   *
   * @return {Array} sub array of source excluding first n elements
   */
  const drop = (n, source) => source.slice(n)

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
  const slice = (from, to, source) => source.slice(from, to)

  /**
   *
   * @function module:fun-array.split
   *
   * @param {Number} i - index to split at
   * @param {Array} source - to get values from
   *
   * @return {Array<Array>} [prefix, suffix] from splitting at index
   */
  const split = (i, source) => [take(i, source), drop(i, source)]

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
  const zipWith = (f, a1, a2) => a1.map((v, i) => f(v, a2[i]))

  /**
   *
   * @function module:fun-array.length
   *
   * @param {Array} source - to take length of
   *
   * @return {Number} of elements in this array
   */
  const length = source => source.length

  /**
   *
   * @function module:fun-array.reIndex
   *
   * @param {Array<Number>} indices - array of old indices in a new order
   * @param {Array} a - source array to get values from
   *
   * @return {Array} in a new order
   */
  const reIndex = (indices, a) => map(x => get(x, a), indices)

  /**
   *
   * @function module:fun-array.filter
   *
   * @param {Function} p - to determine value membership
   * @param {Array} source - to get values from
   *
   * @return {Array} of values that passed p
   */
  const filter = (p, source) => source.filter(x => p(x))

  /**
   *
   * @function module:fun-array.ap
   *
   * @param {Array} fs - functions to apply
   * @param {Array} a - source array to get value from
   *
   * @return {Array} [functions[0](source[0]), functions[1](source[1]), ...]
   */
  const ap = (fs, a) => a.map((x, i) => (fs[i] || id)(x))

  /**
   *
   * @function module:fun-array.map
   *
   * @param {Function} f - * -> *
   * @param {Array} source - to map f over
   *
   * @return {Array} [f(source[1]), f(source[2]), ...]
   */
  const map = (f, source) => source.map(x => f(x))

  /**
   *
   * @function module:fun-array.get
   *
   * @param {Number} index - of value
   * @param {Array} source - to get value from
   *
   * @return {*} value at key
   */
  const get = (index, source) => source[index]

  /**
   *
   * @function module:fun-array.first
   *
   * @param {Array} source - to get value from
   *
   * @return {*} first element of source
   */
  const first = source => get(0, source)

  /**
   *
   * @function module:fun-array.last
   *
   * @param {Array} source - to get value from
   *
   * @return {*} last element of source
   */
  const last = source => get(source.length - 1, source)

  /**
   *
   * @function module:fun-array.set
   *
   * @param {Number} i - index to set
   * @param {*} v - value to set
   * @param {Array} a - source array to set value on
   *
   * @return {Array} copy of source containing value at index
   */
  const set = (i, v, a) => a.map((x, j) => j === i ? v : x)

  /**
   *
   * @function module:fun-array.update
   *
   * @param {Number} index - index to update
   * @param {Function} f - update function
   * @param {Array} source - to update value on
   *
   * @return {Array} copy of source containing f(value) at index
   */
  const update = (index, f, source) => set(index, f(get(index, source)), source)

  /**
   *
   * @function module:fun-array.concat
   *
   * @param {Array} a1 - first array
   * @param {Array} a2 - second array
   *
   * @return {Array} [...a1, ...a2]
   */
  const concat = (a1, a2) => a1.concat(a2)

  /**
   *
   * @function module:fun-array.empty
   *
   * @return {Array} []
   */
  const empty = () => []

  /**
   *
   * @function module:fun-array.of
   *
   * @param {*} value - to put in an array
   *
   * @return {Array} [value]
   */
  const of = value => [value]

  /**
   *
   * @function module:fun-array.from
   *
   * @param {*} arrayLike - an object with numeric keys and a length property
   *
   * @return {Array} converted from arrayLike
   */
  const from = arrayLike => Array.prototype.slice.call(arrayLike)

  /**
   *
   * @function module:fun-array.reverse
   *
   * @param {Array} array - to reverse
   *
   * @return {Array} of values in reverse order
   */
  const reverse = array => map(id, array).reverse()

  /**
   *
   * @function module:fun-array.sort
   *
   * @param {Function} comparator - (a, b) => (a < b) ? -1 : (a == b) ? 0 : 1
   * @param {Array} array - to sort
   *
   * @return {Array} of values sorted by comparator
   */
  const sort = (comparator, array) => map(id, array).sort(comparator)

  /* exports */
  const api = { permute, length, reIndex, of, from, empty, concat, map, ap, get,
    set, update, filter, reverse, sort, zipWith, fold, take, takeWhile, drop,
    dropWhile, slice, split, partition, unique, union, intersect, contains,
    insert, remove, append, prepend, all, any, index, range, repeat, sequence,
    last, first, unfold, iterate, iterateN, cartesian, cartesianN, flatten,
    flattenR, isArray, leftPad, rightPad, span, spanPrefix, push, pop, shift,
    unshift, pushShift, popUnshift, takeWhilePrefix, equal }

  const guards = oMap(inputs, {
    permute: tuple([array]),
    length: tuple([array]),
    reIndex: tuple([array, array]),
    of: vector(1),
    from: vector(1),
    concat: tuple([array, array]),
    map: tuple([fun, array]),
    ap: tuple([arrayOf(fun), array]),
    get: tuple([num, array]),
    set: tuple([num, anything, array]),
    update: tuple([num, fun, array]),
    filter: tuple([fun, array]),
    reverse: tuple([array]),
    sort: tuple([fun, array]),
    zipWith: tuple([fun, array, array]),
    fold: tuple([fun, anything, array]),
    take: tuple([num, array]),
    takeWhile: tuple([fun, array]),
    drop: tuple([num, array]),
    dropWhile: tuple([fun, array]),
    slice: tuple([num, num, array]),
    split: tuple([num, array]),
    partition: tuple([fun, array]),
    unique: tuple([array]),
    union: tuple([array, array]),
    intersect: tuple([array, array]),
    contains: tuple([anything, array]),
    insert: tuple([num, anything, array]),
    remove: tuple([num, array]),
    append: tuple([anything, array]),
    prepend: tuple([anything, array]),
    all: tuple([fun, array]),
    any: tuple([fun, array]),
    index: tuple([num]),
    range: tuple([num, num]),
    repeat: tuple([num, anything]),
    sequence: tuple([fun, num]),
    last: tuple([array]),
    first: tuple([array]),
    unfold: tuple([fun, fun, anything]),
    iterate: tuple([fun, fun, anything]),
    iterateN: tuple([fun, num, anything]),
    cartesian: tuple([array, array]),
    cartesianN: tuple([arrayOf(array)]),
    flatten: tuple([arrayOf(array)]),
    flattenR: tuple([array]),
    isArray: vector(1),
    leftPad: tuple([anything, num, array]),
    rightPad: tuple([anything, num, array]),
    span: tuple([fun, array]),
    spanPrefix: tuple([fun, array]),
    push: tuple([anything, array]),
    pop: tuple([array]),
    shift: tuple([array]),
    unshift: tuple([anything, array]),
    popUnshift: tuple([vectorOf(2, array)]),
    takeWhilePrefix: tuple([fun, array]),
    equal: tuple([fun, array, anything])
  })

  module.exports = oMap(curry, oAp(guards, api))
})()

