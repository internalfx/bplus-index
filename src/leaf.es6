'use strict'

var utils = require('./utils')

class Leaf {
  constructor (config={}) {
    this.id = Math.random()
    this.parent = null
    this.prev = null
    this.next = null
    this.children = []
    this.keys = []
    this.values = []
  }

  insertData (key, val) {
    var location = utils.binarySearch(this.keys, key)
    if (location.found) {
      this.values[location.index].push(val)
    } else {
      utils.insertAt(this.keys, key, location.index)
      utils.insertAt(this.values, [val], location.index)
    }
  }

  get (key) {
    var location = utils.binarySearch(this.keys, key).index
    return this.values[location]
  }

  size () {
    return this.keys.length
  }
}

module.exports = Leaf
