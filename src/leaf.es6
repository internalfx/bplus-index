'use strict'

var utils = require('./utils')

class Leaf {
  constructor (config={}) {
    this.id = utils.unique_id()
    this.parent = null
    this.prev = null
    this.next = null
    this.children = []
    this.keys = []
    this.values = []
  }

  injectData (key, val) {
    var location = utils.binarySearch(this.keys, key)
    if (location.found) {
      this.values[location.index].push(val)
    } else {
      utils.insertAt(this.keys, key, location.index)
      utils.insertAt(this.values, [val], location.index)
    }
  }

  ejectData (key, val=null) {
    var keyLocation = utils.binarySearch(this.keys, key)
    if (keyLocation.found) {
      if (val === null) { // If no val is passed in delete all data at this key
        utils.removeAt(this.keys, keyLocation.index)
        utils.removeAt(this.values, keyLocation.index)
      } else { // remove only the relevant value
        var dataLocation = utils.binarySearch(this.values[keyLocation.index], val)
        if (dataLocation.found) {
          utils.removeAt(this.values[keyLocation.index], dataLocation.index)
          if (this.values[keyLocation.index].length === 0) { // if this was the last value at this key, delete it.
            utils.removeAt(this.keys, keyLocation.index)
            utils.removeAt(this.values, keyLocation.index)
          }
        }
      }
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
