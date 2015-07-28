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
      values: leaf.values,
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

  inject (key, val) {
    if (this.debug) console.log(`INJECT ${key}`)
    var leaf = this._findLeaf(key)
    leaf.injectData(key, val)
    this._splitLeaf(leaf)
  }

  eject (key, val) {
    if (this.debug) console.log(`EJECT ${key}`)
    var leaf = this._findLeaf(key)
    leaf.ejectData(key, val)
    this._mergeLeaf(leaf)
  }

  _minKeys () {
    return Math.floor(this.bf / 2)
  }

  _maxKeys () {
    return this.bf - 1
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
    if (leaf.size() > this._maxKeys()) {
      if (this.debug) {
        console.log(`BEFORE SPLIT LEAF ${leaf.id}`)
        console.log(JSON.stringify(this.dumpTree(), null, 2))
      }
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

      if (leaf === this.root) { // If we are splitting the root
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
          leftLeaf.setParentOnChildren()

          rightLeaf.parent = parent
          rightLeaf.keys = keys.slice(splitPoint + 1)
          rightLeaf.children = children.slice(splitPoint + 1)
          rightLeaf.setParentOnChildren()
          if (this.debug) {
            console.log('SPLIT ROOT NODE')
            console.log(JSON.stringify(this.dumpTree(), null, 2))
          }
        }

      } else { // If we are not splitting root

        var childPos = parent.children.indexOf(leaf)

        if (leaf.values.length > 0) { // If we are splitting a leaf

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
          leftLeaf.setParentOnChildren()
          rightLeaf.children = children.slice(splitPoint + 1)
          rightLeaf.setParentOnChildren()
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

  _mergeLeaf (leaf) {
    if (leaf.hasChildren()) {
      if (leaf.children.length > this._minKeys()) {
        if (leaf.children.length > leaf.keys.length) {
          return // Doesn't need to merge
        }
      }
    } else {
      if (leaf.size() >= this._minKeys()) {
        return // Doesn't need to merge
      }
    }

    if (this.debug) {
      console.log(`BEFORE MERGE LEAF ${leaf.id}`)
      console.log(JSON.stringify(this.dumpTree(), null, 2))
    }

    if (leaf === this.root) { // If we are merging the root
      if (leaf.children.length === 1) {
        leaf.children[0].parent = null
        this.root = leaf.children[0]

        leaf.children = null
      } else {
        // leaf.updateKeys()
        leaf.setParentOnChildren()
      }
    } else {
      // Check Siblings
      var childPos = leaf.parent.children.indexOf(leaf)
      var leftSibling = null
      var rightSibling = null

      if (childPos > 0) {
        leftSibling = leaf.parent.children[childPos - 1]
      }

      if (childPos < (leaf.parent.children.length - 1)) {
        rightSibling = leaf.parent.children[childPos + 1]
      }

      if (leaf.children.length > 0) { // If we are merging a branch

        // Try to get a key from a sibling if they are big enough
        if (leftSibling && leftSibling.size() > this._minKeys()) { // Check the left sibling

          leaf.keys.unshift(leftSibling.keys.pop())
          leaf.children.unshift(leftSibling.children.pop())
          utils.replaceAt(leaf.parent.keys, leaf.keys[0], (childPos - 1))
          // leaf.updateKeys()
          leaf.setParentOnChildren()
          // leftSibling.updateKeys()
          leftSibling.setParentOnChildren()

          // leaf.parent.updateKeys()

        } else if (rightSibling && rightSibling.size() > this._minKeys()) { // Check the right sibling

          leaf.keys.push(rightSibling.keys.shift())
          leaf.children.push(rightSibling.children.shift())
          utils.replaceAt(leaf.parent.keys, rightSibling.keys[0], (leaf.parent.children.indexOf(rightSibling) - 1))
          // leaf.updateKeys()
          leaf.setParentOnChildren()
          // rightSibling.updateKeys()
          rightSibling.setParentOnChildren()

          // leaf.parent.updateKeys()

        } else {

          if (leftSibling) { // Copy remaining keys and children to a sibling
            leftSibling.keys = leftSibling.keys.concat(leaf.keys)
            leftSibling.children = leftSibling.children.concat(leaf.children)
            // leftSibling.updateKeys()
            leftSibling.setParentOnChildren()
          } else {
            rightSibling.keys = leaf.keys.concat(rightSibling.keys)
            rightSibling.children = leaf.children.concat(rightSibling.children)
            // rightSibling.updateKeys()
            rightSibling.setParentOnChildren()
          }

          // Empty Leaf
          leaf.keys = []
          leaf.children = []

          // Remove leaf from parent
          utils.removeAt(leaf.parent.children, childPos)

          // Update keys on parent branch
          // leaf.parent.updateKeys()

        }

        if (this.debug) {
          console.log('MERGE BRANCH NODE')
          console.log(JSON.stringify(this.dumpTree(), null, 2))
        }

        this._mergeLeaf(leaf.parent)

      } else { // If we are merging a leaf

        // Try to get a key from a sibling if they are big enough
        if (leftSibling && leftSibling.size() > this._minKeys()) { // Check the left sibling

          leaf.keys.unshift(leftSibling.keys.pop())
          leaf.values.unshift(leftSibling.values.pop())
          utils.replaceAt(leaf.parent.keys, leaf.keys[0], (childPos - 1))

        } else if (rightSibling && rightSibling.size() > this._minKeys()) { // Check the right sibling

          leaf.keys.push(rightSibling.keys.shift())
          leaf.values.push(rightSibling.values.shift())
          utils.replaceAt(leaf.parent.keys, rightSibling.keys[0], (leaf.parent.children.indexOf(rightSibling) - 1))

        } else { // There is no sibling to get a value from, remove the leaf

          if (leftSibling) { // Copy remaining keys and values to a sibling
            leftSibling.keys = leftSibling.keys.concat(leaf.keys)
            leftSibling.values = leftSibling.values.concat(leaf.values)
            leftSibling.next = leaf.next
          } else {
            rightSibling.keys = leaf.keys.concat(rightSibling.keys)
            rightSibling.values = leaf.values.concat(rightSibling.values)
            rightSibling.prev = leaf.prev
          }

          // Empty Leaf
          leaf.keys = []
          leaf.values = []

          // Remove leaf from parent
          utils.removeAt(leaf.parent.children, childPos)

          // // Update keys on parent branch
          leaf.parent.updateKeys()

        }

        if (this.debug) {
          console.log('MERGE BRANCH LEAF')
          console.log(JSON.stringify(this.dumpTree(), null, 2))
        }

        this._mergeLeaf(leaf.parent)

      }

    }

  }
}

module.exports = BPlusIndex
