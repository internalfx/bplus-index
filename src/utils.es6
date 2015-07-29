'use strict'

// Some code taken with gratitiude from the LokiJS project. Thank you Joe Minichino!

var pullAt = require('lodash.pullat')

var utils = {

  defaultSort: (a, b) => {
    return (a < b) ? -1 : ((a > b) ? 1 : 0)
  },

  // sortedInsert: (key, array) => {
  //   array.splice(utils.insertionPoint(key, array) + 1, 0, key)
  //   return array
  // },

  unique_id: () => {
    return `${(Math.random() + 1).toString(36).substr(2)}`
  },

  insertAt: (array, value, index) => {
    array.splice(index, 0, value)
    return array
  },

  removeAt: (array, index) => {
    pullAt(array, index)
    return array
  },

  replaceAt: (array, value, index) => {
    array[index] = value
    return array
  },

  // insertionPoint: (array, value, start, end) => {
  //   start = start || 0
  //   end = end || array.length
  //   var pivot = parseInt(start + (end - start) / 2, 10)
  //   if (end - start <= 1 || array[pivot] === value) {
  //     return pivot
  //   }
  //   if (array[pivot] < value) {
  //     return utils.insertionPoint(value, array, pivot, end)
  //   } else {
  //     return utils.insertionPoint(value, array, start, pivot)
  //   }
  // },

  binarySearch: (array, value, userFunc=null) => {
    var lo = 0
    var hi = array.length
    var compared
    var mid
    var func = userFunc || utils.defaultSort

    while (lo < hi) {
      mid = ((lo + hi) / 2) | 0
      compared = func(value, array[mid])
      if (compared === 0) {
        return {
          found: true,
          index: mid
        }
      } else if (compared < 0) {
        hi = mid
      } else {
        lo = mid + 1
      }
    }
    return {
      found: false,
      index: hi
    }
  }

}

module.exports = utils
