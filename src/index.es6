'use strict'

var Leaf = require('./leaf')
var utils = require('./utils')

class BPlusIndex {
  constructor (config={}) {
    this.bf = config.branchingFactor || 50
    this.debug = config.debug || false
    this.root = new Leaf()
  }

  dumpTree (leaf) {
    leaf = leaf || this.root
    var struct = {
      id: leaf.id,
      keys: leaf.keys,
      children: []
    }

    for (let child of leaf.children) {
      struct.children.push(this.dumpTree(child))
    }

    return struct
  }

  get (key) {
    return this._findLeaf(key).get(key)
  }

  insert (key, val) {
    var leaf = this._findLeaf(key)
    leaf.insertData(key, val)
    this._splitLeaf(leaf)
  }

  // Private Methods
  _findLeaf (key, leaf) {
    leaf = leaf || this.root
    if (leaf.children.length === 0) {
      return leaf
    } else {
      for (let i = 0; i <= leaf.size(); i++) {
        if (key < leaf.keys[i] || i === leaf.size()) {
          return this._findLeaf(key, leaf.children[i])
        }
      }
    }
  }

  _splitLeaf (leaf) {
    if (leaf.size() >= this.bf) {
      if (this.debug) console.log(`SPLIT LEAF ${leaf.id}`)
      var splitPoint = Math.floor(leaf.size() / 2)

      var parent = leaf.parent
      var prev = leaf.prev
      var next = leaf.next
      var children = leaf.children
      var keys = leaf.keys
      var values = leaf.values

      // TODO: Optimize: we could re-use one of the leaves
      var leftLeaf = new Leaf()
      var rightLeaf = new Leaf()

      if (prev != null) { prev.next = leftLeaf }
      if (next != null) { next.prev = rightLeaf }

      leftLeaf.parent = parent
      leftLeaf.prev = prev
      leftLeaf.next = rightLeaf
      leftLeaf.children = children.slice(0, splitPoint)
      leftLeaf.keys = keys.slice(0, splitPoint)
      leftLeaf.values = values.slice(0, splitPoint)

      rightLeaf.parent = parent
      rightLeaf.prev = leftLeaf
      rightLeaf.next = next
      rightLeaf.children = children.slice(splitPoint)
      rightLeaf.keys = keys.slice(splitPoint)
      rightLeaf.values = values.slice(splitPoint)

      // In a B+tree only leaves contain data, everything else is a node

      if (parent === null) { // If we are splitting the root
        if (leaf.values.length > 0) { // If the root is also a leaf (has data)
          parent = this.root = new Leaf()
          parent.children = [leftLeaf, rightLeaf]
          parent.keys = [keys[splitPoint]]
          leftLeaf.parent = parent
          rightLeaf.parent = parent
          if (this.debug) {
            console.log('SPLIT ROOT LEAF')
            console.log(JSON.stringify(this.dumpTree(), null, 2))
          }
        } else { // If the root is a node)
          parent = this.root = new Leaf()
          parent.children = [leftLeaf, rightLeaf]
          parent.keys = [keys[splitPoint]]
          leftLeaf.parent = parent
          leftLeaf.children = children.slice(0, splitPoint + 1)
          for (let child of leftLeaf.children) {
            child.parent = leftLeaf
          }
          rightLeaf.parent = parent
          rightLeaf.keys = keys.slice(splitPoint + 1)
          rightLeaf.children = children.slice(splitPoint + 1)
          for (let child of rightLeaf.children) {
            child.parent = rightLeaf
          }
          if (this.debug) {
            console.log('SPLIT ROOT NODE')
            console.log(JSON.stringify(this.dumpTree(), null, 2))
          }
        }

      } else { // If we are not splitting root

        var childPos = parent.children.indexOf(leaf)

        if (leaf.values.length > 0) { // If we splitting a leaf

          utils.replaceAt(parent.keys, leftLeaf.keys[0], childPos - 1)
          utils.replaceAt(parent.children, leftLeaf, childPos)
          utils.insertAt(parent.keys, rightLeaf.keys[0], childPos)
          utils.insertAt(parent.children, rightLeaf, childPos + 1)
          if (this.debug) {
            console.log('SPLIT BRANCH LEAF')
            console.log(JSON.stringify(this.dumpTree(), null, 2))
          }
          this._splitLeaf(parent)

        } else { // If we are splitting a node

          rightLeaf.keys = keys.slice(splitPoint + 1)
          leftLeaf.children = children.slice(0, splitPoint + 1)
          for (let child of leftLeaf.children) {
            child.parent = leftLeaf
          }
          rightLeaf.children = children.slice(splitPoint + 1)
          for (let child of rightLeaf.children) {
            child.parent = rightLeaf
          }
          utils.replaceAt(parent.children, leftLeaf, childPos)
          utils.insertAt(parent.keys, keys[splitPoint], childPos)
          utils.insertAt(parent.children, rightLeaf, childPos + 1)
          if (this.debug) {
            console.log('SPLIT BRANCH NODE')
            console.log(JSON.stringify(this.dumpTree(), null, 2))
          }
          this._splitLeaf(parent)

        }
      }
    }
  }
}

module.exports = BPlusIndex
