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
	        prev: leaf.prev ? leaf.prev.id : null,
	        next: leaf.next ? leaf.next.id : null,
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
	    key: 'getAll',
	    value: function getAll() {
	      var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	      var options = utils.mergeObj({ sortDescending: false }, opts);
	      var startLeaf = this._findLeaf(utils.detectKey(this.root));
	      var currLoc = { index: 0, leaf: startLeaf };
	      var result = [];

	      while (currLoc !== null) {
	        result = result.concat(currLoc.leaf.values[currLoc.index]);
	        currLoc = this._stepForward(currLoc.index, currLoc.leaf);
	      }

	      if (options.sortDescending === true) {
	        result.reverse();
	      }

	      return result;
	    }
	  }, {
	    key: 'getRange',
	    value: function getRange(lowerBound, upperBound) {
	      var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	      var options = utils.mergeObj({ lowerInclusive: true, upperInclusive: false, sortDescending: false }, opts);
	      var result = [];

	      var startLeaf = this._findLeaf(lowerBound);

	      var loc = utils.binarySearch(startLeaf.keys, lowerBound);
	      var currLoc = { index: loc.index, leaf: startLeaf };

	      if (loc.index >= startLeaf.keys.length) {
	        currLoc = this._stepForward(currLoc.index, currLoc.leaf);
	      }

	      if (loc.found && options.lowerInclusive === false) {
	        currLoc = this._stepForward(currLoc.index, currLoc.leaf);
	      }

	      while (currLoc.leaf.keys[currLoc.index] < upperBound) {
	        result = result.concat(currLoc.leaf.values[currLoc.index]);
	        currLoc = this._stepForward(currLoc.index, currLoc.leaf);
	      }

	      if (currLoc.leaf.keys[currLoc.index] <= upperBound && options.upperInclusive === true) {
	        result = result.concat(currLoc.leaf.values[currLoc.index]);
	      }

	      if (options.sortDescending === true) {
	        result.reverse();
	      }

	      return result;
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
	    key: '_stepForward',
	    value: function _stepForward(index, leaf) {
	      if (index + 1 < leaf.keys.length) {
	        return { index: index + 1, leaf: leaf };
	      } else if (leaf.next) {
	        return { index: 0, leaf: leaf.next };
	      } else {
	        return null;
	      }
	    }
	  }, {
	    key: '_stepBackward',
	    value: function _stepBackward(index, leaf) {
	      if (index - 1 < 0) {
	        return { index: index - 1, leaf: leaf };
	      } else if (leaf.prev) {
	        return { index: leaf.prev.keys.length - 1, leaf: leaf.prev };
	      } else {
	        return null;
	      }
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
	        var loc = utils.binarySearch(leaf.keys, key);
	        var index = loc.found ? loc.index + 1 : loc.index;
	        return this._findLeaf(key, leaf.children[index]);
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
	        leftLeaf.children = children.slice(0, splitPoint);
	        leftLeaf.keys = keys.slice(0, splitPoint);
	        leftLeaf.values = values.slice(0, splitPoint);

	        rightLeaf.parent = parent;
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
	            leftLeaf.next = rightLeaf;
	            rightLeaf.prev = leftLeaf;
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

	            if (childPos !== 0) {
	              utils.replaceAt(parent.keys, leftLeaf.keys[0], childPos - 1);
	            }
	            utils.replaceAt(parent.children, leftLeaf, childPos);
	            utils.insertAt(parent.keys, rightLeaf.keys[0], childPos);
	            utils.insertAt(parent.children, rightLeaf, childPos + 1);

	            leftLeaf.prev = leaf.prev;
	            leftLeaf.next = rightLeaf;
	            rightLeaf.prev = leftLeaf;
	            rightLeaf.next = leaf.next;

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
	            } else {
	              rightSibling.keys = leaf.keys.concat(rightSibling.keys);
	              rightSibling.values = leaf.values.concat(rightSibling.values);
	            }

	            if (leaf.prev) {
	              leaf.prev.next = leaf.next;
	            }
	            if (leaf.next) {
	              leaf.next.prev = leaf.prev;
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
	    value: function ejectData(key, val) {
	      var keyLocation = utils.binarySearch(this.keys, key);
	      if (keyLocation.found) {
	        if (typeof val === 'undefined') {
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
	        return [];
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
	          keys.push(utils.detectKey(child));
	        }
	        if (keys.length > 0) {
	          this.keys = keys;
	        }
	      }
	    }
	  }]);

	  return Leaf;
	})();

	module.exports = Leaf;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	// Some code taken with gratitiude from the LokiJS project. Thank you Joe Minichino!

	var utils = {

	  defaultSort: function defaultSort(a, b) {
	    return a < b ? -1 : a > b ? 1 : 0;
	  },

	  // sortedInsert: (key, array) => {
	  //   array.splice(utils.insertionPoint(key, array) + 1, 0, key)
	  //   return array
	  // },

	  // mergeObj: (obj1, obj2) => {
	  //   for (var attrname in obj2) {
	  //     obj1[attrname] = obj2[attrname]
	  //   }
	  //   return obj1
	  // },

	  mergeObj: function mergeObj(o1, o2) {
	    if (o1 == null || o2 == null) {
	      return o1;
	    }

	    for (var key in o2) {
	      if (o2.hasOwnProperty(key)) {
	        o1[key] = o2[key];
	      }
	    }

	    return o1;
	  },

	  unique_id: function unique_id() {
	    return '' + (Math.random() + 1).toString(36).substr(2);
	  },

	  insertAt: function insertAt(array, value, index) {
	    array.splice(index, 0, value);
	    return array;
	  },

	  removeAt: function removeAt(array, index) {
	    array.splice(index, 1);
	    return array;
	  },

	  replaceAt: function replaceAt(array, value, index) {
	    array[index] = value;
	    return array;
	  },

	  // insertionPoint: (array, value, start, end) => {
	  //   start = start || 0
	  //   end = end || array.length
	  //   var pivot = parseInt(start + (end - start) / 2, 10)
	  //   if (end - start <= 1 || array[pivot] === value) {
	  //     return pivot
	  //   }
	  //   if (array[pivot] < value) {
	  //     return utils.insertionPoint(value, array, pivot, end)
	  //   } else {
	  //     return utils.insertionPoint(value, array, start, pivot)
	  //   }
	  // },

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
	  },

	  detectKey: function detectKey(node) {
	    if (node.hasChildren()) {
	      return utils.detectKey(node.children[0]);
	    } else {
	      return node.keys[0];
	    }
	  }

	};

	module.exports = utils;

/***/ }
/******/ ])
});
;