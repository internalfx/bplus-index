'use strict'

var validator = {

  getChildRanges: (node, parentRange) => {
    var ranges = []

    for (let i = 0; i <= node.keys.length; i++) {
      let range = []

      if (i === 0) {
        range = [null, node.keys[i]]
      } else if (i === (node.keys.length)) {
        range = [node.keys[i - 1], null]
      } else {
        range = [node.keys[i - 1], node.keys[i]]
      }

      if (parentRange) {
        if (parentRange[0] > range[0]) {
          range[0] = parentRange[0]
        }
        if (parentRange[1] < range[1]) {
          range[1] = parentRange[1]
        }
      }

      ranges.push(range)
    }
    return ranges
  },

  levelView: (level) => {
    var text = ''
    for (let i = 0; i < level; i++) {
      text += '--'
    }
    return text
  },

  validateNode: (tree, node=null, checks={}) => {
    var level = checks.level || 1
    node = node || tree.root
    var errors = []
    var childRanges = validator.getChildRanges(node, checks.range)
    var minKeys = Math.floor(tree.bf / 2) - 1
    var maxKeys = tree.bf

    // Check node for correct number of keys
    if (node.size() >= maxKeys) {
      errors.push(`${validator.levelView(level)} ${node.id} has too many keys! - should have no more than ${maxKeys} (has ${node.size()})`)
    }
    if (node.size() < minKeys) {
      if (node !== tree.root) {
        errors.push(`${validator.levelView(level)} ${node.id} has too few keys! - should have no less than ${minKeys} (has ${node.size()})`)
      }
    }

    // Check for correct number of children
    if (node.values.length === 0 && node.size() !== (node.children.length - 1)) {
      errors.push(`${validator.levelView(level)} ${node.id} number of children does not match number of keys! - (has ${node.size()} keys, and ${node.children.length} children)`)
    }

    // Validate parent child relationship
    if (checks.parent) {
      if (node.parent !== checks.parent) {
        errors.push(`${validator.levelView(level)} ${node.id} has invalid parent! - should be child of ${checks.parent.id}`)
      }
    }

    // Validate keys
    if (checks.range) {
      for (let key of node.keys) {
        if (checks.range[0] !== null) {
          if ((key >= checks.range[0]) === false) {
            errors.push(`${validator.levelView(level)} ${node.id} has invalid key! - ${key} should be >= ${checks.range[0]}`)
          }
        }
        if (checks.range[1] !== null) {
          if ((key < checks.range[1]) === false) {
            errors.push(`${validator.levelView(level)} ${node.id} has invalid key! - ${key} should be < ${checks.range[1]}`)
          }
        }
      }
    }

    for (let i = 0; i < node.children.length; i++) {
      errors = errors.concat(validator.validateNode(tree, node.children[i], {parent: node, range: childRanges[i], level: level + 1}))
    }

    return errors
  }

}

module.exports = (tree) => {
  return validator.validateNode(tree)
}
