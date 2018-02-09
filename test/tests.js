;(() => {
  'use strict'

  /* imports */
  const arrange = require('fun-arrange')
  const { equalDeep } = require('fun-predicate')
  const { sync } = require('fun-test')
  const { ap, get } = require('fun-object')
  const { add, sub, mul, gt, lt } = require('fun-scalar')

  const uncurriedAdd = (a, b) => a + b
  const append1 = a => a.concat(1)
  const length3 = a => a.length === 3
  const lengthLt3 = a => a.length < 3
  const strictEqual = (a, b) => a === b
  const allEqual2 = as => as.reduce((r, a) => r && a === 2)
  const upto = n => Array.apply(null, { length: n + 1 }).map((x, i) => i)

  const equalityTests = [
    [[upto, [1, 2, 3]], [0, 1, 0, 1, 2, 0, 1, 2, 3], 'flatMap'],
    [[[1, 2]], [2], 'shift'],
    [[3, [1, 2]], [3, 1, 2], 'unshift'],
    [[[1, 2]], [1], 'pop'],
    [[3, [1, 2]], [1, 2, 3], 'push'],
    [[strictEqual, [1, 3, 2], [1, 2, 3]], false, 'equal'],
    [[strictEqual, [1, 2], [1, 2, 3]], false, 'equal'],
    [[strictEqual, [1, 2, 3], [1, 2]], false, 'equal'],
    [[strictEqual, [1, 2, 3], [1, '2', 3]], false, 'equal'],
    [[strictEqual, [1, 2, 3], [1, 2, 3]], true, 'equal'],
    [[strictEqual, [], []], true, 'equal'],
    [[length3, [1, 2, 3, 4, 5]], [[], [1, 2, 3, 4, 5]], 'spanPrefix'],
    [[lengthLt3, [1, 2, 3, 4, 5]], [[1, 2], [3, 4, 5]], 'spanPrefix'],
    [[length3, [1, 2, 3, 4, 5]], [], 'takeWhilePrefix'],
    [[lengthLt3, [1, 2, 3, 4, 5]], [1, 2], 'takeWhilePrefix'],
    [[allEqual2, [2, 2, 3, 2]], [2, 2], 'takeWhilePrefix'],
    [[allEqual2, [2, 2]], [2, 2], 'takeWhilePrefix'],
    [[[[1, 2, 3], []]], [[1, 2], [3]], 'popUnshift'],
    [[[[1, 2], [3]]], [[1], [2, 3]], 'popUnshift'],
    [[[[1], [2, 3]]], [[], [1, 2, 3]], 'popUnshift'],
    [[[[], [1, 2, 3]]], [[], [1, 2, 3]], 'popUnshift'],
    [[[[1, 2, 3], []]], [[1, 2, 3], []], 'pushShift'],
    [[[[1, 2], [3]]], [[1, 2, 3], []], 'pushShift'],
    [[[[1], [2, 3]]], [[1, 2], [3]], 'pushShift'],
    [[[[], [1, 2, 3]]], [[1], [2, 3]], 'pushShift'],
    [[lt(3), [1, 2, 3, 1]], [[1, 2], [3, 1]], 'span'],
    [[lt(3), [1, 2]], [[1, 2], []], 'span'],
    [[lt(2), [1, 2, 3, 1]], [[1], [2, 3, 1]], 'span'],
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
    [[mul(2), 3, 1], [1, 2, 4], 'iterateN'],
    [[mul(2), gt(5), 1], [1, 2, 4, 8], 'iterate'],
    [[append1, length3, []], [1, 1, 1], 'unfold'],
    [[[1, 5, 6]], 1, 'first'],
    [[[1, 5, 6]], 6, 'last'],
    [[mul(3), 3], [0, 3, 6], 'sequence'],
    [[3, 'q'], ['q', 'q', 'q'], 'repeat'],
    [[4, 7], [4, 5, 6, 7], 'range'],
    [[3], [0, 1, 2], 'index'],
    [[gt(3), [0, 3, 1]], false, 'any'],
    [[gt(3), [0, 4, 1]], true, 'any'],
    [[gt(3), [6, 3, 4]], false, 'all'],
    [[gt(3), [6, 4]], true, 'all'],
    [['a', [4, 6]], ['a', 4, 6], 'prepend'],
    [['a', [4, 6]], [4, 6, 'a'], 'append'],
    [[1, 'a', [4, 6]], [4, 'a', 6], 'insert'],
    [[7, [4, 6]], false, 'contains'],
    [[4, [4, 6]], true, 'contains'],
    [[[5, 4], [4, 6]], [4], 'intersect'],
    [[[5, 4], [4, 6]], [5, 4, 6], 'union'],
    [[[5, 4, 4, 5]], [5, 4], 'unique'],
    [[lt(6), [7, 4, 6, 5]], [[4, 5], [7, 6]], 'partition'],
    [[2, [4, 5, 6, 7]], [[4, 5], [6, 7]], 'split'],
    [[1, -1, [4, 5, 6, 7]], [5, 6], 'slice'],
    [[1, 3, [4, 5, 6, 7]], [5, 6], 'slice'],
    [[lt(6), [4, 5, 6]], [6], 'dropWhile'],
    [[lt(6), [4, 5]], [], 'dropWhile'],
    [[2, [4, 5, 6]], [6], 'drop'],
    [[lt(6), [4, 5, 6]], [4, 5], 'takeWhile'],
    [[lt(6), [4, 5]], [4, 5], 'takeWhile'],
    [[2, [4, 5, 6]], [4, 5], 'take'],
    [[add, 0, [4, 5, 6]], 15, 'fold'],
    [[add, [1, 2, 3], [4, 5, 6]], [5, 7, 9], 'zipWith'],
    [[sub, [2, 3, 1]], [3, 2, 1], 'sort'],
    [[[1, 2, 3]], [3, 2, 1], 'reverse'],
    [[lt(4), [2, 4, 1, 5, 3]], [2, 1, 3], 'filter'],
    [[1, 'apple', [1, 2]], [1, 'apple'], 'set'],
    [[1, add(1), [1, 2]], [1, 3], 'update'],
    [[1, [1, 2]], 2, 'get'],
    [[[add(3)], [1, 2]], [4, 2], 'ap'],
    [[[add(3), mul(4)], [1, 2]], [4, 8], 'ap'],
    [[add(3), [1, 2]], [4, 5], 'map'],
    [[uncurriedAdd, ['1', '2']], ['1undefined', '2undefined'], 'map'],
    [[['a', 'b'], ['c', 'd']], ['a', 'b', 'c', 'd'], 'concat'],
    [[{ length: 2, 0: 'a', 1: 'b' }], ['a', 'b'], 'from'],
    [['abc'], ['a', 'b', 'c'], 'from'],
    [[[2, 0], [1, 2, 3]], [3, 1], 'reIndex'],
    [[[2, 0, 1], [1, 2, 3]], [3, 1, 2], 'reIndex'],
    [[[1, 2, 3]], 3, 'length'],
    [[], [], 'empty'],
    [[9], [9], 'of']
  ].map(arrange({ inputs: 0, predicate: 1, contra: 2 }))
    .map(x => ap({ predicate: equalDeep, contra: get }, x))

  /* exports */
  module.exports = equalityTests.map(sync)
})()

