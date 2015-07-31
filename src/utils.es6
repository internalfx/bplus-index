'use strict'

// Some code taken with gratitiude from the LokiJS project. Thank you Joe Minichino!

var utils = {

  defaultSort: (a, b) => {
    return (a < b) ? -1 : ((a > b) ? 1 : 0)
  },

  mergeObj: (o1, o2) => {
    if (o1 == null || o2 == null) {
      return o1
    }

    for (var key in o2) {
      if (o2.hasOwnProperty(key)) {
        o1[key] = o2[key]
      }
    }

    return o1
  },

  unique_id: () => {
    return `${(Math.random() + 1).toString(36).substr(2)}`
  },

  insertAt: (array, value, index) => {
    array.splice(index, 0, value)
    return array
  },

  removeAt: (array, index) => {
    array.splice(index, 1);
    return array
  },

  replaceAt: (array, value, index) => {
    array[index] = value
    return array
  },

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
  },

  detectKey: (node) => {
    if (node.hasChildren()) {
      return utils.detectKey(node.children[0])
    } else {
      return node.keys[0]
    }
  }

}

module.exports = utils
