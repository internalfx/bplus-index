
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

  injectData (key, val=null) {
    if (val !== null) {
      var location = utils.binarySearch(this.keys, key)
      if (location.found) {
        var dataLocation = utils.binarySearch(this.values[location.index], val)
        utils.insertAt(this.values[location.index], val, dataLocation.index)
      } else {
        utils.insertAt(this.keys, key, location.index)
        utils.insertAt(this.values, [val], location.index)
      }
    }
  }

  ejectData (key, val) {
    var keyLocation = utils.binarySearch(this.keys, key)
    if (keyLocation.found) {
      if (typeof val === 'undefined') { // If no val is passed in delete all data at this key
        utils.removeAt(this.keys, keyLocation.index)
        utils.removeAt(this.values, keyLocation.index)
      } else { // remove only the relevant value
        var dataLocation = utils.binarySearch(this.values[keyLocation.index], val)
        if (dataLocation.found) {
          utils.removeAt(this.values[keyLocation.index], dataLocation.index)
          if (this.values[keyLocation.index].length === 0) { // if this was the last value at this key, delete the key too.
            utils.removeAt(this.keys, keyLocation.index)
            utils.removeAt(this.values, keyLocation.index)
          }
        }
      }
    }

    return keyLocation
  }

  get (key) {
    var location = utils.binarySearch(this.keys, key)
    if (location.found) {
      return this.values[location.index]
    } else {
      return []
    }
  }

  size () {
    return this.keys.length
  }

  hasChildren () {
    return this.children.length > 0
  }

  setParentOnChildren () {
    for (let child of this.children) {
      child.parent = this
    }
  }

  replaceKey (key, newKey) {
    var loc = utils.binarySearch(this.keys, key)

    if (loc.found) {
      if (this.debug) console.log(`replace ${key} with ${newKey} in leaf ${this.id}`)
      utils.replaceAt(this.keys, newKey, loc.index)
    }

    if (this.parent) {
      this.parent.replaceKey(key, newKey)
    }
  }

  updateKeys () {
    if (this.hasChildren()) {
      var keys = []
      for (let i = 1; i < this.children.length; i++) {
        let child = this.children[i]
        keys.push(utils.detectKey(child))
      }
      if (keys.length > 0) {
        this.keys = keys
      }
    }
  }

}

module.exports = Leaf
