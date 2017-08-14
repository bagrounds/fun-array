;(function () {
  'use strict'

  /* imports */
  var predicate = require('fun-predicate')
  var object = require('fun-object')
  var funTest = require('fun-test')
  var arrange = require('fun-arrange')
  var scalar = require('fun-scalar')

  function add (a, b) {
    return a + b
  }

  function append1 (a) {
    return a.concat(1)
  }

  function length3 (array) {
    return array.length === 3
  }

  var equalityTests = [
    [[scalar.lt(3), [1, 2, 3, 1]], [[1, 2], [3, 1]], 'span'],
    [[scalar.lt(2), [1, 2, 3, 1]], [[1], [2, 3, 1]], 'span'],
    [['a', 2, ['a', 'b', 'c']], ['a', 'b', 'c'], 'rightPad'],
    [['a', 2, ['b', 'c']], ['b', 'c'], 'rightPad'],
    [['a', 4, ['b']], ['b', 'a', 'a', 'a'], 'rightPad'],
    [['a', 4, []], ['a', 'a', 'a', 'a'], 'rightPad'],
    [['a', 2, ['a', 'b', 'c']], ['a', 'b', 'c'], 'leftPad'],
    [['a', 2, ['b', 'c']], ['b', 'c'], 'leftPad'],
    [['a', 4, ['b']], ['a', 'a', 'a', 'b'], 'leftPad'],
    [['a', 4, []], ['a', 'a', 'a', 'a'], 'leftPad'],
    [[2, [0, 1, 2, 3]], [0, 1, 3], 'remove'],
    [[[]], [], 'permute'],
    [[[0]], [[0]], 'permute'],
    [[[0, 1]], [[0, 1], [1, 0]], 'permute'],
    [
      [[0, 1, 2]],
      [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]],
      'permute'
    ],
    [[{ length: 1, 0: 1 }], false, 'isArray'],
    [[5], false, 'isArray'],
    [['hi'], false, 'isArray'],
    [[[]], true, 'isArray'],
    [[[0, [1, [2, [7]]]]], [0, 1, 2, 7], 'flattenR'],
    [[[[0], [1, 2], [[7]]]], [0, 1, 2, [7]], 'flatten'],
    [[[[0], [1, 2], []]], [], 'cartesianN'],
    [[[[0], [], [9]]], [], 'cartesianN'],
    [[[[], [1, 2], [9]]], [], 'cartesianN'],
    [[[[0], [1, 2], [9]]], [[0, 1, 9], [0, 2, 9]], 'cartesianN'],
    [[[['a', 3]]], [['a'], [3]], 'cartesianN'],
    [[[], ['a', 3]], [], 'cartesian'],
    [[['a', 3], []], [], 'cartesian'],
    [[['a', 3], [1, 2]], [['a', 1], ['a', 2], [3, 1], [3, 2]], 'cartesian'],
    [[scalar.dot(2), 3, 1], [1, 2, 4], 'iterateN'],
    [[scalar.dot(2), scalar.gt(5), 1], [1, 2, 4, 8], 'iterate'],
    [[append1, length3, []], [1, 1, 1], 'unfold'],
    [[[1, 5, 6]], 1, 'first'],
    [[[1, 5, 6]], 6, 'last'],
    [[scalar.dot(3), 3], [0, 3, 6], 'sequence'],
    [[3, 'q'], ['q', 'q', 'q'], 'repeat'],
    [[4, 7], [4, 5, 6, 7], 'range'],
    [[3], [0, 1, 2], 'index'],
    [[scalar.gt(3), [0, 3, 1]], false, 'any'],
    [[scalar.gt(3), [0, 4, 1]], true, 'any'],
    [[scalar.gt(3), [6, 3, 4]], false, 'all'],
    [[scalar.gt(3), [6, 4]], true, 'all'],
    [['a', [4, 6]], ['a', 4, 6], 'prepend'],
    [['a', [4, 6]], [4, 6, 'a'], 'append'],
    [[1, 'a', [4, 6]], [4, 'a', 6], 'insert'],
    [[7, [4, 6]], false, 'contains'],
    [[4, [4, 6]], true, 'contains'],
    [[[5, 4], [4, 6]], [4], 'intersect'],
    [[[5, 4], [4, 6]], [5, 4, 6], 'union'],
    [[[5, 4, 4, 5]], [5, 4], 'unique'],
    [[scalar.lt(6), [7, 4, 6, 5]], [[4, 5], [7, 6]], 'partition'],
    [[2, [4, 5, 6, 7]], [[4, 5], [6, 7]], 'split'],
    [[1, -1, [4, 5, 6, 7]], [5, 6], 'slice'],
    [[1, 3, [4, 5, 6, 7]], [5, 6], 'slice'],
    [[scalar.lt(5), [4, 5, 6]], [5, 6], 'dropWhile'],
    [[2, [4, 5, 6]], [6], 'drop'],
    [[scalar.lt(5), [4, 5, 6]], [4], 'takeWhile'],
    [[2, [4, 5, 6]], [4, 5], 'take'],
    [[scalar.sum, 0, [4, 5, 6]], 15, 'fold'],
    [[scalar.sum, [1, 2, 3], [4, 5, 6]], [5, 7, 9], 'zipWith'],
    [[scalar.sub, [2, 3, 1]], [3, 2, 1], 'sort'],
    [[[1, 2, 3]], [3, 2, 1], 'reverse'],
    [[scalar.lt(4), [2, 4, 1, 5, 3]], [2, 1, 3], 'filter'],
    [[1, 'apple', [1, 2]], [1, 'apple'], 'set'],
    [[1, [1, 2]], 2, 'get'],
    [[[scalar.sum(3)], [1, 2]], [4, 2], 'ap'],
    [[[scalar.sum(3), scalar.dot(4)], [1, 2]], [4, 8], 'ap'],
    [[scalar.sum(3), [1, 2]], [4, 5], 'map'],
    [[add, ['1', '2']], ['1undefined', '2undefined'], 'map'],
    [[['a', 'b'], ['c', 'd']], ['a', 'b', 'c', 'd'], 'concat'],
    [[{ length: 2, 0: 'a', 1: 'b' }], ['a', 'b'], 'from'],
    [['abc'], ['a', 'b', 'c'], 'from'],
    [[[2, 0], [1, 2, 3]], [3, 1, 3], 'reIndex'],
    [[[2, 0, 1], [1, 2, 3]], [3, 1, 2], 'reIndex'],
    [[[1, 2, 3]], 3, 'length'],
    [[], [], 'empty'],
    [[9], [9], 'of']
  ].map(arrange({ inputs: 0, predicate: 1, contra: 2 }))
    .map(object.ap({
      predicate: predicate.equalDeep,
      contra: object.get
    }))

  /* exports */
  module.exports = equalityTests.map(funTest.sync)
})()

