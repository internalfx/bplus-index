(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["BPlusTree"] = factory();
	else
		root["BPlusTree"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Leaf = __webpack_require__(1);
	var utils = __webpack_require__(2);

	var BPlusIndex = (function () {
	  function BPlusIndex() {
	    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    _classCallCheck(this, BPlusIndex);

	    this.bf = config.branchingFactor || 50;
	    this.debug = config.debug || false;
	    this.root = new Leaf();
	  }

	  _createClass(BPlusIndex, [{
	    key: 'dumpTree',
	    value: function dumpTree(leaf) {
	      leaf = leaf || this.root;
	      var struct = {
	        id: leaf.id,
	        keys: leaf.keys,
	        values: leaf.values,
	        children: []
	      };

	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        for (var _iterator = leaf.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var child = _step.value;

	          struct.children.push(this.dumpTree(child));
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator['return']) {
	            _iterator['return']();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }

	      return struct;
	    }
	  }, {
	    key: 'get',
	    value: function get(key) {
	      return this._findLeaf(key).get(key);
	    }
	  }, {
	    key: 'inject',
	    value: function inject(key, val) {
	      if (this.debug) console.log('INJECT ' + key + ' = ' + val);
	      var leaf = this._findLeaf(key);
	      leaf.injectData(key, val);
	      this._splitLeaf(leaf);
	    }
	  }, {
	    key: 'eject',
	    value: function eject(key, val) {
	      if (this.debug) console.log('EJECT ' + key + ' = ' + val);
	      var leaf = this._findLeaf(key);
	      var loc = leaf.ejectData(key, val);
	      if (loc.found && loc.index === 0 && leaf.parent) {
	        if (leaf.keys.length > 0 && key !== leaf.keys[0]) {
	          if (this.debug) console.log('REPLACE LEAF KEYS ' + key + ' -> ' + leaf.keys[0]);
	          leaf.parent.replaceKey(key, leaf.keys[0]);
	        }
	      }
	      this._mergeLeaf(leaf);
	    }
	  }, {
	    key: '_minKeys',
	    value: function _minKeys() {
	      return Math.floor(this.bf / 2);
	    }
	  }, {
	    key: '_maxKeys',
	    value: function _maxKeys() {
	      return this.bf - 1;
	    }

	    // Private Methods
	  }, {
	    key: '_findLeaf',
	    value: function _findLeaf(key, leaf) {
	      leaf = leaf || this.root;
	      if (leaf.children.length === 0) {
	        return leaf;
	      } else {
	        for (var i = 0; i <= leaf.size(); i++) {
	          if (key < leaf.keys[i] || i === leaf.size()) {
	            return this._findLeaf(key, leaf.children[i]);
	          }
	        }
	      }
	    }
	  }, {
	    key: '_splitLeaf',
	    value: function _splitLeaf(leaf) {
	      if (leaf.size() > this._maxKeys()) {
	        if (this.debug) {
	          console.log('BEFORE SPLIT LEAF ' + leaf.id);
	          console.log(JSON.stringify(this.dumpTree(), null, 2));
	        }
	        var splitPoint = Math.floor(leaf.size() / 2);

	        var parent = leaf.parent;
	        var prev = leaf.prev;
	        var next = leaf.next;
	        var children = leaf.children;
	        var keys = leaf.keys;
	        var values = leaf.values;

	        // TODO: Optimize: we could re-use one of the leaves
	        var leftLeaf = new Leaf();
	        var rightLeaf = new Leaf();

	        if (prev != null) {
	          prev.next = leftLeaf;
	        }
	        if (next != null) {
	          next.prev = rightLeaf;
	        }

	        leftLeaf.parent = parent;
	        leftLeaf.prev = prev;
	        leftLeaf.next = rightLeaf;
	        leftLeaf.children = children.slice(0, splitPoint);
	        leftLeaf.keys = keys.slice(0, splitPoint);
	        leftLeaf.values = values.slice(0, splitPoint);

	        rightLeaf.parent = parent;
	        rightLeaf.prev = leftLeaf;
	        rightLeaf.next = next;
	        rightLeaf.children = children.slice(splitPoint);
	        rightLeaf.keys = keys.slice(splitPoint);
	        rightLeaf.values = values.slice(splitPoint);

	        // In a B+tree only leaves contain data, everything else is a node

	        if (leaf === this.root) {
	          // If we are splitting the root
	          if (leaf.values.length > 0) {
	            // If the root is also a leaf (has data)
	            parent = this.root = new Leaf();
	            parent.children = [leftLeaf, rightLeaf];
	            parent.keys = [keys[splitPoint]];
	            leftLeaf.parent = parent;
	            rightLeaf.parent = parent;
	            if (this.debug) {
	              console.log('SPLIT ROOT LEAF');
	              console.log(JSON.stringify(this.dumpTree(), null, 2));
	            }
	          } else {
	            // If the root is a node)
	            parent = this.root = new Leaf();
	            parent.children = [leftLeaf, rightLeaf];
	            parent.keys = [keys[splitPoint]];
	            leftLeaf.parent = parent;
	            leftLeaf.children = children.slice(0, splitPoint + 1);
	            leftLeaf.setParentOnChildren();

	            rightLeaf.parent = parent;
	            rightLeaf.keys = keys.slice(splitPoint + 1);
	            rightLeaf.children = children.slice(splitPoint + 1);
	            rightLeaf.setParentOnChildren();
	            if (this.debug) {
	              console.log('SPLIT ROOT NODE');
	              console.log(JSON.stringify(this.dumpTree(), null, 2));
	            }
	          }
	        } else {
	          // If we are not splitting root

	          var childPos = parent.children.indexOf(leaf);

	          if (leaf.values.length > 0) {
	            // If we are splitting a leaf

	            utils.replaceAt(parent.keys, leftLeaf.keys[0], childPos - 1);
	            utils.replaceAt(parent.children, leftLeaf, childPos);
	            utils.insertAt(parent.keys, rightLeaf.keys[0], childPos);
	            utils.insertAt(parent.children, rightLeaf, childPos + 1);
	            if (this.debug) {
	              console.log('SPLIT BRANCH LEAF');
	              console.log(JSON.stringify(this.dumpTree(), null, 2));
	            }
	            this._splitLeaf(parent);
	          } else {
	            // If we are splitting a node

	            rightLeaf.keys = keys.slice(splitPoint + 1);
	            leftLeaf.children = children.slice(0, splitPoint + 1);
	            leftLeaf.setParentOnChildren();
	            rightLeaf.children = children.slice(splitPoint + 1);
	            rightLeaf.setParentOnChildren();
	            utils.replaceAt(parent.children, leftLeaf, childPos);
	            utils.insertAt(parent.keys, keys[splitPoint], childPos);
	            utils.insertAt(parent.children, rightLeaf, childPos + 1);
	            if (this.debug) {
	              console.log('SPLIT BRANCH NODE');
	              console.log(JSON.stringify(this.dumpTree(), null, 2));
	            }
	            this._splitLeaf(parent);
	          }
	        }
	      }
	    }
	  }, {
	    key: '_mergeLeaf',
	    value: function _mergeLeaf(leaf) {
	      if (leaf.hasChildren()) {
	        if (leaf.children.length > this._minKeys()) {
	          if (leaf.children.length > leaf.keys.length) {
	            return; // Doesn't need to merge
	          }
	        }
	      } else {
	          if (leaf.size() >= this._minKeys()) {
	            return; // Doesn't need to merge
	          }
	        }

	      if (this.debug) {
	        console.log('BEFORE MERGE LEAF ' + leaf.id);
	        console.log(JSON.stringify(this.dumpTree(), null, 2));
	      }

	      if (leaf === this.root) {
	        // If we are merging the root
	        if (leaf.children.length === 1) {
	          leaf.children[0].parent = null;
	          this.root = leaf.children[0];
	          this.root.updateKeys();

	          leaf.children = null;
	        } else {
	          leaf.updateKeys();
	          leaf.setParentOnChildren();
	        }
	      } else {
	        // Check Siblings
	        var childPos = leaf.parent.children.indexOf(leaf);
	        var leftSibling = null;
	        var rightSibling = null;

	        if (childPos > 0) {
	          leftSibling = leaf.parent.children[childPos - 1];
	        }

	        if (childPos < leaf.parent.children.length - 1) {
	          rightSibling = leaf.parent.children[childPos + 1];
	        }

	        if (leaf.children.length > 0) {
	          // If we are merging a branch

	          // Try to get a key from a sibling if they are big enough
	          if (leftSibling && leftSibling.size() > this._minKeys()) {
	            // Check the left sibling

	            leaf.keys.unshift(leftSibling.keys.pop());
	            leaf.children.unshift(leftSibling.children.pop());
	            utils.replaceAt(leaf.parent.keys, leaf.keys[0], childPos - 1);
	            leaf.updateKeys();
	            leaf.setParentOnChildren();
	            leftSibling.updateKeys();
	            leftSibling.setParentOnChildren();

	            leaf.parent.updateKeys();
	          } else if (rightSibling && rightSibling.size() > this._minKeys()) {
	            // Check the right sibling

	            leaf.keys.push(rightSibling.keys.shift());
	            leaf.children.push(rightSibling.children.shift());
	            utils.replaceAt(leaf.parent.keys, rightSibling.keys[0], leaf.parent.children.indexOf(rightSibling) - 1);
	            leaf.updateKeys();
	            leaf.setParentOnChildren();
	            rightSibling.updateKeys();
	            rightSibling.setParentOnChildren();

	            leaf.parent.updateKeys();
	          } else {

	            if (leftSibling) {
	              // Copy remaining keys and children to a sibling
	              leftSibling.keys = leftSibling.keys.concat(leaf.keys);
	              leftSibling.children = leftSibling.children.concat(leaf.children);
	              leftSibling.updateKeys();
	              leftSibling.setParentOnChildren();
	            } else {
	              rightSibling.keys = leaf.keys.concat(rightSibling.keys);
	              rightSibling.children = leaf.children.concat(rightSibling.children);
	              rightSibling.updateKeys();
	              rightSibling.setParentOnChildren();
	            }

	            // Empty Leaf
	            leaf.keys = [];
	            leaf.children = [];

	            // Remove leaf from parent
	            utils.removeAt(leaf.parent.children, childPos);

	            // Update keys on parent branch
	            leaf.parent.updateKeys();
	          }

	          if (this.debug) {
	            console.log('MERGE BRANCH NODE');
	            console.log(JSON.stringify(this.dumpTree(), null, 2));
	          }

	          this._mergeLeaf(leaf.parent);
	        } else {
	          // If we are merging a leaf

	          // Try to get a key from a sibling if they are big enough
	          if (leftSibling && leftSibling.size() > this._minKeys()) {
	            // Check the left sibling

	            leaf.keys.unshift(leftSibling.keys.pop());
	            leaf.values.unshift(leftSibling.values.pop());
	            utils.replaceAt(leaf.parent.keys, leaf.keys[0], childPos - 1);
	          } else if (rightSibling && rightSibling.size() > this._minKeys()) {
	            // Check the right sibling

	            leaf.keys.push(rightSibling.keys.shift());
	            leaf.values.push(rightSibling.values.shift());
	            utils.replaceAt(leaf.parent.keys, rightSibling.keys[0], leaf.parent.children.indexOf(rightSibling) - 1);
	          } else {
	            // There is no sibling to get a value from, remove the leaf

	            if (leftSibling) {
	              // Copy remaining keys and values to a sibling
	              leftSibling.keys = leftSibling.keys.concat(leaf.keys);
	              leftSibling.values = leftSibling.values.concat(leaf.values);
	              leftSibling.next = leaf.next;
	            } else {
	              rightSibling.keys = leaf.keys.concat(rightSibling.keys);
	              rightSibling.values = leaf.values.concat(rightSibling.values);
	              rightSibling.prev = leaf.prev;
	            }

	            // Empty Leaf
	            leaf.keys = [];
	            leaf.values = [];

	            // Remove leaf from parent
	            utils.removeAt(leaf.parent.children, childPos);

	            // // Update keys on parent branch
	            leaf.parent.updateKeys();
	          }

	          if (this.debug) {
	            console.log('MERGE BRANCH LEAF');
	            console.log(JSON.stringify(this.dumpTree(), null, 2));
	          }

	          this._mergeLeaf(leaf.parent);
	        }
	      }
	    }
	  }]);

	  return BPlusIndex;
	})();

	module.exports = BPlusIndex;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var utils = __webpack_require__(2);

	var Leaf = (function () {
	  function Leaf() {
	    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    _classCallCheck(this, Leaf);

	    this.id = utils.unique_id();
	    this.parent = null;
	    this.prev = null;
	    this.next = null;
	    this.children = [];
	    this.keys = [];
	    this.values = [];
	  }

	  _createClass(Leaf, [{
	    key: 'injectData',
	    value: function injectData(key) {
	      var val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

	      if (val !== null) {
	        var location = utils.binarySearch(this.keys, key);
	        if (location.found) {
	          var dataLocation = utils.binarySearch(this.values[location.index], val);
	          utils.insertAt(this.values[location.index], val, dataLocation.index);
	        } else {
	          utils.insertAt(this.keys, key, location.index);
	          utils.insertAt(this.values, [val], location.index);
	        }
	      }
	    }
	  }, {
	    key: 'ejectData',
	    value: function ejectData(key) {
	      var val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

	      var keyLocation = utils.binarySearch(this.keys, key);
	      if (keyLocation.found) {
	        if (val === null) {
	          // If no val is passed in delete all data at this key
	          utils.removeAt(this.keys, keyLocation.index);
	          utils.removeAt(this.values, keyLocation.index);
	        } else {
	          // remove only the relevant value
	          var dataLocation = utils.binarySearch(this.values[keyLocation.index], val);
	          if (dataLocation.found) {
	            utils.removeAt(this.values[keyLocation.index], dataLocation.index);
	            if (this.values[keyLocation.index].length === 0) {
	              // if this was the last value at this key, delete the key too.
	              utils.removeAt(this.keys, keyLocation.index);
	              utils.removeAt(this.values, keyLocation.index);
	            }
	          }
	        }
	      }

	      return keyLocation;
	    }
	  }, {
	    key: 'get',
	    value: function get(key) {
	      var location = utils.binarySearch(this.keys, key);
	      if (location.found) {
	        return this.values[location.index];
	      } else {
	        return null;
	      }
	    }
	  }, {
	    key: 'size',
	    value: function size() {
	      return this.keys.length;
	    }
	  }, {
	    key: 'hasChildren',
	    value: function hasChildren() {
	      return this.children.length > 0;
	    }
	  }, {
	    key: 'setParentOnChildren',
	    value: function setParentOnChildren() {
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var child = _step.value;

	          child.parent = this;
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator['return']) {
	            _iterator['return']();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }
	    }
	  }, {
	    key: 'replaceKey',
	    value: function replaceKey(key, newKey) {
	      var loc = utils.binarySearch(this.keys, key);

	      if (loc.found) {
	        if (this.debug) console.log('replace ' + key + ' with ' + newKey + ' in leaf ' + this.id);
	        utils.replaceAt(this.keys, newKey, loc.index);
	      }

	      if (this.parent) {
	        this.parent.replaceKey(key, newKey);
	      }
	    }
	  }, {
	    key: 'updateKeys',
	    value: function updateKeys() {
	      if (this.hasChildren()) {
	        var keys = [];
	        for (var i = 1; i < this.children.length; i++) {
	          var child = this.children[i];
	          keys.push(this.detectKey(child));
	        }
	        if (keys.length > 0) {
	          this.keys = keys;
	        }
	      }
	    }
	  }, {
	    key: 'detectKey',
	    value: function detectKey(node) {
	      if (node.hasChildren()) {
	        return this.detectKey(node.children[0]);
	      } else {
	        return node.keys[0];
	      }
	    }
	  }]);

	  return Leaf;
	})();

	module.exports = Leaf;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Some code taken with gratitiude from the LokiJS project. Thank you Joe Minichino!

	var pullAt = __webpack_require__(3);

	var utils = {

	  defaultSort: function defaultSort(a, b) {
	    return a < b ? -1 : a > b ? 1 : 0;
	  },

	  sortedInsert: function sortedInsert(key, array) {
	    array.splice(utils.insertionPoint(key, array) + 1, 0, key);
	    return array;
	  },

	  unique_id: function unique_id() {
	    return '' + (Math.random() + 1).toString(36).substr(2);
	  },

	  insertAt: function insertAt(array, value, index) {
	    array.splice(index, 0, value);
	    return array;
	  },

	  removeAt: function removeAt(array, index) {
	    pullAt(array, index);
	    return array;
	  },

	  replaceAt: function replaceAt(array, value, index) {
	    array[index] = value;
	    return array;
	  },

	  insertionPoint: function insertionPoint(array, value, start, end) {
	    start = start || 0;
	    end = end || array.length;
	    var pivot = parseInt(start + (end - start) / 2, 10);
	    if (end - start <= 1 || array[pivot] === value) {
	      return pivot;
	    }
	    if (array[pivot] < value) {
	      return utils.insertionPoint(value, array, pivot, end);
	    } else {
	      return utils.insertionPoint(value, array, start, pivot);
	    }
	  },

	  binarySearch: function binarySearch(array, value) {
	    var userFunc = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	    var lo = 0;
	    var hi = array.length;
	    var compared;
	    var mid;
	    var func = userFunc || utils.defaultSort;

	    while (lo < hi) {
	      mid = (lo + hi) / 2 | 0;
	      compared = func(value, array[mid]);
	      if (compared === 0) {
	        return {
	          found: true,
	          index: mid
	        };
	      } else if (compared < 0) {
	        hi = mid;
	      } else {
	        lo = mid + 1;
	      }
	    }
	    return {
	      found: false,
	      index: hi
	    };
	  }

	};

	module.exports = utils;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	var baseAt = __webpack_require__(4),
	    baseCompareAscending = __webpack_require__(5),
	    baseFlatten = __webpack_require__(6),
	    basePullAt = __webpack_require__(9),
	    restParam = __webpack_require__(10);

	/**
	 * Removes elements from `array` corresponding to the given indexes and returns
	 * an array of the removed elements. Indexes may be specified as an array of
	 * indexes or as individual arguments.
	 *
	 * **Note:** Unlike `_.at`, this method mutates `array`.
	 *
	 * @static
	 * @memberOf _
	 * @category Array
	 * @param {Array} array The array to modify.
	 * @param {...(number|number[])} [indexes] The indexes of elements to remove,
	 *  specified as individual indexes or arrays of indexes.
	 * @returns {Array} Returns the new array of removed elements.
	 * @example
	 *
	 * var array = [5, 10, 15, 20];
	 * var evens = _.pullAt(array, 1, 3);
	 *
	 * console.log(array);
	 * // => [5, 15]
	 *
	 * console.log(evens);
	 * // => [10, 20]
	 */
	var pullAt = restParam(function(array, indexes) {
	  indexes = baseFlatten(indexes);

	  var result = baseAt(array, indexes);
	  basePullAt(array, indexes.sort(baseCompareAscending));
	  return result;
	});

	module.exports = pullAt;


/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/** Used to detect unsigned integer values. */
	var reIsUint = /^\d+$/;

	/**
	 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * The base implementation of `_.at` without support for string collections
	 * and individual key arguments.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {number[]|string[]} props The property names or indexes of elements to pick.
	 * @returns {Array} Returns the new array of picked elements.
	 */
	function baseAt(collection, props) {
	  var index = -1,
	      isNil = collection == null,
	      isArr = !isNil && isArrayLike(collection),
	      length = isArr ? collection.length : 0,
	      propsLength = props.length,
	      result = Array(propsLength);

	  while(++index < propsLength) {
	    var key = props[index];
	    if (isArr) {
	      result[index] = isIndex(key, length) ? collection[key] : undefined;
	    } else {
	      result[index] = isNil ? undefined : collection[key];
	    }
	  }
	  return result;
	}

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	/**
	 * Checks if `value` is array-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value));
	}

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = baseAt;


/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.2 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/**
	 * The base implementation of `compareAscending` which compares values and
	 * sorts them in ascending order without guaranteeing a stable sort.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {number} Returns the sort order indicator for `value`.
	 */
	function baseCompareAscending(value, other) {
	  if (value !== other) {
	    var valIsNull = value === null,
	        valIsUndef = value === undefined,
	        valIsReflexive = value === value;

	    var othIsNull = other === null,
	        othIsUndef = other === undefined,
	        othIsReflexive = other === other;

	    if ((value > other && !othIsNull) || !valIsReflexive ||
	        (valIsNull && !othIsUndef && othIsReflexive) ||
	        (valIsUndef && othIsReflexive)) {
	      return 1;
	    }
	    if ((value < other && !valIsNull) || !othIsReflexive ||
	        (othIsNull && !valIsUndef && valIsReflexive) ||
	        (othIsUndef && valIsReflexive)) {
	      return -1;
	    }
	  }
	  return 0;
	}

	module.exports = baseCompareAscending;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 3.1.4 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	var isArguments = __webpack_require__(7),
	    isArray = __webpack_require__(8);

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	/**
	 * The base implementation of `_.flatten` with added support for restricting
	 * flattening and specifying the start index.
	 *
	 * @private
	 * @param {Array} array The array to flatten.
	 * @param {boolean} [isDeep] Specify a deep flatten.
	 * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
	 * @param {Array} [result=[]] The initial result value.
	 * @returns {Array} Returns the new flattened array.
	 */
	function baseFlatten(array, isDeep, isStrict, result) {
	  result || (result = []);

	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    var value = array[index];
	    if (isObjectLike(value) && isArrayLike(value) &&
	        (isStrict || isArray(value) || isArguments(value))) {
	      if (isDeep) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten(value, isDeep, isStrict, result);
	      } else {
	        arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	/**
	 * Checks if `value` is array-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value));
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = baseFlatten;


/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	/**
	 * Checks if `value` is array-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value));
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is classified as an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  return isObjectLike(value) && isArrayLike(value) &&
	    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	}

	module.exports = isArguments;


/***/ },
/* 8 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/** `Object#toString` result references. */
	var arrayTag = '[object Array]',
	    funcTag = '[object Function]';

	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = getNative(Array, 'isArray');

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(function() { return arguments; }());
	 * // => false
	 */
	var isArray = nativeIsArray || function(value) {
	  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	};

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in older versions of Chrome and Safari which return 'function' for regexes
	  // and Safari 8 equivalents which return 'object' for typed array constructors.
	  return isObject(value) && objToString.call(value) == funcTag;
	}

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(fnToString.call(value));
	  }
	  return isObjectLike(value) && reIsHostCtor.test(value);
	}

	module.exports = isArray;


/***/ },
/* 9 */
/***/ function(module, exports) {

	/**
	 * lodash 3.8.2 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/** Used to detect unsigned integer values. */
	var reIsUint = /^\d+$/;

	/** Used for native method references. */
	var arrayProto = Array.prototype;

	/** Native method references. */
	var splice = arrayProto.splice;

	/**
	 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * The base implementation of `_.pullAt` without support for individual
	 * index arguments and capturing the removed elements.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {number[]} indexes The indexes of elements to remove.
	 * @returns {Array} Returns `array`.
	 */
	function basePullAt(array, indexes) {
	  var length = array ? indexes.length : 0;
	  while (length--) {
	    var index = indexes[length];
	    if (index != previous && isIndex(index)) {
	      var previous = index;
	      splice.call(array, index, 1);
	    }
	  }
	  return array;
	}

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}

	module.exports = basePullAt;


/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * lodash 3.6.1 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as an array.
	 *
	 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.restParam(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function restParam(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        rest = Array(length);

	    while (++index < length) {
	      rest[index] = args[start + index];
	    }
	    switch (start) {
	      case 0: return func.call(this, rest);
	      case 1: return func.call(this, args[0], rest);
	      case 2: return func.call(this, args[0], args[1], rest);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = rest;
	    return func.apply(this, otherArgs);
	  };
	}

	module.exports = restParam;


/***/ }
/******/ ])
});
;