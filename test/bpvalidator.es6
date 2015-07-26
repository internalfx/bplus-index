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

  validateNode: (node, checks={}) => {
    var level = checks.level || 1
    var errors = []

    if (node.children.length > 0) {
      var childRanges = validator.getChildRanges(node, checks.range)
    }

    if (node.parent === null) {
      for (let i = 0; i < node.children.length; i++) {
        errors = errors.concat(validator.validateNode(node.children[i], {parent: node, level: 1}))
        errors = errors.concat(validator.validateNode(node.children[i], {range: childRanges[i], level: 1}))
      }
    }

    // Validate parent child relationship
    if (checks.parent) {
      if (node.parent !== checks.parent) {
        errors.push(`${validator.levelView(level)} ${node.id} has invalid parent! - should be child of ${checks.parent.id}`)
      }

      for (let i = 0; i < node.children.length; i++) {
        errors = errors.concat(validator.validateNode(node.children[i], {parent: node, level: level + 1}))
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

      if (node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
          errors = errors.concat(validator.validateNode(node.children[i], {range: childRanges[i], level: level + 1}))
        }
      }
    }

    return errors
  }

}

module.exports = (index) => {
  // console.log(index)
  return validator.validateNode(index.root)
}
