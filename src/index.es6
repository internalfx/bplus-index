'use strict'

var Leaf = require('./leaf')

class BPlusIndex {
  constructor (config={}) {
    this.branchingFactor = config.branchingFactor || 10

    console.log(Leaf)
  }
}

module.exports = BPlusIndex
